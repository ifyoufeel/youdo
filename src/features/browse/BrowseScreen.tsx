/* M1's landing tab. Screen(scroll=false) hands scrolling to FlashList
   itself (Screen's own doc comment calls out exactly this case — nesting
   a second ScrollView around a VirtualizedList triggers an RN warning).
   Search input, category chip row and result count scroll with the list
   as FlashList's ListHeaderComponent, matching preview/app.js's
   BrowseScreen layout. Sort/radius/min-pay/verified-only/today-only live
   in useBrowseFilters (Phase 9) and open through FilterSortSheet; search
   and categoryId stay local screen state since they're quick, always-
   visible controls, not sheet-gated ones. */
import { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@design/components/Screen";
import { Input } from "@design/components/Input";
import { Tag } from "@design/components/Tag";
import { IconButton } from "@design/components/IconButton";
import { QuestCard } from "@design/components/QuestCard";
import { EmptyState } from "@design/components/EmptyState";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { money, formatMoney, distanceBetween, type Quest } from "@data/contracts";
import type { QuestSort } from "@data/ports/quests";
import { formatDistance, formatDuration, formatWhenAt } from "@lib/format";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { questBadges } from "./questBadges";
import { useQuestsFeed } from "./useQuestsFeed";
import { useSaveQuest } from "./useSaveQuest";
import { useCategories } from "./useCategories";
import { usePosters } from "./usePosters";
import { useBrowseFilters } from "./useBrowseFilters";
import { FilterSortSheet } from "./FilterSortSheet";

/* The fixture's own categories list already carries {id: "all", label:
   "All"} as its first entry (preview/app.js's D.categories does too) —
   this is that same sentinel id, not a screen-invented one, so the
   category row below is a plain map over listCategories() with no
   synthetic "All" chip added on top. */
const ALL_CATEGORY = "all";
const COUNT_FONT = fontFamilyName(raw.font.text, raw.fontWeight.medium);
const SORT_LABEL: Record<QuestSort, string> = {
  closest: t("browse.sort.closest"),
  pay: t("browse.sort.pay"),
  ending: t("browse.sort.ending"),
  newest: t("browse.sort.newest"),
};

export function BrowseScreen() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>(ALL_CATEGORY);
  const [sheetOpen, setSheetOpen] = useState(false);

  const repository = useRepository();
  const { session } = useAuthSession();
  const meQuery = useQuery({
    queryKey: ["users", session?.userId],
    queryFn: () => repository.getUser(session!.userId),
    enabled: !!session,
  });

  const browseFilters = useBrowseFilters();
  const feed = useQuestsFeed({
    search,
    categoryId: categoryId === ALL_CATEGORY ? undefined : categoryId,
    radiusM: browseFilters.filters.radiusM,
    minPayMinor: browseFilters.filters.minPayMinor || undefined,
    todayOnly: browseFilters.filters.todayOnly || undefined,
    verifiedPostersOnly: browseFilters.filters.verifiedPostersOnly || undefined,
    sort: browseFilters.sort,
  });
  const { toggleSave } = useSaveQuest();
  const categoriesQuery = useCategories();
  const posters = usePosters(feed.quests.map((q) => q.posterId));

  const categoryLabel = useMemo(() => {
    const byId = new Map((categoriesQuery.data ?? []).map((c) => [c.id, c.label]));
    return (id: string) => byId.get(id) ?? id;
  }, [categoriesQuery.data]);

  // Captured once, not re-read on every render — badges/when-labels don't
  // need a live clock (same "no ticking countdown" stance as LoadingState).
  const [now] = useState(() => Date.now());
  const center = meQuery.data?.home;
  const narrowed = search.length > 0 || categoryId !== ALL_CATEGORY || !browseFilters.isDefault;

  function clearAll() {
    setSearch("");
    setCategoryId(ALL_CATEGORY);
    browseFilters.reset();
  }

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Quest>) => {
      const mine = item.posterId === session?.userId;
      const poster = posters.get(item.posterId);
      const saved = feed.savedIds.has(item.id);
      return (
        <QuestCard
          style={styles.card}
          variant={mine ? "spacious-meta" : "spacious"}
          title={item.title}
          payout={formatMoney(money(item.payoutMinor))}
          distance={mine || !center ? item.area : formatDistance(distanceBetween(item.point, center))}
          duration={formatDuration(item.estimatedMinutes)}
          when={formatWhenAt(item.scheduledFor, now)}
          category={categoryLabel(item.categoryId)}
          badges={questBadges(item, now)}
          poster={
            !mine && poster
              ? { name: poster.name, rating: poster.rating, questsCompleted: poster.questsCompleted, verified: poster.verified }
              : undefined
          }
          saved={saved}
          onSave={mine ? undefined : () => toggleSave(item.id, saved)}
        />
      );
    },
    [session?.userId, posters, feed.savedIds, center, now, categoryLabel, toggleSave]
  );

  function ListHeader() {
    return (
      <View style={styles.header}>
        <Input
          testID="browse-search"
          icon="search"
          placeholder={t("browse.searchPlaceholder")}
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.categoryRow}>
          {(categoriesQuery.data ?? []).map((c) => (
            <Tag
              key={c.id}
              testID={`browse-category-${c.id}`}
              selected={categoryId === c.id}
              onSelect={() => setCategoryId(c.id)}
              size="sm"
            >
              {c.label}
            </Tag>
          ))}
        </View>
        {!feed.isLoading && !feed.isError ? (
          <View style={styles.countRow}>
            <Text style={styles.count}>
              {t("browse.resultCount", {
                count: feed.quests.length,
                noun: feed.quests.length === 1 ? "quest" : "quests",
                sort: SORT_LABEL[browseFilters.sort],
              })}
            </Text>
            <IconButton
              icon="sliders-horizontal"
              accessibilityLabel={t("browse.sortAndFilter")}
              size="sm"
              active={!browseFilters.isDefault}
              onPress={() => setSheetOpen(true)}
              testID="browse-open-filters"
            />
          </View>
        ) : null}
      </View>
    );
  }

  function ListEmpty() {
    if (feed.isLoading) return <LoadingState />;
    if (feed.isError) return <ErrorState onRetry={feed.refresh} />;
    return (
      <EmptyState
        title={narrowed ? t("browse.emptyNarrowed") : t("browse.empty")}
        action={narrowed ? t("browse.emptyAction.clear") : t("browse.emptyAction.widen")}
        onAction={narrowed ? clearAll : browseFilters.widenRadius}
      />
    );
  }

  function ListFooter() {
    if (!feed.isFetchingNextPage) return null;
    return <LoadingState />;
  }

  return (
    <Screen title={t("tabs.browse")} wordmark scroll={false}>
      <FlashList
        data={feed.quests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.list}
        refreshing={feed.isRefetching}
        onRefresh={feed.refresh}
        onEndReached={() => {
          if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />
      <FilterSortSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        applied={{ filters: browseFilters.filters, sort: browseFilters.sort }}
        onApply={browseFilters.apply}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: raw.layout.gutterScreen,
    paddingTop: 16,
  },
  header: {
    gap: 12,
    marginBottom: raw.layout.stackDefault,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  count: {
    flex: 1,
    minWidth: 0,
    fontFamily: COUNT_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  card: {
    marginBottom: raw.layout.stackDefault,
  },
});
