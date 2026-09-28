/* Ports app.js's OfferInboxScreen (2824-2938) in full now that M5's
   LedgerPort is real: the wallet-balance row, the short-by-this-much
   warning, and the "Add money" DepositSheet escape hatch (M4's header
   comment named all three as dropped pending exactly this) are restored
   here. useWallet() gives the signed-in user's real available/held —
   correct for this screen specifically because only a quest's own poster
   ever reaches this route (routing-level, same implicit-actor precedent
   OffersPort's own doc comment already flags as risk #1). */
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { EmptyState } from "@design/components/EmptyState";
import { Card } from "@design/components/Card";
import { Badge } from "@design/components/Badge";
import { Avatar } from "@design/components/Avatar";
import { InfoRow } from "@design/components/InfoRow";
import { FeeBreakdown } from "@design/components/FeeBreakdown";
import { Dialog } from "@design/components/Dialog";
import { Button } from "@design/components/Button";
import { Icon } from "@design/components/Icon";
import { money, formatMoney, type Offer } from "@data/contracts";
import { threadFor } from "@data/domain/threads";
import { useNow, useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { formatWhenAt } from "@lib/format";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useOfferInbox } from "./useOfferInbox";
import { useAcceptOffer } from "./useAcceptOffer";
import { useDeclineOffer } from "./useDeclineOffer";
import { OfferRow } from "./OfferRow";
import { useWallet } from "../wallet/useWallet";
import { useDeposit } from "../wallet/useDeposit";
import { DepositSheet } from "../wallet/DepositSheet";

const EYEBROW_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const DOER_NAME_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const DOER_AMOUNT_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);

export interface OfferInboxScreenProps {
  questId: string;
}

