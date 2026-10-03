/* M8's catch-all for a feature-screen render error — nothing in this
   codebase had one before (every prior milestone let React Native's own
   uncaught-error handling take over: a red screen in dev, a crash in
   prod). React's error-boundary API has no hook equivalent — this has to
   be a class component; nothing else here needs to be one.

   Deliberately resets by remounting its children (a fresh `key`) rather
   than trying to recover the crashed subtree's own state — the state
   that got it into a broken render is exactly what shouldn't survive a
   retry. */
import { Component, type ReactNode } from "react";
import { View } from "react-native";
import { Screen } from "./Screen";
import { ErrorState } from "./ErrorState";
import { t } from "../../i18n/t";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  resetCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetCount: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // No crash-reporting service is wired up yet (M8's checklist item,
    // not built in this code-only slice — see docs/DECISIONS.md's
    // ADR-016) — console.error is the only real signal today, matching
    // what would otherwise be an uncaught exception's own default
    // logging.
    console.error("ErrorBoundary caught a render error", error);
  }

  handleRetry = () => {
    this.setState((prev) => ({ hasError: false, resetCount: prev.resetCount + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <Screen testID="error-boundary-fallback">
          <ErrorState message={t("common.appCrashed")} onRetry={this.handleRetry} testID="error-boundary-retry" />
        </Screen>
      );
    }
    return (
      <View key={this.state.resetCount} style={{ flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}
