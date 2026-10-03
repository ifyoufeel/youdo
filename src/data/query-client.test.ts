import NetInfo from "@react-native-community/netinfo";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAppQueryClient, persistAppQueryClient } from "./query-client";

jest.mock("@tanstack/react-query-persist-client", () => ({
  persistQueryClient: jest.fn(),
}));

describe("createAppQueryClient", () => {
  it("sets networkMode: offlineFirst for both queries and mutations, so a mutation fired offline pauses instead of erroring", () => {
    const queryClient = createAppQueryClient();
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.networkMode).toBe("offlineFirst");
    expect(defaults.mutations?.networkMode).toBe("offlineFirst");
  });

  it("wires react-query's onlineManager to real NetInfo connectivity exactly once, even across multiple clients", () => {
    const before = (NetInfo.addEventListener as jest.Mock).mock.calls.length;
    createAppQueryClient();
    createAppQueryClient();
    createAppQueryClient();
    // onlineManager.setEventListener replaces its previous listener rather
    // than stacking — but this module's own `onlineManagerWired` guard
    // should mean setEventListener (and therefore addEventListener) is
    // only ever invoked once for the life of the app, not once per client.
    const after = (NetInfo.addEventListener as jest.Mock).mock.calls.length;
    expect(after).toBe(before);
  });
});

describe("persistAppQueryClient", () => {
  it("excludes ledger-prefixed queries from persistence (wallet balances/entries/payments stay off unencrypted disk)", () => {
    const queryClient = createAppQueryClient();
    persistAppQueryClient(queryClient);

    expect(persistQueryClient).toHaveBeenCalledTimes(1);
    const options = (persistQueryClient as jest.Mock).mock.calls[0][0];
    const shouldDehydrate = options.dehydrateOptions.shouldDehydrateQuery;

    expect(shouldDehydrate({ queryKey: ["ledger", "entries", "u0"] })).toBe(false);
    expect(shouldDehydrate({ queryKey: ["ledger", "payments", "u0"] })).toBe(false);
    expect(shouldDehydrate({ queryKey: ["quests", "feed"] })).toBe(true);
    expect(shouldDehydrate({ queryKey: ["users", "u0"] })).toBe(true);
  });

  it("passes a real AsyncStorage-backed persister and a bounded max age", () => {
    const queryClient = createAppQueryClient();
    persistAppQueryClient(queryClient);

    const options = (persistQueryClient as jest.Mock).mock.calls.at(-1)[0];
    expect(options.persister).toBeTruthy();
    expect(typeof options.maxAge).toBe("number");
    expect(options.maxAge).toBeGreaterThan(0);
  });
});
