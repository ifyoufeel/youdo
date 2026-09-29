import { act, renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotificationPrefs } from "../useNotificationPrefs";

describe("useNotificationPrefs", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it("hydrates to the default (all on) when nothing is stored", async () => {
    const { result } = await renderHook(() => useNotificationPrefs());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.prefs).toEqual({ offers: true, messages: true, reminders: true });
  });

  it("hydrates from a value already in storage", async () => {
    await AsyncStorage.setItem(
      "youdo.notificationPrefs.v1",
      JSON.stringify({ offers: false, messages: true, reminders: false })
    );
    const { result } = await renderHook(() => useNotificationPrefs());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.prefs).toEqual({ offers: false, messages: true, reminders: false });
  });

  it("toggle flips one category and persists it, leaving the others alone", async () => {
    const { result } = await renderHook(() => useNotificationPrefs());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(() => result.current.toggle("offers"));
    expect(result.current.prefs).toEqual({ offers: false, messages: true, reminders: true });

    const stored = await AsyncStorage.getItem("youdo.notificationPrefs.v1");
    expect(JSON.parse(stored as string)).toEqual({ offers: false, messages: true, reminders: true });
  });

  it("a fresh mount reads what an earlier toggle wrote", async () => {
    const first = await renderHook(() => useNotificationPrefs());
    await waitFor(() => expect(first.result.current.hydrated).toBe(true));
    await act(() => first.result.current.toggle("reminders"));

    const second = await renderHook(() => useNotificationPrefs());
    await waitFor(() => expect(second.result.current.hydrated).toBe(true));
    expect(second.result.current.prefs.reminders).toBe(false);
  });
});
