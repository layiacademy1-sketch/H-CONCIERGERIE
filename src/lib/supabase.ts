// Stubbed Supabase client (Supabase completely removed)
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error("Supabase is disabled") }),
    signUp: async () => ({ data: { user: null }, error: new Error("Supabase is disabled") }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      order: () => ({}),
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null }),
      }),
    }),
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => ({}),
    }),
  }),
  removeChannel: () => {},
};

export const isSupabaseConfigured = (): boolean => {
  return false;
};
