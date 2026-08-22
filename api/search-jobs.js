// Real external job search via Adzuna (covers South Africa, country
// code "za"). Free tier is small (~1,000 calls/month, ~33/day), so
// this is only ever called when a user explicitly clicks "Search live
// SA jobs" — never automatically on every keystroke.
//
// Local testing: use `vercel dev`, not `npm run dev` — same as the
// other /api functions.

import { verifyUser } from "./_lib/verifyUser.js";

const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs/za/search/1";

function stripHtml(str) {
  return (str || "").replace(/<[^>]+>/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await verifyUser(req);
  } catch (err) {
    res.status(401).json({ error: err.message });
    return;
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    res.status(500).json({ error: "External job search isn't configured yet." });
    return;
  }

  const q = (req.query.q || "").toString().trim();
  const where = (req.query.where || "").toString().trim();
  if (!q) {
    res.status(400).json({ error: "Enter a search term." });
    return;
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "15",
    what: q,
    "content-type": "application/json",
  });
  if (where) params.set("where", where);

  try {
    const adzunaRes = await fetch(`${ADZUNA_BASE}?${params.toString()}`);
    if (!adzunaRes.ok) {
      const errBody = await adzunaRes.text();
      console.error("Adzuna API error:", adzunaRes.status, errBody);
      res.status(502).json({ error: "External job search didn't respond correctly. Try again." });
      return;
    }

    const data = await adzunaRes.json();
    const jobs = (data.results || []).map((j) => ({
      externalId: String(j.id),
      title: stripHtml(j.title) || "Untitled role",
      org: j.company?.display_name || "Unknown company",
      location: j.location?.display_name || "South Africa",
      province: j.location?.area?.[1] || null,
      description: stripHtml(j.description).slice(0, 2000),
      salary: j.salary_min && j.salary_max
        ? `R${Math.round(j.salary_min).toLocaleString()} – R${Math.round(j.salary_max).toLocaleString()}/yr${j.salary_is_predicted === "1" ? " (estimated)" : ""}`
        : null,
      type: "Job",
      applyUrl: j.redirect_url || null,
      posted: j.created || null,
    }));

    res.status(200).json({ jobs });
  } catch (err) {
    console.error("search-jobs handler failed:", err);
    res.status(500).json({ error: "Something went wrong searching external jobs." });
  }
}
