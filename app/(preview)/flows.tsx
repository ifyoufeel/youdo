/* ADR-008's "flows (scripted two-sided walkthroughs)" — first flows.tsx
   entry: sign-in → browse → filter → save, M1's own headline flow,
   extended by M2 into sign-in → browse → detail → offer → confirmation,
   and now by M3 into a real post → discoverable → My Quests loop.
   Tapping a card in the Browse frame is real in-app navigation (the same
   router.push BrowseScreen always used), so it lands on the actual
   /quest/[id] route, outside this frame's bounds and back under
   app/_layout.tsx's own root providers, not this page's — a reviewer can
   sign in, search, tap a card, make an offer, see the confirmation toast,
   and use the browser's back button to return here, exactly as a real
   user would. That's why frames 2-4 use AutoSignInAmbient (signs in
   against the ambient root session) rather than AutoSignedIn (an
   isolated one, still right for frame 1's standalone SignInScreen demo
   and for screens.tsx's specimens, none of which navigate away): an
   isolated session would vanish the moment any of these frames' real
   navigation left its own provider subtree. Frame 4's PostQuestScreen
   submits by navigating to /quests?posted=1 for real — leaving this
   page entirely, landing on the actual My Quests tab with its real
   confirmation toast and the just-posted quest's own card, the same way
   frame 2's card tap already leaves for the real quest-detail route.
   Frame 3 (QuestDetailScreen on one of the signed-in demo user's own
   posted quests) still substitutes for a dev actor switcher the same way
   M1's Browse gallery originally called for. Frames 5-6 (M4) extend the
   same real-navigation discipline: frame 5's "Review offers" tap lands
   on the actual /offers/[id] route, where accepting one of the three
   real pending offers on q6 triggers the live acceptOffer mutation — the
   other two auto-decline for real; frame 6's "Mark as done" on q1
   triggers the live markDone mutation and renders ConfirmWindow's
   countdown for real. Frames 7-9 (M5) close the money loop for real, all
   sharing the same ambient wallet a LiveWalletStrip reads live above
   each one: frame 7's "Confirm and pay" on q7 releases real escrow;
   frame 8 seeds one real oversized offer on q6 (SeedShortfallOffer, via
   the real sendOffer port, not a mock) so the shortfall warning, the
   contextual DepositSheet, and a real accept afterward all have
   something genuine to react to; frame 9 starts/completes q11 then asks
   the reviewer to use the DevStrip's own +3d button (ADR-009's clock,
   already ambient above every (preview) route) to sweep the 72h confirm
   window for real — put last since advancing the clock is one-way for
   this whole page, per risk flag #2 in the M5 plan. */
import { useEffect, useState, type ReactNode } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { RepositoryProvider, useRepository } from "@data/composition-root";
import { AuthSessionProvider } from "@data/auth-session";
import { money, formatMoney } from "@data/contracts";
import { newIdempotencyKey } from "@lib/idempotency";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import SignInScreen from "@features/onboarding/SignInScreen";
import { BrowseScreen } from "@features/browse/BrowseScreen";
import { QuestDetailScreen } from "@features/quest-detail/QuestDetailScreen";
import { PostQuestScreen } from "@features/post-quest/PostQuestScreen";
import { MyQuestsScreen } from "@features/my-quests/MyQuestsScreen";
import { OfferInboxScreen } from "@features/offer-inbox/OfferInboxScreen";
import { LoadingState } from "@design/components/LoadingState";
import { useWallet } from "@features/wallet/useWallet";
import { AutoSignInAmbient } from "./_components/AutoSignInAmbient";

const HEADING_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const LABEL_FONT = fontFamilyName(raw.font.mono, raw.fontWeight.regular);

function FlowFrame({ children }: { children: ReactNode }) {
  return <View style={styles.frame}>{children}</View>;
}

/* A compact, always-visible readout of the real wallet — reads
   useWallet() against the same ambient session/query cache the frame's
   own screen does, so a mutation made below (confirm-and-pay, an
   auto-release swept in by the DevStrip's +3d button) shows up here the
   moment that query invalidates, with no extra wiring. */
function LiveWalletStrip() {
  const wallet = useWallet();
  return (
    <View style={styles.walletStrip}>
      <Text style={styles.walletStripText}>
        Available {formatMoney(money(wallet.available))} · Held {formatMoney(money(wallet.held))} · Coming{" "}
        {formatMoney(money(wallet.incoming))}
      </Text>
    </View>
  );
}

const SHORTFALL_DOER_ID = "u9";
const SHORTFALL_AMOUNT_MINOR = 99999900; // larger than any real wallet in the fixture

