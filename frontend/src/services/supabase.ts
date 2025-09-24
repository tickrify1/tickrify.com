import { createClient } from "@supabase/supabase-js";

// Obter variáveis de ambiente
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: any;

if (supabaseUrl && supabaseAnonKey) {
  // Criar cliente real quando as variáveis existem
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  console.log("🔌 Cliente Supabase inicializado:", {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey
  });
} else {
  // Evitar quebra em produção quando envs não estão configuradas
  console.error("⚠️ Variáveis de ambiente do Supabase não configuradas!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl);
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Definida" : "Não definida");

  supabase = {
    auth: {
      async getSession() { return { data: { session: null }, error: null }; },
      async getUser() { return { data: { user: null }, error: null }; },
      async signInWithPassword() { return { data: { user: null, session: null }, error: { message: 'Supabase não configurado' } }; },
      async signUp() { return { data: { user: null, session: null }, error: { message: 'Supabase não configurado' } }; },
      async signOut() { return { error: null }; }
    }
  } as any;
}

export default supabase;