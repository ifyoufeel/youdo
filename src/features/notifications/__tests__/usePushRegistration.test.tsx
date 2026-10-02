import React from "react";
import { Platform } from "react-native";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { pushTokens } from "@data/adapters/memory/store";
import { usePushRegistration } from "../usePushRegistration";

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockGetExpoPushTokenAsync = jest.fn();
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
  getExpoPushTokenAsync: (...args: unknown[]) => mockGetExpoPushTokenAsync(...args),
}));

let mockProjectId: string | undefined = "eas-project-1";
jest.mock("expo-constants", () => ({
  get expoConfig() {
    return { extra: { eas: { projectId: mockProjectId } } };
  },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </RepositoryProvider>
      </QueryClientProvider>
    );
  };
}

function useHarness() {
  const auth = useAuthSession();
  usePushRegistration();
  return auth;
}

async function renderSignedIn() {
  const { result, unmount } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.status).toBe("signedOut"));
  await act(() => result.current.signInWithGoogle());
  await waitFor(() => expect(result.current.status).toBe("signedIn"));
  return { result, unmount };
}

describe("usePushRegistration", () => {
  beforeEach(() => {
    Platform.OS = "ios";
    mockProjectId = "eas-project-1";
    mockGetPermissionsAsync.mockReset().mockResolvedValue({ granted: true });
    mockRequestPermissionsAsync.mockReset().mockResolvedValue({ granted: true });
    mockGetExpoPushTokenAsync.mockReset().mockResolvedValue({ type: "expo", data: "ExponentPushToken[abc]" });
    pushTokens.clear();
  });

  it("registers the Expo push token once signed in, when a real EAS project id exists", async () => {
    const { result, unmount } = await renderSignedIn();
    await waitFor(() => expect(pushTokens.get(result.current.session!.userId)).toBe("ExponentPushToken[abc]"));
    expect(mockGetExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: "eas-project-1" });
    unmount();
  });

  it("requests permission only when not already granted", async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: false });
    const { unmount } = await renderSignedIn();
    await waitFor(() => expect(mockRequestPermissionsAsync).toHaveBeenCalled());
    unmount();
  });

  it("never calls getExpoPushTokenAsync when permission is denied", async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: false });
    mockRequestPermissionsAsync.mockResolvedValue({ granted: false });
    const { unmount } = await renderSignedIn();
    await waitFor(() => expect(mockRequestPermissionsAsync).toHaveBeenCalled());
    expect(mockGetExpoPushTokenAsync).not.toHaveBeenCalled();
    unmount();
  });

  it("never calls getExpoPushTokenAsync without a real EAS project id — ADR-016 never fabricates one", async () => {
    mockProjectId = undefined;
    const { unmount } = await renderSignedIn();
    expect(mockGetExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(mockGetPermissionsAsync).not.toHaveBeenCalled();
    unmount();
  });

  it("never registers on web", async () => {
    Platform.OS = "web";
    const { unmount } = await renderSignedIn();
    expect(mockGetExpoPushTokenAsync).not.toHaveBeenCalled();
    unmount();
  });

  it("clears the registered token on unmount (sign-out)", async () => {
    const { result, unmount } = await renderSignedIn();
    const userId = result.current.session!.userId;
    await waitFor(() => expect(pushTokens.get(userId)).toBe("ExponentPushToken[abc]"));

    unmount();
    await waitFor(() => expect(pushTokens.has(userId)).toBe(false));
  });

  it("swallows a thrown permission/token error rather than crashing", async () => {
    mockGetExpoPushTokenAsync.mockRejectedValue(new Error("no physical device"));
    const { unmount } = await renderSignedIn();
    await waitFor(() => expect(mockGetExpoPushTokenAsync).toHaveBeenCalled());
    unmount();
  });
});
