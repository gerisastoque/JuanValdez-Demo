import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL o Key no están configurados.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
