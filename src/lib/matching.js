// Turns a profile + opportunity into a match score and human-readable
// reasons/gaps. This replaces the hardcoded match/reasons/gaps that used
// to live directly on each mock opportunity — now it's computed live
// from whatever the signed-in user actually put in their profile.

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .split(/[,\/\n]|\band\b/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function tokensOverlap(a, b) {
  // loose match: either token contains the other, so "sql" matches
  // "sql experience preferred" and vice versa
  return a.includes(b) || b.includes(a);
}

export function scoreOpportunity(profile, opportunity) {
  const profileTokens = [
    ...tokenize(profile?.skills),
    ...tokenize(profile?.education),
    ...tokenize(profile?.field_of_study),
    ...tokenize(profile?.job_title),
  ].filter((t) => t.length > 2);

  const requirementTokens = (opportunity.requirements || []).map((r) => r.toLowerCase());
  const locationMatch =
    profile?.city && opportunity.location &&
    profile.city.toLowerCase().trim() === opportunity.location.toLowerCase().trim();
  const provinceMatch =
    profile?.province && opportunity.province &&
    profile.province.toLowerCase().trim() === opportunity.province.toLowerCase().trim();

  const reasons = [];
  const gaps = [];

  requirementTokens.forEach((req) => {
    const hit = profileTokens.some((pt) => tokensOverlap(req, pt));
    if (hit) reasons.push(req.charAt(0).toUpperCase() + req.slice(1));
    else gaps.push(req.charAt(0).toUpperCase() + req.slice(1));
  });

  if (locationMatch) reasons.unshift("Your location matches");
  else if (provinceMatch) reasons.unshift("Your province matches");
  else if (profile?.city || profile?.province) gaps.unshift("Location doesn't match your preference");

  const reqCount = Math.max(requirementTokens.length, 1);
  const reqHitRatio = (reasons.length - (locationMatch || provinceMatch ? 1 : 0)) / reqCount;
  let score = Math.round(35 + reqHitRatio * 50 + (locationMatch ? 12 : provinceMatch ? 6 : 0));
  score = Math.min(97, Math.max(18, score));

  return {
    match: score,
    reasons: reasons.slice(0, 4),
    gaps: gaps.slice(0, 3),
  };
}

export function withMatchScores(profile, opportunities) {
  return opportunities.map((o) => ({ ...o, ...scoreOpportunity(profile, o) }));
}
