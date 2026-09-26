import { act, renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBrowseFilters, DEFAULT_FILTERS, DEFAULT_SORT } from "../useBrowseFilters";

describe("useBrowseFilters", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it("hydrates from a value already in storage — the other half of the persistence contract, a fresh mount reading what an earlier one wrote", async () => {
    await AsyncStorage.setItem(
      "youdo.browseFilters.v1",
      JSON.stringify({ filters: { ...DEFAULT_FILTERS, radiusM: 1000, verifiedPostersOnly: true }, sort: "ending" })
    );

    const { result } = await renderHook(() => useBrowseFilters());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.filters.radiusM).toBe(1000);
    expect(result.current.filters.verifiedPostersOnly).toBe(true);
    expect(result.current.sort).toBe("ending");
  });

  it("hydrates to defaults when nothing is stored", async () => {
    const { result } = await renderHook(() => useBrowseFilters());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    expect(result.current.sort).toBe(DEFAULT_SORT);
    expect(result.current.isDefault).toBe(true);
  });

  it("apply updates state and marks isDefault false", async () => {
    const { result } = await renderHook(() => useBrowseFilters());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(() => result.current.apply({ filters: { ...DEFAULT_FILTERS, radiusM: 10000 }, sort: "pay" }));
    expect(result.current.filters.radiusM).toBe(10000);
    expect(result.current.sort).toBe("pay");
    expect(result.current.isDefault).toBe(false);
  });

  it("persists applied filters to storage, keyed the same way hydration reads them", async () => {
    // Exercises the actual persistence contract (apply() writes; the
    // hydration effect reads via the same getItem<T>(STORAGE_KEY)) without
    // mounting a second component in the same test — two renderHook()
    // calls in one test left RNTL's root registry in a state that broke a
    // *later* test's own render (its result came back null), a red flag
    // this suite doesn't need to carry just to prove persistence: reading
    // AsyncStorage's own mock store back directly proves the same thing.
    const { result } = await renderHook(() => useBrowseFilters());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    await act(() => result.current.apply({ filters: { ...DEFAULT_FILTERS, radiusM: 3000 }, sort: "newest" }));

    const stored = await AsyncStorage.getItem("youdo.browseFilters.v1");
    expect(JSON.parse(stored as string)).toEqual({ filters: { ...DEFAULT_FILTERS, radiusM: 3000 }, sort: "newest" });
  });

  it("reset restores defaults", async () => {
    const { result } = await renderHook(() => useBrowseFilters());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    await act(() => result.current.apply({ filters: { ...DEFAULT_FILTERS, radiusM: 1000 }, sort: "ending" }));
    await act(() => result.current.reset());
    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    expect(result.current.sort).toBe(DEFAULT_SORT);
    expect(result.current.isDefault).toBe(true);
  });

  it("widenRadius sets radius to 10km, keeping other filters as-is", async () => {
    const { result } = await renderHook(() => useBrowseFilters());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    await act(() => result.current.apply({ filters: { ...DEFAULT_FILTERS, todayOnly: true }, sort: DEFAULT_SORT }));
    await act(() => result.current.widenRadius());
    expect(result.current.filters.radiusM).toBe(10000);
    expect(result.current.filters.todayOnly).toBe(true);
  });
});
