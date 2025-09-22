import { createClient } from "@supabase/supabase-js";

// Obter variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Variáveis de ambiente do Supabase não configuradas!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl);
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Definida" : "Não definida");
}

// Criar cliente Supabase com opções avançadas
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Log para depuração
console.log("🔌 Cliente Supabase inicializado:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
});

export default supabase;