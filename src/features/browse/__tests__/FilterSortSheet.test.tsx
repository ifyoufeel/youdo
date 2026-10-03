import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { FilterSortSheet } from "../FilterSortSheet";
import { DEFAULT_FILTERS, DEFAULT_SORT, type BrowseFilterState } from "../useBrowseFilters";

function Harness() {
  const [open, setOpen] = useState(true);
  const [applied, setApplied] = useState<BrowseFilterState>({ filters: DEFAULT_FILTERS, sort: DEFAULT_SORT });
  return (
    <View>
      <Text testID="applied-summary">{JSON.stringify(applied)}</Text>
      <Text testID="open-state">{open ? "open" : "closed"}</Text>
      <Pressable testID="reopen" onPress={() => setOpen(true)}>
        <Text>Reopen</Text>
      </Pressable>
      <FilterSortSheet open={open} onClose={() => setOpen(false)} applied={applied} onApply={setApplied} />
    </View>
  );
}

describe("FilterSortSheet", () => {
  it("renders with the applied sort selected", async () => {
    const { getByLabelText } = await render(<Harness />);
    expect(getByLabelText("Closest first").props.accessibilityState.checked).toBe(true);
    expect(getByLabelText("Best paid").props.accessibilityState.checked).toBe(false);
  });

  it("editing the draft without pressing Show quests does not change the applied state", async () => {
    const { getByLabelText, getByTestId } = await render(<Harness />);
    await fireEvent.press(getByLabelText("Best paid"));

    const applied = JSON.parse(getByTestId("applied-summary").props.children);
    expect(applied.sort).toBe("closest");
  });

  it("Show quests applies the draft and closes the sheet", async () => {
    const { getByLabelText, getByTestId } = await render(<Harness />);
    await fireEvent.press(getByLabelText("Best paid"));
    await fireEvent.press(getByTestId("browse-filter-apply"));

    await waitFor(() => expect(getByTestId("open-state").props.children).toBe("closed"));
    const applied = JSON.parse(getByTestId("applied-summary").props.children);
    expect(applied.sort).toBe("pay");
  });

  it("Reset clears the draft back to defaults before applying", async () => {
    const { getByLabelText, getByTestId } = await render(<Harness />);
    await fireEvent.press(getByLabelText("Best paid"));
    await fireEvent.press(getByTestId("browse-filter-reset"));
    await fireEvent.press(getByTestId("browse-filter-apply"));

    const applied = JSON.parse(getByTestId("applied-summary").props.children);
    expect(applied.sort).toBe(DEFAULT_SORT);
    expect(applied.filters).toEqual(DEFAULT_FILTERS);
  });

  it("re-seeds the draft from applied every time the sheet re-opens, discarding unsaved edits", async () => {
    const { getByLabelText, getByTestId } = await render(<Harness />);
    // Edit the draft, then close via the backdrop (Dialog's onClose) instead
    // of "Show quests" — the edit should never reach `applied`.
    await fireEvent.press(getByLabelText("Best paid"));
    await fireEvent.press(getByTestId("browse-filter-sheet-backdrop"));
    await waitFor(() => expect(getByTestId("open-state").props.children).toBe("closed"));

    await fireEvent.press(getByTestId("reopen"));
    expect(getByLabelText("Closest first").props.accessibilityState.checked).toBe(true);
    expect(getByLabelText("Best paid").props.accessibilityState.checked).toBe(false);
  });
});