export function OfferInboxScreen({ questId }: OfferInboxScreenProps) {
  const router = useRouter();
  const repository = useRepository();
  const { session } = useAuthSession();
  const inbox = useOfferInbox(questId);
  const acceptOffer = useAcceptOffer(questId);
  const declineOffer = useDeclineOffer(questId);
  const wallet = useWallet();
  const deposit = useDeposit();
  const [confirming, setConfirming] = useState<Offer | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const now = useNow();

  const userQuery = useQuery({
    queryKey: ["users", session?.userId],
    queryFn: () => repository.getUser(session?.userId as string),
    enabled: !!session?.userId,
  });

  if (inbox.isLoading) {
    return (
      <Screen title={t("offerInbox.title")} onBack={() => router.back()}>
        <LoadingState />
      </Screen>
    );
  }
  if (inbox.isError) {
    return (
      <Screen title={t("offerInbox.title")} onBack={() => router.back()}>
        <ErrorState onRetry={inbox.refetch} />
      </Screen>
    );
  }
  if (!inbox.quest) {
    return (
      <Screen title={t("offerInbox.title")} onBack={() => router.back()}>
        <EmptyState title={t("offerInbox.questGone")} />
      </Screen>
    );
  }

  const { quest, pending, decided, doers } = inbox;
  const offersOpen = Date.parse(quest.expiresAt) > now;
  const confirmingDoer = confirming ? (doers.get(confirming.doerId) ?? null) : null;
  const otherPendingCount = confirming ? pending.length - 1 : 0;
  const short = confirming ? Math.max(0, confirming.amountMinor - wallet.available) : 0;

  return (
    <Screen title={t("offerInbox.title")} subtitle={quest.title} onBack={() => router.back()}>
      <Card variant="sunken" padding="md">
        <InfoRow icon="coins" label={t("offerInbox.asking")} value={formatMoney(money(quest.payoutMinor))} />
        <InfoRow icon="wallet" label={t("offerInbox.wallet")} value={formatMoney(money(wallet.available))} />
        <InfoRow
          icon="clock"
          label={t("offerInbox.offersClose")}
          value={offersOpen ? formatWhenAt(quest.expiresAt, now) : t("offerInbox.closed")}
        />
      </Card>

      {pending.length === 0 ? (
        <EmptyState
          title={decided.length > 0 ? t("offerInbox.empty.decided") : t("offerInbox.empty.none")}
          action={t("offerInbox.backToQuest")}
          onAction={() => router.back()}
        />
      ) : (
        <>
          <Text style={styles.eyebrow}>
            {t("offerInbox.pendingCount", { count: pending.length, noun: pending.length === 1 ? "offer" : "offers" })}
          </Text>
          {pending.map((offer) => {
            const offerThread = threadFor(inbox.threads, questId, offer.doerId);
            return (
              <OfferRow
                key={offer.id}
                offer={offer}
                doer={doers.get(offer.doerId) ?? null}
                askingPriceMinor={quest.payoutMinor}
                now={now}
                onAccept={() => setConfirming(offer)}
                onDecline={() => declineOffer.mutate(offer.id)}
                onMessage={offerThread ? () => router.push(`/chats/${offerThread.id}`) : undefined}
                testID={`offer-row-${offer.id}`}
              />
            );
          })}
        </>
      )}

      {decided.length > 0 ? (
        <>
          <Text style={[styles.eyebrow, styles.decidedEyebrow]}>{t("offerInbox.alreadyAnswered")}</Text>
          {decided.map((offer) => {
            const doer = doers.get(offer.doerId);
            return (
              <Card key={offer.id} variant="flat" padding="sm">
                <View style={styles.decidedRow}>
                  {doer ? <Avatar name={doer.name} size="sm" verified={doer.verified} /> : null}
                  <Text style={styles.decidedName} numberOfLines={1}>
                    {doer?.name ?? ""}
                  </Text>
                  <Text style={styles.decidedAmount}>{formatMoney(money(offer.amountMinor))}</Text>
                  <Badge label={offer.status} size="sm" tone={offer.status === "accepted" ? "success" : "neutral"} />
                </View>
              </Card>
            );
          })}
        </>
      ) : null}

      <Dialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title={t("offerInbox.confirmTitle")}
        subtitle={confirmingDoer ? t("offerInbox.confirmSubtitle", { name: confirmingDoer.name }) : undefined}
        actions={
          <>
            <Button variant="ghost" onPress={() => setConfirming(null)}>
              {t("offerInbox.back")}
            </Button>
            <Button
              variant="money"
              fullWidth
              icon="check"
              disabled={acceptOffer.isPending || short > 0}
              onPress={() => {
                if (!confirming) return;
                const offerId = confirming.id;
                setConfirming(null);
                acceptOffer.mutate(offerId);
              }}
              testID="accept-offer-submit"
            >
              {t("offerInbox.acceptButton")}
            </Button>
          </>
        }
      >
        {confirming ? (
          <>
            <FeeBreakdown
              amountMinor={confirming.amountMinor}
              note={t("offerInbox.feeNote", {
                amount: formatMoney(money(confirming.amountMinor)),
                name: confirmingDoer?.name ?? "",
              })}
            />
            <Card variant="sunken" padding="md">
              <InfoRow icon="wallet" label={t("offerInbox.wallet")} value={formatMoney(money(wallet.available))} />
              <InfoRow icon="lock" label={t("offerInbox.heldAfter")} value={formatMoney(money(wallet.held + confirming.amountMinor))} />
            </Card>
            {short > 0 ? (
              <Card padding="md" style={styles.shortCard}>
                <View style={styles.shortRow}>
                  <Icon name="alert-triangle" size={17} color={raw.color.danger["600"]} style={styles.shortIcon} />
                  <Text style={styles.shortText}>{t("offerInbox.shortWarning", { amount: formatMoney(money(short)) })}</Text>
                </View>
                <Button variant="money" size="sm" icon="plus" fullWidth style={styles.addMoneyButton} onPress={() => setDepositOpen(true)}>
                  {t("offerInbox.addMoney")}
                </Button>
              </Card>
            ) : null}
            {otherPendingCount > 0 ? (
              <Text style={styles.autoDeclineNote}>
                {t("offerInbox.autoDeclineNote", {
                  count: otherPendingCount,
                  noun: otherPendingCount === 1 ? "offer is" : "offers are",
                })}
              </Text>
            ) : null}
          </>
        ) : null}
      </Dialog>

      <DepositSheet
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSubmit={(amountMinor) => {
          setDepositOpen(false);
          deposit.mutate(amountMinor);
        }}
        bank={userQuery.data?.bank ?? ""}
        availableMinor={wallet.available}
        presetMinor={short}
        reason={short > 0 ? t("offerInbox.depositReason", { amount: formatMoney(money(short)) }) : undefined}
        submitting={deposit.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: EYEBROW_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
  },
  decidedEyebrow: {
    marginTop: 8,
  },
  decidedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  decidedName: {
    flex: 1,
    minWidth: 0,
    fontFamily: DOER_NAME_FONT,
    fontSize: raw.fontSize.sm,
    color: semantic.color.text.primary,
  },
  decidedAmount: {
    fontFamily: DOER_AMOUNT_FONT,
    fontSize: raw.fontSize["2xs"],
    color: raw.color.ink["400"],
  },
  autoDeclineNote: {
    fontFamily: DOER_NAME_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
  shortCard: {
    borderColor: semantic.color.text.danger,
  },
  shortRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  shortIcon: {
    marginTop: 1,
  },
  shortText: {
    flex: 1,
    fontFamily: DOER_NAME_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: semantic.color.text.primary,
  },
  addMoneyButton: {
    marginTop: 10,
  },
});
