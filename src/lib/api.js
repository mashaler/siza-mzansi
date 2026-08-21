import { supabase } from "./supabaseClient";

/* ---------------------------------------------------------------
   Maps a raw `profiles` DB row (snake_case) into the shape the UI
   components already use (name/title/location/completion), so the
   rest of the app doesn't need to know about DB column names.
----------------------------------------------------------------*/
export function toAppProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || "New user",
    title: row.job_title || "Job seeker",
    location: row.city || row.province || "South Africa",
    completion: row.completion ?? 20,
    raw: row,
  };
}

/* ---------------------------------------------------------------
   OPPORTUNITIES (public read, no auth required)
----------------------------------------------------------------*/
export async function fetchOpportunities() {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("closing", { ascending: true });
  if (error) throw error;
  return (data || []).map((o) => ({
    id: o.id,
    title: o.title,
    org: o.org,
    type: o.type,
    location: o.location,
    province: o.province,
    closing: o.closing
      ? new Date(o.closing).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
      : "TBC",
    closingRaw: o.closing || null,
    experience: o.experience,
    salary: o.salary,
    description: o.description,
    requirements: o.requirements || [],
    verified: o.verified,
  }));
}

/* ---------------------------------------------------------------
   PROFILE (one row per user)
----------------------------------------------------------------*/
export async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function saveProfile(userId, form) {
  const filled = Object.entries(form).filter(([k, v]) => {
    if (k === "relocate" || k === "remote") return true;
    return String(v ?? "").trim().length > 0;
  }).length;
  const completion = Math.max(20, Math.round((filled / Object.keys(form).length) * 100));

  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: form.name?.trim() || "New user",
      phone: form.phone,
      province: form.province,
      city: form.city,
      education: form.education,
      field_of_study: form.fieldOfStudy,
      experience: form.experience,
      skills: form.skills,
      job_title: form.jobTitle?.trim() || "Job seeker",
      industries: form.industries,
      relocate: !!form.relocate,
      remote: !!form.remote,
      completion,
    })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------
   SAVED OPPORTUNITIES
----------------------------------------------------------------*/
export async function fetchSavedIds(userId) {
  const { data, error } = await supabase.from("saved_opportunities").select("opportunity_id").eq("user_id", userId);
  if (error) throw error;
  return new Set((data || []).map((r) => r.opportunity_id));
}

export async function toggleSavedOpportunity(userId, opportunityId, currentlySaved) {
  if (currentlySaved) {
    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("user_id", userId)
      .eq("opportunity_id", opportunityId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("saved_opportunities")
      .insert({ user_id: userId, opportunity_id: opportunityId });
    if (error) throw error;
  }
}

/* ---------------------------------------------------------------
   APPLICATIONS
----------------------------------------------------------------*/
export async function fetchApplications(userId) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((a) => ({
    id: a.id,
    title: a.title,
    org: a.org,
    status: a.status,
    appliedDate: a.applied_date
      ? new Date(a.applied_date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
      : "",
    appliedDateRaw: a.applied_date || null,
    interviewDate: a.interview_date
      ? new Date(a.interview_date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "",
    interviewDateRaw: a.interview_date || null,
    notes: a.notes || "",
  }));
}

export async function createApplication(userId, opportunity) {
  const applied_date = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: userId,
      opportunity_id: opportunity.id,
      title: opportunity.title,
      org: opportunity.org,
      status: "Applied",
      applied_date,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(applicationId, status) {
  const { error } = await supabase.from("applications").update({ status }).eq("id", applicationId);
  if (error) throw error;
}

/* ---------------------------------------------------------------
   NOTIFICATION PREFERENCES
----------------------------------------------------------------*/
export async function updateNotificationPrefs(userId, prefs) {
  const { error } = await supabase.from("profiles").update({ notification_prefs: prefs }).eq("id", userId);
  if (error) throw error;
}

/* ---------------------------------------------------------------
   ACCOUNT — data export, password change, deletion
----------------------------------------------------------------*/
export async function exportUserData(userId) {
  const [profileRes, savedRes, appsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("saved_opportunities").select("created_at, opportunities(title, org, type)").eq("user_id", userId),
    supabase.from("applications").select("*").eq("user_id", userId),
  ]);
  if (profileRes.error) throw profileRes.error;
  if (savedRes.error) throw savedRes.error;
  if (appsRes.error) throw appsRes.error;
  return {
    exportedAt: new Date().toISOString(),
    profile: profileRes.data,
    savedOpportunities: savedRes.data,
    applications: appsRes.data,
  };
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function deleteAccount(accessToken) {
  const res = await fetch("/api/delete-account", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete account.");
  return data;
}
