import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider, useRepository } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useUpdateProfile } from "../useUpdateProfile";
import { useUploadAvatar } from "../useUploadAvatar";
import { useDeleteAccount } from "../useDeleteAccount";

const mockGetMediaLibraryPermissionsAsync = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();
jest.mock("expo-image-picker", () => ({
  getMediaLibraryPermissionsAsync: (...args: unknown[]) => mockGetMediaLibraryPermissionsAsync(...args),
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) => mockRequestMediaLibraryPermissionsAsync(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
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
  const repository = useRepository();
  const updateProfile = useUpdateProfile(auth.session?.userId);
  const uploadAvatar = useUploadAvatar(auth.session?.userId);
  const deleteAccount = useDeleteAccount();
  return { auth, repository, updateProfile, uploadAvatar, deleteAccount };
}

async function renderSignedIn() {
  const { result } = await renderHook(() => useHarness(), { wrapper: makeWrapper() });
  await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
  await act(() => result.current.auth.signInWithGoogle());
  await waitFor(() => expect(result.current.auth.status).toBe("signedIn"));
  return result;
}

describe("useUpdateProfile", () => {
  it("patches the signed-in user's own profile for real", async () => {
    const result = await renderSignedIn();
    await act(async () => {
      const updated = await result.current.updateProfile.mutateAsync({ phone: "+886 900 555 666" });
      expect(updated.phone).toBe("+886 900 555 666");
    });
    const reread = await result.current.repository.getUser(result.current.auth.session!.userId);
    expect(reread?.phone).toBe("+886 900 555 666");
  });
});

describe("useUploadAvatar", () => {
  beforeEach(() => {
    mockGetMediaLibraryPermissionsAsync.mockReset().mockResolvedValue({ granted: true });
    mockRequestMediaLibraryPermissionsAsync.mockReset().mockResolvedValue({ granted: true });
    mockLaunchImageLibraryAsync.mockReset().mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///tmp/photo.jpg" }],
    });
  });

  it("picks, uploads, and writes the result onto the signed-in user's own profile", async () => {
    const result = await renderSignedIn();
    await act(async () => {
      const updated = await result.current.uploadAvatar.mutateAsync();
      expect(updated?.avatarUrl).toBe("file:///tmp/photo.jpg");
    });
    const reread = await result.current.repository.getUser(result.current.auth.session!.userId);
    expect(reread?.avatarUrl).toBe("file:///tmp/photo.jpg");
  });

  it("requests permission only when not already granted", async () => {
    mockGetMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });
    const result = await renderSignedIn();
    await act(async () => {
      await result.current.uploadAvatar.mutateAsync();
    });
    expect(mockRequestMediaLibraryPermissionsAsync).toHaveBeenCalled();
  });

  it("resolves to null, not an error, when permission is denied", async () => {
    mockGetMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });
    const result = await renderSignedIn();
    await act(async () => {
      const updated = await result.current.uploadAvatar.mutateAsync();
      expect(updated).toBeNull();
    });
    expect(mockLaunchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it("resolves to null, not an error, when the picker is cancelled", async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null });
    const result = await renderSignedIn();
    await act(async () => {
      const updated = await result.current.uploadAvatar.mutateAsync();
      expect(updated).toBeNull();
    });
  });
});

describe("useDeleteAccount", () => {
  it("anonymizes the account and signs the session out", async () => {
    const result = await renderSignedIn();
    const userId = result.current.auth.session!.userId;

    await act(async () => {
      await result.current.deleteAccount.mutateAsync();
    });

    await waitFor(() => expect(result.current.auth.status).toBe("signedOut"));
    const reread = await result.current.repository.getUser(userId);
    expect(reread?.name).toBe("Deleted user");
  });
});