/* Seeds one real pending offer on q6, larger than u0's real balance,
   through the actual sendOffer port — not a mock — so frame 9 below has
   a real shortfall to demonstrate without permanently draining u0's own
   wallet (every other frame in this gallery shares that same balance).
   Best-effort: if q6 is no longer open (a reviewer already accepted an
   offer on it in frame 3 or 5), this silently does nothing and the frame
   below just shows q6's real current state instead. */
function SeedShortfallOffer({ children }: { children: ReactNode }) {
  const repository = useRepository();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    repository
      .sendOffer("q6", SHORTFALL_DOER_ID, SHORTFALL_AMOUNT_MINOR, "A demo offer bigger than any real wallet.", {
        idempotencyKey: newIdempotencyKey(),
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return <LoadingState label="Setting up the demo…" />;
  return <>{children}</>;
}

export default function FlowsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Flow gallery</Text>
      <Text style={styles.intro}>
        Sign in → browse → filter → save → detail → offer → confirmation → post → discoverable → My
        quests → accept an offer → mark done. Each frame below is the real screen, wired to the real
        memory adapter — try it: sign in with Google in the first frame, then in the second search,
        open Sort and filter, tap a heart, then tap any quest that isn&apos;t your own to open its
        real detail page, make an offer, and watch the confirmation toast name the real poster.
        Browser back returns you here. The fourth frame is the real posting wizard — fill it in and
        submit to land for real on My Quests, with your new quest&apos;s own card and the &quot;Quest
        posted&quot; toast. The fifth and sixth frames (M4) close the loop for real: accept a pending
        offer and mark a quest done, both live mutations against the same memory adapter. The
        seventh through ninth frames (M5) make the money real too — confirm-and-pay releasing real
        escrow, a real wallet shortfall walked through Add money to a successful accept, and the
        72-hour confirm window swept for real via the dev strip&apos;s own clock. Try the ninth frame
        last — advancing the clock is one-way for the whole page.
      </Text>

      <Text style={styles.specimenLabel}>1 · Sign in — real AuthSessionProvider, memory adapter</Text>
      <FlowFrame>
        <RepositoryProvider>
          <AuthSessionProvider>
            <SignInScreen />
          </AuthSessionProvider>
        </RepositoryProvider>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        2 · Browse → filter → save → detail → offer — auto-signed-in, tap a card for the real
        quest-detail route
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <BrowseScreen />
        </AutoSignInAmbient>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        3 · Your own posted quest — trust panel replaced by a real offer count and &quot;Review 3
        offers&quot; button (M4)
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <QuestDetailScreen questId="q6" />
        </AutoSignInAmbient>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        4 · Post a quest — fill it in and submit for real; lands on My Quests with the real toast
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <PostQuestScreen />
        </AutoSignInAmbient>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        5 · My Quests → tap &quot;Review 3 offers&quot; on q6 for the real /offers/q6 route, then
        Accept one live — watch the other two auto-decline (M4)
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <MyQuestsScreen />
        </AutoSignInAmbient>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        6 · Your in-progress quest (q1) — tap &quot;Mark as done&quot; live and watch
        ConfirmWindow&apos;s countdown appear for real (M4)
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <QuestDetailScreen questId="q1" />
        </AutoSignInAmbient>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        7 · Your completed quest (q7) — tap &quot;Confirm and pay&quot; live and watch the wallet
        strip above flip Held to zero for real (M5)
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <LiveWalletStrip />
          <QuestDetailScreen questId="q7" />
        </AutoSignInAmbient>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        8 · Shortfall → Add money → Accept — a demo offer bigger than any real wallet is pending on
        q6; tap Accept on it to see the real shortfall warning, add money, then accept for real (M5)
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <SeedShortfallOffer>
            <OfferInboxScreen questId="q6" />
          </SeedShortfallOffer>
        </AutoSignInAmbient>
      </FlowFrame>

      <Text style={styles.specimenLabel}>
        9 · Clock-driven auto-release (M5) — your accepted-but-not-started quest (q11): tap
        &quot;Start quest&quot;, then &quot;Mark as done&quot;, then use the dev strip&apos;s own +3d
        button above to sweep the 72h confirm window — the wallet strip flips Coming into Available
        for real. The +3d advance is one-way for this whole page (every other frame shares the same
        clock), so try this one last.
      </Text>
      <FlowFrame>
        <AutoSignInAmbient>
          <LiveWalletStrip />
          <QuestDetailScreen questId="q11" />
        </AutoSignInAmbient>
      </FlowFrame>
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
  intro: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
  specimenLabel: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  walletStrip: {
    paddingVertical: 8,
    paddingHorizontal: raw.layout.gutterScreen,
    backgroundColor: semantic.color.surface.sunken,
    borderBottomWidth: raw.border.hair,
    borderBottomColor: semantic.color.border.default,
  },
  walletStripText: {
    fontFamily: LABEL_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  frame: {
    height: 640,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.default,
    borderRadius: raw.radius.sm,
    overflow: "hidden",
  },
});
