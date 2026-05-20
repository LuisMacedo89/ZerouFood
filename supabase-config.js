// ZerouFood — Configuração Supabase
// Esta chave é a anon public key. Ela pode ficar no frontend.
// Nunca coloque service_role key no frontend.

const ZEROUFOOD_SUPABASE_URL = "https://rcoofiuujatlaxzjsvey.supabase.co";
const ZEROUFOOD_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjb29maXV1amF0bGF4empzdmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzAxNjQsImV4cCI6MjA5NDg0NjE2NH0.EN-bCrWT50Q5ziwk8oCt2Pu0Xf3B4Y5XXZlEO6rCviE";

const zeroufoodSupabase = window.supabase.createClient(
  ZEROUFOOD_SUPABASE_URL,
  ZEROUFOOD_SUPABASE_ANON_KEY
);
