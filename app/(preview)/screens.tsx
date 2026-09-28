/* ADR-008's registry: "screens (empty / loading / error / full / long-
   content)". First screens.tsx entry — the Screen shell (Phase 2 of M1)
   in its four states. Each is a real, standalone Screen render, not a
   mockup — proving the shell + EmptyState/LoadingState/ErrorState
   actually compose the way a real feature screen will use them. */
import { useEffect, useState, type ReactNode } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Screen } from "@design/components/Screen";
import { EmptyState } from "@design/components/EmptyState";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { QuestCard } from "@design/components/QuestCard";
import { Card } from "@design/components/Card";
import { Button } from "@design/components/Button";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../src/i18n/t";
import type { Payment } from "@data/contracts";
import { OnboardingProvider, useOnboardingDraft } from "@features/onboarding/OnboardingContext";
import WelcomeScreen from "@features/onboarding/WelcomeScreen";
import LocationScreen from "@features/onboarding/LocationScreen";
import SignInScreen from "@features/onboarding/SignInScreen";
import ContactScreen from "@features/onboarding/ContactScreen";
import CodeScreen from "@features/onboarding/CodeScreen";
import { QuestDetailScreen } from "@features/quest-detail/QuestDetailScreen";
import { PostQuestScreen } from "@features/post-quest/PostQuestScreen";
import { MyQuestsScreen } from "@features/my-quests/MyQuestsScreen";
import { ChatsScreen } from "@features/chats/ChatsScreen";
import { ThreadScreen } from "@features/chats/ThreadScreen";
import { OfferInboxScreen } from "@features/offer-inbox/OfferInboxScreen";
import { NotificationsScreen } from "@features/notifications/NotificationsScreen";
import { WalletCard } from "@features/wallet/WalletCard";
import { WalletHistory } from "@features/wallet/WalletHistory";
import { DepositSheet } from "@features/wallet/DepositSheet";
import { CashOutSheet } from "@features/wallet/CashOutSheet";
import type { WalletHistoryRow } from "@features/wallet/useWallet";
import { ProfileScreen } from "@features/profile/ProfileScreen";
import { AutoSignedIn } from "./_components/AutoSignedIn";

const HEADING_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const LABEL_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);

