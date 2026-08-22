// Shared by api/search-jobs.js and api/save-external-job.js.
// Filename starts with an underscore so Vercel doesn't treat this
// folder as its own route — it's a plain importable module.

import { createClient } from "@supabase/supabase-js";

export async function verifyUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) throw new Error("You need to be logged in for this.");

  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const client = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) throw new Error("Invalid or expired session.");
  return data.user;
}
