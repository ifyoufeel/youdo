/* Ports the identity-and-wallet slice of preview/app.js's ProfileScreen
   (3323-3466) — deliberately not the whole thing. Trust (rating, cancel
   rate, "what people said"), saved quests, and settings all stay M6's
   job, same scope discipline this codebase has applied at every prior
   milestone boundary (M2's slab actions, M3's post wizard, M4's lifecycle
   screens). What M5 needs real is the wallet, so that's what's here:
   identity line, WalletCard, and the full ledger history (PRD §7.7 —
   no row cap). */
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@design/components/Screen";
import { Card } from "@design/components/Card";
import { Avatar } from "@design/components/Avatar";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { useRepository, useNow } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { useMyQuests } from "@features/my-quests/useMyQuests";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { useWallet } from "../wallet/useWallet";
import { useDeposit } from "../wallet/useDeposit";
import { useCashOut } from "../wallet/useCashOut";
import { WalletCard } from "../wallet/WalletCard";
import { WalletHistory } from "../wallet/WalletHistory";
import { DepositSheet } from "../wallet/DepositSheet";
import { CashOutSheet } from "../wallet/CashOutSheet";

const NAME_FONT = fontFamilyName(raw.font.display, raw.fontWeight.black);
const META_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const SECTION_LABEL_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);

export function ProfileScreen() {
  const router = useRouter();
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;
  const wallet = useWallet();
  const myQuests = useMyQuests();
  const deposit = useDeposit();
  const cashOut = useCashOut();

  const [depositOpen, setDepositOpen] = useState(false);
  const [cashOutOpen, setCashOutOpen] = useState(false);
  const now = useNow();

  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => repository.getUser(userId as string),
    enabled: !!userId,
  });

  if (userQuery.isLoading || wallet.isLoading) {
    return (
      <Screen title={t("tabs.profile")}>
        <LoadingState />
      </Screen>
    );
  }
  if (userQuery.isError || wallet.isError || !userQuery.data) {
    return (
      <Screen title={t("tabs.profile")}>
        <ErrorState onRetry={userQuery.refetch} />
      </Screen>
    );
  }

  const me = userQuery.data;

  const titleById = new Map<string, string>();
  for (const bucket of Object.values(myQuests.buckets)) {
    for (const e of bucket) titleById.set(e.quest.id, e.quest.title);
  }

  return (
    <Screen title={t("tabs.profile")}>
      <Card padding="lg">
        <View style={styles.identityRow}>
          <Avatar name={me.name} size="lg" verified={me.verified} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{me.name}</Text>
            <Text style={styles.meta}>{me.area}</Text>
          </View>
        </View>
      </Card>

      <WalletCard
        availableMinor={wallet.available}
        heldMinor={wallet.held}
        incomingMinor={wallet.incoming}
        onAddMoney={() => setDepositOpen(true)}
        onCashOut={() => setCashOutOpen(true)}
        testID="profile-wallet-card"
      />

      <Text style={styles.sectionLabel}>{t("wallet.historyTitle")}</Text>
      <WalletHistory
        history={wallet.history}
        pendingPayments={wallet.pendingPayments}
        failedPayments={wallet.failedPayments}
        now={now}
        resolveTitle={(questId) => titleById.get(questId) ?? null}
        onBrowse={() => router.push("/")}
        testID="profile-wallet-history"
      />

      <DepositSheet
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSubmit={(amountMinor) => {
          setDepositOpen(false);
          deposit.mutate(amountMinor);
        }}
        bank={me.bank}
        availableMinor={wallet.available}
        submitting={deposit.isPending}
      />
      <CashOutSheet
        open={cashOutOpen}
        onClose={() => setCashOutOpen(false)}
        onSubmit={(amountMinor) => {
          setCashOutOpen(false);
          cashOut.mutate(amountMinor);
        }}
        bank={me.bank}
        spendableMinor={wallet.spendable}
        submitting={cashOut.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: NAME_FONT,
    fontSize: raw.fontSize.xl,
    letterSpacing: raw.letterSpacing.heading,
    color: semantic.color.text.primary,
  },
  meta: {
    fontFamily: META_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
    marginTop: 3,
  },
  sectionLabel: {
    fontFamily: SECTION_LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
    marginTop: 4,
  },
});
