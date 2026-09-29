import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepositoryProvider, useRepository } from "@data/composition-root";
import { AuthSessionProvider, useAuthSession } from "@data/auth-session";
import { useUpdateProfile } from "../useUpdateProfile";
import { useDeleteAccount } from "../useDeleteAccount";

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
  const deleteAccount = useDeleteAccount();
  return { auth, repository, updateProfile, deleteAccount };
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
