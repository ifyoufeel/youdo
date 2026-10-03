import { act, renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePostDraft } from "../usePostDraft";
import { emptyForm } from "../wizardForm";

const STORAGE_KEY = "youdo.postQuestDraft.v1";

describe("usePostDraft", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it("hydrates to an empty form (seeded with the given area) when nothing is stored", async () => {
    const { result } = await renderHook(() => usePostDraft("Da'an"));
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.form).toEqual(emptyForm("Da'an"));
    expect(result.current.resumed).toBe(false);
  });

  it("hydrates from a stored draft with real content, and flags it as resumed", async () => {
    const stored = { ...emptyForm("Da'an"), title: "Walk my dog", budget: "400" };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = await renderHook(() => usePostDraft("Da'an"));
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.form.title).toBe("Walk my dog");
    expect(result.current.form.budget).toBe("400");
    expect(result.current.resumed).toBe(true);
  });

  it("ignores a stored draft with no real content — an emptied form isn't a draft to resume", async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(emptyForm("Da'an")));

    const { result } = await renderHook(() => usePostDraft("Da'an"));
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.resumed).toBe(false);
  });

  it("persists a form change to storage once hydrated", async () => {
    const { result } = await renderHook(() => usePostDraft("Da'an"));
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(() => result.current.setForm({ ...result.current.form, title: "Assemble a bookshelf" }));

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored as string).title).toBe("Assemble a bookshelf");
    });
  });

  it("clearDraft resets to empty and clears storage", async () => {
    const { result } = await renderHook(() => usePostDraft("Da'an"));
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    await act(() => result.current.setForm({ ...result.current.form, title: "Assemble a bookshelf" }));
    await waitFor(() => expect(result.current.form.title).toBe("Assemble a bookshelf"));

    await act(() => result.current.clearDraft());
    expect(result.current.form).toEqual(emptyForm("Da'an"));
    expect(result.current.resumed).toBe(false);

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    expect(stored === null || JSON.parse(stored) === null).toBe(true);
  });
});
