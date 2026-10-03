/* A minimal stand-in for supabase-js's query/RPC builders, shared by
   every adapters/supabase/*.test.ts file. There is no live project to
   test against (M7's explicit "scaffold only" scope) — this is what lets
   these tests verify real signal (which table/columns/filters/RPC name
   and args an adapter method actually sends) instead of nothing at all.
   It is deliberately not a faithful reimplementation of postgrest-js:
   every chainable method just records the call and returns `this`, and
   the terminal call (`.single()`/`.maybeSingle()`/awaiting the builder
   itself/awaiting `.rpc()`) resolves to the next queued response — most
   adapter methods only need one. */
export interface FakeResponse<T = unknown> {
  data: T | null;
  error: { message: string; code?: string } | null;
  /** postgrest's `{ count: 'exact', head: true }` option resolves with
      this alongside data/error — only threads.ts's unreadCountForThread
      needs it today. */
  count?: number;
}

export interface RecordedCall {
  table?: string;
  rpc?: string;
  args?: unknown;
  method: string;
  params: unknown[];
}

export interface RecordedSubscription {
  channelName: string;
  event: string;
  filter: Record<string, unknown>;
  callback: (payload: { new: unknown; old?: unknown }) => void;
}

function ok<T>(data: T): FakeResponse<T> {
  return { data, error: null };
}

export function createFakeClient(responses: FakeResponse[] = [ok(null)]) {
  const calls: RecordedCall[] = [];
  const subscriptions: RecordedSubscription[] = [];
  const queue = [...responses];
  function nextResponse(): FakeResponse {
    return queue.length > 1 ? queue.shift()! : queue[0];
  }

  const CHAINABLE = [
    "select",
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "in",
    "is",
    "not",
    "order",
    "limit",
    "range",
    "update",
    "insert",
    "upsert",
    "delete",
    "contains",
    "textSearch",
    "or",
    "filter",
  ];

  function builder(table: string) {
    const record = (method: string, params: unknown[]) => calls.push({ table, method, params });
    const b: Record<string, unknown> = {};
    for (const method of CHAINABLE) {
      b[method] = (...params: unknown[]) => {
        record(method, params);
        return b;
      };
    }
    b.maybeSingle = () => {
      record("maybeSingle", []);
      return Promise.resolve(nextResponse());
    };
    b.single = () => {
      record("single", []);
      return Promise.resolve(nextResponse());
    };
    b.then = (
      onfulfilled?: ((value: FakeResponse) => unknown) | null,
      onrejected?: ((reason: unknown) => unknown) | null
    ) => {
      record("then", []);
      return Promise.resolve(nextResponse()).then(onfulfilled, onrejected);
    };
    return b;
  }

  function channelStub(channelName: string) {
    const c: Record<string, unknown> = {};
    // Real supabase-js signature: .on("postgres_changes", { event, schema,
    // table, filter }, callback) — the postgres_changes event type
    // (INSERT/UPDATE/DELETE/*) lives inside the filter object's own
    // `event` field, not the first argument.
    c.on = (_topic: string, filter: Record<string, unknown>, callback: RecordedSubscription["callback"]) => {
      subscriptions.push({ channelName, event: String(filter.event), filter, callback });
      return c;
    };
    c.subscribe = () => c;
    return c;
  }

  function storageBucketStub(bucket: string) {
    return {
      upload: (path: string, body: unknown, options?: unknown) => {
        calls.push({ method: "storage.upload", params: [bucket, path, body, options] });
        return Promise.resolve(nextResponse());
      },
      // getPublicUrl is synchronous in the real client (pure string
      // construction, no request) — this stub matches that shape.
      getPublicUrl: (path: string) => {
        calls.push({ method: "storage.getPublicUrl", params: [bucket, path] });
        return { data: { publicUrl: `https://fake.supabase.co/storage/v1/object/public/${bucket}/${path}` } };
      },
    };
  }

  const client = {
    from: (table: string) => {
      calls.push({ table, method: "from", params: [] });
      return builder(table);
    },
    rpc: (name: string, args?: unknown) => {
      calls.push({ rpc: name, args, method: "rpc", params: [] });
      const b: Record<string, unknown> = {};
      b.maybeSingle = () => Promise.resolve(nextResponse());
      b.single = () => Promise.resolve(nextResponse());
      b.then = (
        onfulfilled?: ((value: FakeResponse) => unknown) | null,
        onrejected?: ((reason: unknown) => unknown) | null
      ) => Promise.resolve(nextResponse()).then(onfulfilled, onrejected);
      return b;
    },
    channel: (name: string) => channelStub(name),
    removeChannel: () => {},
    storage: { from: (bucket: string) => storageBucketStub(bucket) },
    auth: {
      getSession: (...params: unknown[]) => {
        calls.push({ method: "auth.getSession", params });
        return Promise.resolve(nextResponse());
      },
      getUser: (...params: unknown[]) => {
        calls.push({ method: "auth.getUser", params });
        return Promise.resolve(nextResponse());
      },
      signInWithOAuth: (...params: unknown[]) => {
        calls.push({ method: "auth.signInWithOAuth", params });
        return Promise.resolve(nextResponse());
      },
      setSession: (...params: unknown[]) => {
        calls.push({ method: "auth.setSession", params });
        return Promise.resolve(nextResponse());
      },
      exchangeCodeForSession: (...params: unknown[]) => {
        calls.push({ method: "auth.exchangeCodeForSession", params });
        return Promise.resolve(nextResponse());
      },
      signInWithIdToken: (...params: unknown[]) => {
        calls.push({ method: "auth.signInWithIdToken", params });
        return Promise.resolve(nextResponse());
      },
      signInWithOtp: (...params: unknown[]) => {
        calls.push({ method: "auth.signInWithOtp", params });
        return Promise.resolve(nextResponse());
      },
      verifyOtp: (...params: unknown[]) => {
        calls.push({ method: "auth.verifyOtp", params });
        return Promise.resolve(nextResponse());
      },
      signOut: (...params: unknown[]) => {
        calls.push({ method: "auth.signOut", params });
        return Promise.resolve(nextResponse());
      },
    },
  };

  return { client, calls, subscriptions };
}

export function fakeOk<T>(data: T): FakeResponse<T> {
  return ok(data);
}

export function fakeError(message: string, code?: string): FakeResponse {
  return { data: null, error: { message, code } };
}

export function fakeCount(count: number): FakeResponse<null> {
  return { data: null, error: null, count };
}
