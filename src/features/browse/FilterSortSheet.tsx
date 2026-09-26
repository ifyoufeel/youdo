/* Ports preview/app.js's BrowseScreen filter Dialog (app.js:1704-1751):
   a draft, seeded from the applied state each time the sheet opens and
   discarded if the viewer backs out without pressing "Show quests" —
   applying writes the whole draft to useBrowseFilters in one go, never
   per-control. */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Dialog } from "@design/components/Dialog";
import { Radio } from "@design/components/Radio";
import { Select, type SelectOption } from "@design/components/Select";
import { Checkbox } from "@design/components/Checkbox";
import { Button } from "@design/components/Button";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import type { QuestSort } from "@data/ports/quests";
import { t } from "../../i18n/t";
import { DEFAULT_FILTERS, DEFAULT_SORT, type BrowseFilterState } from "./useBrowseFilters";

const SORT_OPTIONS: { value: QuestSort; label: string }[] = [
  { value: "closest", label: t("browse.sort.closest") },
  { value: "pay", label: t("browse.sort.pay") },
  { value: "ending", label: t("browse.sort.ending") },
  { value: "newest", label: t("browse.sort.newest") },
];

const RADIUS_OPTIONS: SelectOption[] = [
  { value: "1000", label: t("browse.filters.radius.1km") },
  { value: "3000", label: t("browse.filters.radius.3km") },
  { value: "5000", label: t("browse.filters.radius.5km") },
  { value: "10000", label: t("browse.filters.radius.10km") },
];

const MIN_PAY_OPTIONS: SelectOption[] = [
  { value: "0", label: t("browse.filters.minPay.any") },
  { value: "20000", label: "NT$200" },
  { value: "30000", label: "NT$300" },
  { value: "50000", label: "NT$500" },
];

/* A 12px uppercase section label, private to this file — the same one-off
   treatment preview/app.js's own SECTION_LABEL constant gets, not
   promoted to src/design since nothing else needs it yet (QuestCard's
   private BadgePill/PosterRow precedent). */
function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export interface FilterSortSheetProps {
  open: boolean;
  onClose: () => void;
  applied: BrowseFilterState;
  onApply: (next: BrowseFilterState) => void;
}

export function FilterSortSheet({ open, onClose, applied, onApply }: FilterSortSheetProps) {
  const [draft, setDraft] = useState<BrowseFilterState>(applied);
  // "Adjusting state when a prop changes" (react.dev), not an effect: each
  // open re-seeds the draft from the latest applied state, synchronously
  // during render, so the sheet never flashes a stale draft on the frame
  // it opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setDraft(applied);
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  function patchFilters(patch: Partial<BrowseFilterState["filters"]>) {
    setDraft((d) => ({ ...d, filters: { ...d.filters, ...patch } }));
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }

  function handleReset() {
    setDraft({ filters: DEFAULT_FILTERS, sort: DEFAULT_SORT });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("browse.filters.title")}
      subtitle={t("browse.filters.subtitle")}
      testID="browse-filter-sheet"
      actions={
        <>
          <Button variant="ghost" onPress={handleReset} testID="browse-filter-reset">
            {t("browse.filters.reset")}
          </Button>
          <Button fullWidth onPress={handleApply} testID="browse-filter-apply">
            {t("browse.filters.apply")}
          </Button>
        </>
      }
    >
      <SectionLabel>{t("browse.filters.sortBy")}</SectionLabel>
      {SORT_OPTIONS.map((option) => (
        <Radio
          key={option.value}
          label={option.label}
          checked={draft.sort === option.value}
          onSelect={() => setDraft((d) => ({ ...d, sort: option.value }))}
        />
      ))}
      <Select
        label={t("browse.filters.distance")}
        options={RADIUS_OPTIONS}
        value={String(draft.filters.radiusM)}
        onChange={(value) => patchFilters({ radiusM: parseInt(value, 10) })}
        testID="browse-filter-radius"
      />
      <Select
        label={t("browse.filters.minPay")}
        options={MIN_PAY_OPTIONS}
        value={String(draft.filters.minPayMinor)}
        onChange={(value) => patchFilters({ minPayMinor: parseInt(value, 10) })}
        testID="browse-filter-minpay"
      />
      <Checkbox
        label={t("browse.filters.todayOnly")}
        checked={draft.filters.todayOnly}
        onChange={(checked) => patchFilters({ todayOnly: checked })}
        testID="browse-filter-today"
      />
      <Checkbox
        label={t("browse.filters.verifiedOnly")}
        checked={draft.filters.verifiedPostersOnly}
        onChange={(checked) => patchFilters({ verifiedPostersOnly: checked })}
        testID="browse-filter-verified"
      />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: fontFamilyName(raw.font.text, raw.fontWeight.bold),
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
  },
});
