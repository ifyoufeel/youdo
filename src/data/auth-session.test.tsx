import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { RepositoryProvider } from "./composition-root";
import { AuthSessionProvider, useAuthSession } from "./auth-session";
import { InvalidOtpError } from "./ports/auth";
import { seed } from "./adapters/memory/seed";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <RepositoryProvider>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </RepositoryProvider>
  );
}

describe("AuthSessionProvider", () => {
  it("starts loading, then resolves to signedOut for a fresh memory adapter", async () => {
    const { result } = await renderHook(() => useAuthSession(), { wrapper });
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("signedOut"));
    expect(result.current.session).toBeNull();
  });

  it("signInWithGoogle transitions to signedIn", async () => {
    const { result } = await renderHook(() => useAuthSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("signedOut"));

    await act(() => result.current.signInWithGoogle());
    await waitFor(() => expect(result.current.status).toBe("signedIn"));
    expect(result.current.session).toEqual({ userId: seed.meId });
  });

  it("verifyOtp with a valid code transitions to signedIn", async () => {
    const { result } = await renderHook(() => useAuthSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("signedOut"));

    await act(() => result.current.verifyOtp("alex@example.tw", "123456"));
    await waitFor(() => expect(result.current.status).toBe("signedIn"));
  });

  it("verifyOtp('000000') rejects with InvalidOtpError and stays signedOut", async () => {
    const { result } = await renderHook(() => useAuthSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("signedOut"));

    await act(async () => {
      await expect(result.current.verifyOtp("alex@example.tw", "000000")).rejects.toBeInstanceOf(InvalidOtpError);
    });
    expect(result.current.status).toBe("signedOut");
    expect(result.current.session).toBeNull();
  });

  it("signOut returns to signedOut", async () => {
    const { result } = await renderHook(() => useAuthSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("signedOut"));

    await act(() => result.current.signInWithGoogle());
    await waitFor(() => expect(result.current.status).toBe("signedIn"));

    await act(() => result.current.signOut());
    await waitFor(() => expect(result.current.status).toBe("signedOut"));
    expect(result.current.session).toBeNull();
  });

  it("useAuthSession throws outside a provider", async () => {
    await expect(renderHook(() => useAuthSession())).rejects.toThrow(/outside <AuthSessionProvider>/);
  });
});
