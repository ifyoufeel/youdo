/* Expo Router's <Tabs> driven by a custom tabBar renderer using the
   already-ported TabBar (Phase 2) — 5 tabs, identical treatment, no
   distinct FAB for Post, matching preview/app.js's own TabBar exactly.
   Not typed against @react-navigation/bottom-tabs directly (a transitive
   dependency, not a declared one) — the tabBar render prop's shape is
   small enough to type locally for exactly what this adapter reads. */
import { Tabs } from "expo-router";
import { TabBar, type TabBarItem } from "@design/components/TabBar";
import type { IconName } from "@design/components/Icon";
import { t } from "../../src/i18n/t";

const TAB_META: Record<string, { label: string; icon: IconName }> = {
  index: { label: t("tabs.browse"), icon: "search" },
  quests: { label: t("tabs.quests"), icon: "list-checks" },
  post: { label: t("tabs.post"), icon: "plus" },
  chats: { label: t("tabs.chats"), icon: "message-circle" },
  profile: { label: t("tabs.profile"), icon: "user" },
};

export interface TabBarRenderProps {
  state: { routes: { key: string; name: string }[]; index: number };
  navigation: { navigate: (routeName: string) => void };
}

export function CustomTabBar({ state, navigation }: TabBarRenderProps) {
  const items: TabBarItem[] = state.routes.map((route) => {
    const meta = TAB_META[route.name] ?? { label: route.name, icon: "home" as IconName };
    return { key: route.name, label: meta.label, icon: meta.icon };
  });
  const value = state.routes[state.index]?.name ?? "index";

  return <TabBar items={items} value={value} onChange={(key) => navigation.navigate(key)} />;
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="quests" />
      <Tabs.Screen name="post" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
