// Ingests one external (Adzuna) listing into our own opportunities
// table, on demand — only when a real logged-in user taps it, never
// speculatively. Uses upsert on (source, external_id) so tapping the
// same listing twice (or two different users saving the same job)
// doesn't create duplicate rows.
//
// Needs the service_role key because regular users don't have INSERT
// permission on opportunities (see schema.sql) — only this trusted
// server-side path can write new listings in.

import { createClient } from "@supabase/supabase-js";
import { verifyUser } from "./_lib/verifyUser.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let user;
  try {
    user = await verifyUser(req);
  } catch (err) {
    res.status(401).json({ error: err.message });
    return;
  }
  void user; // not stored on the row (opportunities are shared, not per-user) — just used to require login

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    res.status(500).json({ error: "Server isn't configured to save external listings yet." });
    return;
  }

  const job = req.body?.job;
  if (!job?.externalId || !job?.title || !job?.org) {
    res.status(400).json({ error: "Missing job details." });
    return;
  }

  try {
    const admin = createClient(url, serviceKey);
    const { data, error } = await admin
      .from("opportunities")
      .upsert(
        {
          title: job.title,
          org: job.org,
          type: job.type || "Job",
          location: job.location || null,
          province: job.province || null,
          closing: job.closing || null,
          experience: job.experience || null,
          salary: job.salary || null,
          description: job.description || "",
          requirements: job.requirements || [],
          verified: false,
          source: "adzuna",
          external_id: job.externalId,
          apply_url: job.applyUrl || null,
        },
        { onConflict: "source,external_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("save-external-job upsert failed:", error);
      res.status(500).json({ error: "Couldn't save that listing. Try again." });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("save-external-job handler failed:", err);
    res.status(500).json({ error: "Something went wrong saving that listing." });
  }
}
