"use strict";

if (!window.STANDBOOK_CONFIG) {
  throw new Error("StandBook config mangler.");
}

if (!window.supabase) {
  throw new Error("Supabase-biblioteket kunne ikke indlæses.");
}

window.standbookSupabase = window.supabase.createClient(
  window.STANDBOOK_CONFIG.supabaseUrl,
  window.STANDBOOK_CONFIG.supabaseKey
);
