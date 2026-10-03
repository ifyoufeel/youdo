/* ADR-008: the preview rail itself (tokens.tsx, components.tsx, and every
   screen/flow gallery M1+ adds) ships in every build — it's a real,
   reviewable product surface, not dev-only. Only the strip layered on top
   of it (ADR-009's actor switcher + clock, ADR-008's fault-injection
   switch) is dev-only: `__DEV__` is false in a release/production Metro
   bundle (including `expo export -p web`'s default), so that gate is
   structural, not a convention someone could forget to apply per screen. */
import { Slot } from "expo-router";
import { View, StyleSheet } from "react-native";
import { PreviewControlsProvider } from "./_components/PreviewControls";
import { DevStrip } from "./_components/DevStrip";

export default function PreviewLayout() {
  return (
    <PreviewControlsProvider>
      <View style={styles.container}>
        {__DEV__ ? <DevStrip /> : null}
        <View style={styles.content}>
          <Slot />
        </View>
      </View>
    </PreviewControlsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
