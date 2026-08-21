// Every notification here is derived from real data already in the app —
// nothing is invented or randomly generated. Each category respects the
// user's own toggle in Notification Preferences (profile.raw.notification_prefs).
//
// Categories NOT implemented yet (newMatch, cvTips, skillsRecommendation):
// these would need either a "seen opportunities" tracking table or a
// scheduled job, neither of which exist yet. Better to have the toggle
// exist with nothing behind it than to fake activity for it.

function daysUntil(isoDateStr) {
    if (!isoDateStr) return null;
    const now = new Date();
    const target = new Date(isoDateStr);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target - startOfToday) / 86_400_000);
  }
  
  export function buildNotifications(profile, opportunities, savedIds, applications) {
    const prefs = profile?.raw?.notification_prefs || {};
    const items = [];
  
    // Profile incomplete
    if (prefs.profileIncomplete !== false && profile && profile.completion < 100) {
      items.push({
        id: "profile-incomplete",
        kind: "profileIncomplete",
        title: "Complete your profile",
        body: `You're at ${profile.completion}% — finishing it improves your opportunity matches.`,
        tone: "amber",
        action: "profile",
      });
    }
  
    // Interviews coming up (today through next 7 days)
    if (prefs.interviewReminder !== false) {
      applications
        .filter((a) => a.status === "Interview" && a.interviewDateRaw)
        .forEach((a) => {
          const d = daysUntil(a.interviewDateRaw);
          if (d !== null && d >= 0 && d <= 7) {
            items.push({
              id: `interview-${a.id}`,
              kind: "interviewReminder",
              title: d === 0 ? "Interview today" : d === 1 ? "Interview tomorrow" : `Interview in ${d} days`,
              body: `${a.title} at ${a.org} — ${a.interviewDate}`,
              tone: "teal",
              action: "application",
              data: a,
            });
          }
        });
    }
  
    // Saved opportunities closing soon (next 5 days)
    if (prefs.closingSoon !== false) {
      opportunities
        .filter((o) => savedIds.has(o.id) && o.closingRaw)
        .forEach((o) => {
          const d = daysUntil(o.closingRaw);
          if (d !== null && d >= 0 && d <= 5) {
            items.push({
              id: `closing-${o.id}`,
              kind: "closingSoon",
              title: d === 0 ? "Closes today" : d === 1 ? "Closes tomorrow" : `Closes in ${d} days`,
              body: `${o.title} at ${o.org}`,
              tone: "coral",
              action: "opportunity",
              data: o,
            });
          }
        });
    }
  
    // Applications sitting at "Applied" for a week or more — nudge to follow up
    if (prefs.followUp !== false) {
      applications
        .filter((a) => a.status === "Applied" && a.appliedDateRaw)
        .forEach((a) => {
          const d = daysUntil(a.appliedDateRaw);
          if (d !== null && d <= -7 && d >= -30) {
            items.push({
              id: `followup-${a.id}`,
              kind: "followUp",
              title: "Consider following up",
              body: `You applied to ${a.title} ${Math.abs(d)} days ago — a polite follow-up email can help.`,
              tone: "indigo",
              action: "application",
              data: a,
            });
          }
        });
    }
  
    return items;
  }