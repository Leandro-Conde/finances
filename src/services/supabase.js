import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pujnuysegopwxjlwjexg.supabase.co";

const supabaseKey = "sb_publishable_Dv7fyIAL_J_7LQir0_oVWQ_Tc8bPaeV";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);