function SectionHeading({ children }: { children: string }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

/* Each specimen is a fixed-height frame around a real <Screen> — Screen
   itself wants to fill its container (SafeAreaView flex:1), so the frame
   gives it something bounded to fill inside this scrolling gallery. */
function ScreenFrame({ children, tall = false }: { children: ReactNode; tall?: boolean }) {
  return <View style={[styles.frame, tall ? styles.frameTall : null]}>{children}</View>;
}

/* Pre-populates OnboardingContext's draft so the Contact/Code specimens
   below can show the invalid-email and wrong-code failure states
   directly, per ADR-012's "every screen and both failure paths are also
   in the States gallery." */
function SeedDraft({
  contact,
  contactError,
  code,
  codeError,
}: {
  contact?: string;
  contactError?: string;
  code?: string;
  codeError?: string;
}) {
  const draft = useOnboardingDraft();
  useEffect(() => {
    if (contact !== undefined) draft.setContact(contact);
    if (contactError !== undefined) draft.setContactError(contactError);
    if (code !== undefined) draft.setCode(code);
    if (codeError !== undefined) draft.setCodeError(codeError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

const WALLET_NOW = Date.parse("2026-09-16T09:00:00+08:00"); // seed.now itself

/* One synthetic row per real WalletRowKind (domain/ledger.ts's
   classifyWalletRow) — the seed's own real history only ever produces 4
   of the 7 kinds for one user, so this set is fabricated to show every
   face the wallet can put on a transaction. */
const WALLET_HISTORY_ROWS: WalletHistoryRow[] = [
  { txnId: "spec-held", at: "2026-09-16T08:00:00+08:00", memo: "Held for a quest", questId: "q6", kind: "held", amountMinor: -25000, signed: true },
  { txnId: "spec-released", at: "2026-09-15T18:00:00+08:00", memo: "Released to the doer", questId: "q1", kind: "released", amountMinor: 40000, signed: false },
  { txnId: "spec-refunded", at: "2026-09-15T09:00:00+08:00", memo: "Refunded after cancellation", questId: "q9", kind: "refunded", amountMinor: 50000, signed: true },
  { txnId: "spec-paid-in", at: "2026-09-14T20:00:00+08:00", memo: "Quest paid", questId: "q8", kind: "paid_in", amountMinor: 31500, signed: true },
  { txnId: "spec-added", at: "2026-09-13T12:00:00+08:00", memo: "Added from CTBC •••• 4417", questId: null, kind: "added", amountMinor: 100000, signed: true },
  { txnId: "spec-sent", at: "2026-09-10T16:00:00+08:00", memo: "Cash out to CTBC •••• 4417", questId: null, kind: "sent", amountMinor: -150000, signed: true },
];

function specimenPayment(overrides: Partial<Payment>): Payment {
  return {
    id: "spec-pay",
    txnId: "spec-pay-tx",
    kind: "deposit",
    userId: "u0",
    amountMinor: 50000,
    state: "pending",
    provider: "simulated",
    providerId: "spec-sim",
    createdAt: "2026-09-16T08:55:00+08:00",
    settledAt: null,
    ...overrides,
  };
}

/* Mirrors DialogGallery's own toggle-button pattern (components.tsx) —
   DepositSheet/CashOutSheet are Dialogs, so the gallery shows them via a
   real open/close toggle rather than a permanently-open sheet. */
function WalletSheetsGallery() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [shortfallOpen, setShortfallOpen] = useState(false);
  const [cashOutOpen, setCashOutOpen] = useState(false);

  return (
    <View style={styles.buttonRow}>
      <Button variant="secondary" size="sm" onPress={() => setDepositOpen(true)}>
        Open Deposit sheet
      </Button>
      <Button variant="secondary" size="sm" onPress={() => setShortfallOpen(true)}>
        Open Deposit — shortfall trigger
      </Button>
      <Button variant="secondary" size="sm" onPress={() => setCashOutOpen(true)}>
        Open Cash out sheet
      </Button>

      <DepositSheet
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSubmit={() => setDepositOpen(false)}
        bank="CTBC •••• 4417"
        availableMinor={535500}
      />
      <DepositSheet
        open={shortfallOpen}
        onClose={() => setShortfallOpen(false)}
        onSubmit={() => setShortfallOpen(false)}
        bank="CTBC •••• 4417"
        availableMinor={15500}
        presetMinor={9500}
        reason="You're NT$95 short of holding this offer. Adding at least that much lets you accept it."
      />
      <CashOutSheet
        open={cashOutOpen}
        onClose={() => setCashOutOpen(false)}
        onSubmit={() => setCashOutOpen(false)}
        bank="CTBC •••• 4417"
        spendableMinor={535500}
      />
    </View>
  );
}

export default function ScreensScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Screen gallery</Text>

      <SectionHeading>Empty</SectionHeading>
      <Text style={styles.specimenLabel}>Screen · EmptyState · with a named next action</Text>
      <ScreenFrame>
        <Screen title="Browse">
          <EmptyState title="No quests nearby yet" action="Widen search" onAction={() => {}} />
        </Screen>
      </ScreenFrame>

      <SectionHeading>Loading</SectionHeading>
      <Text style={styles.specimenLabel}>Screen · LoadingState · no shimmer, per the design system&apos;s own rule</Text>
      <ScreenFrame>
        <Screen title="Browse">
          <LoadingState label="Finding quests near you…" />
        </Screen>
      </ScreenFrame>

      <SectionHeading>Error</SectionHeading>
      <Text style={styles.specimenLabel}>Screen · ErrorState · written as a fix, with a real retry action</Text>
      <ScreenFrame>
        <Screen title="Browse">
          <ErrorState onRetry={() => {}} />
        </Screen>
      </ScreenFrame>

      <SectionHeading>Full</SectionHeading>
      <Text style={styles.specimenLabel}>Screen · populated body · TopBar back + Slab action</Text>
      <ScreenFrame>
        <Screen
          title="Quest detail"
          subtitle="Da'an · 5 min walk"
          onBack={() => {}}
          slab={
            <Button variant="primary" fullWidth onPress={() => {}}>
              Accept offer
            </Button>
          }
        >
          <Card padding="md">
            <Text>Walk Biscuit for an hour — NT$400</Text>
          </Card>
          <Card padding="md">
            <Text>A very slow beagle who stops at every tree.</Text>
          </Card>
        </Screen>
      </ScreenFrame>

      <SectionHeading>Browse — every state (M1 Phase 8/9)</SectionHeading>

      <Text style={styles.specimenLabel}>Empty · real copy, real &quot;Widen search&quot; action</Text>
      <ScreenFrame>
        <Screen title={t("tabs.browse")} wordmark>
          <EmptyState title={t("browse.empty")} action={t("browse.emptyAction.widen")} onAction={() => {}} />
        </Screen>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Empty, narrowed by search/filters · real copy, real &quot;Clear filters&quot; action</Text>
      <ScreenFrame>
        <Screen title={t("tabs.browse")} wordmark>
          <EmptyState title={t("browse.emptyNarrowed")} action={t("browse.emptyAction.clear")} onAction={() => {}} />
        </Screen>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Loading · the feed&apos;s first page</Text>
      <ScreenFrame>
        <Screen title={t("tabs.browse")} wordmark>
          <LoadingState />
        </Screen>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Error · listQuests failed (repository fault-injection), real retry action</Text>
      <ScreenFrame>
        <Screen title={t("tabs.browse")} wordmark>
          <ErrorState onRetry={() => {}} />
        </Screen>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Full · real QuestCard specimens, mine vs. someone else&apos;s</Text>
      <ScreenFrame>
        <Screen title={t("tabs.browse")} wordmark scroll={false} contentStyle={styles.browseFullContent}>
          <QuestCard
            variant="spacious"
            title="Assemble a wardrobe (2 boxes)"
            payout="NT$1,050"
            distance="3.9 km"
            duration="~3 hr"
            when="19 Sep, 11am"
            badges={[{ label: "Tools needed", tone: "warning", icon: "briefcase" }]}
            poster={{ name: "Mei-Ling W.", rating: 5, questsCompleted: 3, verified: true }}
            saved={false}
            onSave={() => {}}
          />
          <QuestCard
            variant="spacious-meta"
            title="Drop two bags at the recycling point"
            payout="NT$250"
            distance="Da'an"
            duration="~25 min"
            when="17 Sep, 2pm"
            category="Delivery"
            badges={[{ label: "No offers yet", tone: "neutral", icon: "user" }]}
          />
        </Screen>
      </ScreenFrame>

      <SectionHeading>Onboarding — every screen, both failure paths (ADR-012)</SectionHeading>

      <Text style={styles.specimenLabel}>Welcome</Text>
      <ScreenFrame>
        <WelcomeScreen />
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Location</Text>
      <ScreenFrame>
        <LocationScreen />
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Sign in</Text>
      <ScreenFrame>
        <SignInScreen />
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Contact</Text>
      <ScreenFrame>
        <OnboardingProvider>
          <ContactScreen />
        </OnboardingProvider>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Contact — failure: invalid email</Text>
      <ScreenFrame>
        <OnboardingProvider>
          <SeedDraft contact="not-an-email" contactError="Add a working email to send the code" />
          <ContactScreen />
        </OnboardingProvider>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Code</Text>
      <ScreenFrame>
        <OnboardingProvider>
          <SeedDraft contact="alex@example.tw" />
          <CodeScreen />
        </OnboardingProvider>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Code — failure: wrong code</Text>
      <ScreenFrame>
        <OnboardingProvider>
          <SeedDraft
            contact="alex@example.tw"
            code=""
            codeError="That code didn't match — check your messages and try again"
          />
          <CodeScreen />
        </OnboardingProvider>
      </ScreenFrame>

      <SectionHeading>Quest detail — every role (M2)</SectionHeading>
      <Text style={styles.specimenLabel}>
        Each frame below is the real screen, signed in as the one demo identity — different quest
        ids put that same signed-in user in a different role, substituting for a dev actor switcher
        (same call M1&apos;s Browse gallery made).
      </Text>

      <Text style={styles.specimenLabel}>Visitor · no offer yet, address hidden, both offer CTAs</Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <QuestDetailScreen questId="q4" />
        </AutoSignedIn>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Applicant · your own pending offer, real withdraw action</Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <QuestDetailScreen questId="q3" />
        </AutoSignedIn>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Poster · your own quest — real &quot;Review 3 offers&quot; button (M4)</Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <QuestDetailScreen questId="q6" />
        </AutoSignedIn>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>
        Doer · your offer was accepted, quest in progress — address visible, real Cancel + Mark as done slab (M4)
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <QuestDetailScreen questId="q1" />
        </AutoSignedIn>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>
        Doer · accepted but not yet started (q11) — real Cancel + Start quest slab (M4)
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <QuestDetailScreen questId="q11" />
        </AutoSignedIn>
      </ScreenFrame>

      <SectionHeading>Offer inbox (M4)</SectionHeading>
      <Text style={styles.specimenLabel}>
        Three real pending offers on your own quest — tap Accept to see the fee breakdown and
        auto-decline dialog for real.
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <OfferInboxScreen questId="q6" />
        </AutoSignedIn>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>Decided — the one offer you already accepted, no pending left</Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <OfferInboxScreen questId="q7" />
        </AutoSignedIn>
      </ScreenFrame>

      <SectionHeading>Post a quest (M3)</SectionHeading>
      <Text style={styles.specimenLabel}>
        The real wizard, auto-signed-in — interactive: fill in each step and submit yourself to see
        validation, the fee breakdown, and the review step&apos;s summary for real.
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <PostQuestScreen />
        </AutoSignedIn>
      </ScreenFrame>

      <SectionHeading>My quests (M3)</SectionHeading>
      <Text style={styles.specimenLabel}>
        The real screen, auto-signed-in — interactive: switch tabs to see the real Active/Offers/Done
        buckets from the signed-in demo identity&apos;s fixture engagements.
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <MyQuestsScreen />
        </AutoSignedIn>
      </ScreenFrame>

      <SectionHeading>Chats (M4)</SectionHeading>
      <Text style={styles.specimenLabel}>
        The real thread list, auto-signed-in — real unread badges and last-message previews from the
        signed-in demo identity&apos;s fixture threads.
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <ChatsScreen />
        </AutoSignedIn>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>
        One real thread (q1, with u0 as the accepted doer) — real messages, the address reveal card,
        and a live composer.
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <ThreadScreen threadId="t-q1-u0" />
        </AutoSignedIn>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>A closed thread (q8, paid) — read-only banner, no composer</Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <ThreadScreen threadId="t-q8-u0" />
        </AutoSignedIn>
      </ScreenFrame>

      <SectionHeading>Notifications (M4)</SectionHeading>
      <Text style={styles.specimenLabel}>
        The real screen — u0&apos;s seeded notifications, icon per type, unread rows visually distinct
        until the mount effect marks them all read.
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <NotificationsScreen />
        </AutoSignedIn>
      </ScreenFrame>

      <SectionHeading>Wallet (M5)</SectionHeading>

      <Text style={styles.specimenLabel}>WalletCard · held + incoming badges, both non-zero</Text>
      <ScreenFrame>
        <Screen title="Profile">
          <WalletCard availableMinor={535500} heldMinor={30000} incomingMinor={49500} onAddMoney={() => {}} onCashOut={() => {}} />
        </Screen>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>WalletCard · nothing held or coming — Cash out disabled at zero</Text>
      <ScreenFrame>
        <Screen title="Profile">
          <WalletCard availableMinor={0} heldMinor={0} incomingMinor={0} onAddMoney={() => {}} onCashOut={() => {}} />
        </Screen>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>
        WalletHistory · pending + failed payments first, then every real WalletRowKind
        (domain/ledger.ts&apos;s classifyWalletRow)
      </Text>
      <ScreenFrame tall>
        <Screen title="Profile">
          <WalletHistory
            history={WALLET_HISTORY_ROWS}
            pendingPayments={[specimenPayment({ id: "spec-pending", kind: "deposit", amountMinor: 50000, state: "pending" })]}
            failedPayments={[specimenPayment({ id: "spec-failed", kind: "cashout", amountMinor: 10000, state: "failed" })]}
            now={WALLET_NOW}
          />
        </Screen>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>WalletHistory · empty, with a real &quot;Find a quest&quot; action</Text>
      <ScreenFrame>
        <Screen title="Profile">
          <WalletHistory history={[]} pendingPayments={[]} failedPayments={[]} now={WALLET_NOW} onBrowse={() => {}} />
        </Screen>
      </ScreenFrame>

      <Text style={styles.specimenLabel}>
        DepositSheet / CashOutSheet — real Dialogs, opened via the buttons below (mirrors
        DialogGallery&apos;s own toggle pattern). The shortfall variant is the offer inbox&apos;s own
        contextual trigger, prefilled to the exact amount short.
      </Text>
      <ScreenFrame>
        <Screen title="Profile">
          <WalletSheetsGallery />
        </Screen>
      </ScreenFrame>

      <SectionHeading>Profile (M5)</SectionHeading>
      <Text style={styles.specimenLabel}>
        The real screen, auto-signed-in — real identity, real wallet balance/history, deposit and
        cash-out both wired to the live LedgerPort.
      </Text>
      <ScreenFrame tall>
        <AutoSignedIn>
          <ProfileScreen />
        </AutoSignedIn>
      </ScreenFrame>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: semantic.color.surface.page,
  },
  content: {
    padding: raw.layout.gutterScreen,
    gap: raw.layout.stackDefault,
  },
  title: {
    fontFamily: HEADING_FONT,
    fontSize: raw.fontSize["3xl"],
    color: semantic.color.text.primary,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  sectionHeading: {
    fontFamily: HEADING_FONT,
    fontSize: raw.fontSize.xl,
    color: semantic.color.text.primary,
    marginTop: raw.layout.stackLoose,
  },
  specimenLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  browseFullContent: {
    padding: raw.layout.gutterScreen,
    gap: raw.layout.stackDefault,
  },
  frame: {
    height: 420,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.default,
    borderRadius: raw.radius.sm,
    overflow: "hidden",
  },
  frameTall: {
    height: 680,
  },
});
