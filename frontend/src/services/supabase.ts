// Supabase removido. Exporta stub para manter app compilando.
const supabase: any = {
  auth: {
    async getSession() { return { data: { session: null }, error: null }; },
    async getUser() { return { data: { user: null }, error: null }; },
    async signInWithPassword() { return { data: { user: null, session: null }, error: { message: 'Auth removido' } }; },
    async signUp() { return { data: { user: null, session: null }, error: { message: 'Auth removido' } }; },
    async signOut() { return { error: null }; },
    async signInWithOAuth() { return { data: null, error: { message: 'Auth removido' } }; },
    onAuthStateChange() { return { data: { subscription: { unsubscribe(){} } } }; },
    exchangeCodeForSession: async () => ({ data: null, error: { message: 'Auth removido' } })
  }
};

export default supabase;