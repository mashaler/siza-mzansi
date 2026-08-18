import React, { useState, useMemo } from "react";
import {
  Home, Search, FileText, User, Briefcase, ChevronRight, ChevronLeft,
  Check, X, AlertTriangle, MapPin, Clock, TrendingUp, Shield,
  MessageSquare, Plus, Sparkles, Award, BookOpen, Bell, ArrowRight,
  Upload, Download, ShieldCheck, ShieldAlert, ShieldQuestion, Users,
  BarChart3, Flag, Settings, LogOut, GraduationCap, Building2, Star
} from "lucide-react";

/* ---------------------------------------------------------------
   DESIGN TOKENS
   Palette: highveld-light neutrals + "opportunity gold" (primary
   action / match colour) + "trust teal" (verified / secondary) +
   "flag coral" (risk / alerts). Numbers render in mono, everything
   else in a geometric display + humanist body pairing.
----------------------------------------------------------------*/
const T = {
  paper: "#FAF9F4",
  surface: "#FFFFFF",
  surfaceSunk: "#F1EEE4",
  ink: "#1C2130",
  inkMuted: "#68697A",
  inkFaint: "#9C9DAE",
  border: "#E7E2D3",
  amber: "#C1791F",
  amberDeep: "#9C5F14",
  amberSoft: "#F3E3C4",
  teal: "#1E6F63",
  tealSoft: "#DBEBE6",
  coral: "#BF4F39",
  coralSoft: "#F4DCD4",
  indigo: "#232A44",
  indigoSoft: "#DEE1EC",
};

/* ---------------------------------------------------------------
   MOCK DATA
----------------------------------------------------------------*/
const OPPORTUNITIES = [
  {
    id: "o1", title: "Junior Software Tester", org: "Thusong Digital",
    type: "Job", location: "Johannesburg", province: "Gauteng",
    closing: "28 Aug 2026", experience: "0–1 years", salary: "R14,000 – R18,000/mo",
    match: 92, verified: true,
    reasons: ["Your Java coursework matches", "Testing project on your CV matches", "Location matches your preference"],
    gaps: ["SQL experience preferred"],
    description: "Join a small QA team supporting a retail banking client. You'll write manual test cases, learn automation basics on Playwright, and pair with senior testers.",
    requirements: ["Matric + IT-related qualification", "Basic understanding of SDLC", "Strong attention to detail"],
  },
  {
    id: "o2", title: "Graduate Data Analyst Programme", org: "Kagiso Insurance Group",
    type: "Graduate Programme", location: "Sandton", province: "Gauteng",
    closing: "05 Sep 2026", experience: "Graduate", salary: "R16,500/mo",
    match: 78, verified: true,
    reasons: ["Statistics major matches", "Excel proficiency matches"],
    gaps: ["Python not yet on your profile", "Power BI not yet on your profile"],
    description: "A 12-month structured graduate programme rotating through underwriting, claims and actuarial analytics teams.",
    requirements: ["BSc/BCom with Statistics or similar", "Strong Excel skills", "Willingness to relocate to Sandton"],
  },
  {
    id: "o3", title: "IT Support Learnership (NQF4)", org: "Vodacom Foundation",
    type: "Learnership", location: "Midrand", province: "Gauteng",
    closing: "12 Sep 2026", experience: "Entry level", salary: "R4,500/mo stipend",
    match: 65, verified: true,
    reasons: ["Matric requirement met"],
    gaps: ["No formal IT support experience yet", "CompTIA A+ not listed"],
    description: "A 12-month accredited learnership combining classroom training with on-the-job IT service desk experience.",
    requirements: ["Matric with Maths or Maths Literacy", "South African citizen aged 18–28", "Not currently studying full-time"],
  },
  {
    id: "o4", title: "Marketing Internship", org: "Nandi & Co Communications",
    type: "Internship", location: "Cape Town", province: "Western Cape",
    closing: "30 Aug 2026", experience: "0–1 years", salary: "R6,000/mo stipend",
    match: 41, verified: false,
    reasons: ["Communication skills listed on profile"],
    gaps: ["Location doesn't match your preference", "No marketing coursework on profile"],
    description: "6-month internship supporting social content, client reporting and campaign coordination for a boutique agency.",
    requirements: ["Diploma or degree in Marketing/Communications", "Own laptop", "Portfolio of written work"],
  },
  {
    id: "o5", title: "Sasol Engineering Bursary 2027", org: "Sasol",
    type: "Bursary", location: "Secunda", province: "Mpumalanga",
    closing: "20 Sep 2026", experience: "Matric / 1st year", salary: "Full cover + stipend",
    match: 55, verified: true,
    reasons: ["Maths & Science subjects match"],
    gaps: ["Application essay not yet started"],
    description: "Full bursary covering tuition, accommodation and a monthly allowance for students pursuing Chemical or Mechanical Engineering.",
    requirements: ["Matric with 70%+ in Maths & Physical Science", "South African citizen", "Household income below threshold"],
  },
];

const APPLICATIONS_SEED = [
  { id: "a1", title: "Junior Software Tester", org: "Thusong Digital", status: "Interview", appliedDate: "02 Aug 2026", interviewDate: "22 Aug 2026, 10:00", notes: "Panel interview via Teams, ask about test automation tooling." },
  { id: "a2", title: "IT Support Learnership (NQF4)", org: "Vodacom Foundation", status: "Applied", appliedDate: "10 Aug 2026", interviewDate: "", notes: "" },
  { id: "a3", title: "Data Capturer", org: "Gauteng Dept of Health", status: "Rejected", appliedDate: "15 Jul 2026", interviewDate: "", notes: "Position filled internally." },
  { id: "a4", title: "Graduate Data Analyst Programme", org: "Kagiso Insurance Group", status: "Saved", appliedDate: "", interviewDate: "", notes: "" },
];

const STATUS_ORDER = ["Saved", "Planning to Apply", "Applied", "Assessment", "Interview", "Offer", "Rejected", "Withdrawn"];
const STATUS_COLOR = {
  Saved: T.inkMuted, "Planning to Apply": T.indigo, Applied: T.amberDeep,
  Assessment: T.amber, Interview: T.teal, Offer: "#1E7A3F", Rejected: T.coral, Withdrawn: T.inkFaint,
};

const SKILLS_TARGETS = {
  "Junior Data Analyst": [
    { name: "Excel", level: "have" }, { name: "SQL", level: "have" },
    { name: "Python", level: "partial" }, { name: "Power BI", level: "missing" },
    { name: "Statistics fundamentals", level: "have" },
  ],
  "Junior Software Tester": [
    { name: "Manual testing", level: "have" }, { name: "SQL", level: "partial" },
    { name: "Test automation (Playwright)", level: "partial" }, { name: "API testing (Postman)", level: "missing" },
  ],
};

const INTERVIEW_QUESTIONS = {
  Job: {
    behavioural: ["Tell me about a time you found a defect others had missed.", "Describe a situation where you disagreed with a teammate's approach."],
    technical: ["What's the difference between smoke testing and regression testing?", "How would you test a login form with no documentation?"],
    company: ["Why do you want to work at Thusong Digital specifically?"],
    ask: ["What does the first 90 days in this role look like?", "How does the team decide what to automate first?"],
  },
  "Graduate Programme": {
    behavioural: ["Describe a group project where you had to manage conflicting priorities.", "Tell me about a time you had to learn something quickly."],
    technical: ["Walk me through how you'd clean a messy dataset.", "What's the difference between correlation and causation?"],
    company: ["What attracts you to a rotational programme rather than a fixed role?"],
    ask: ["Which teams does this programme rotate through?", "Is there a mentor assigned during the programme?"],
  },
  Learnership: {
    behavioural: ["Tell me about a time you had to follow a strict process.", "How do you stay motivated during repetitive tasks?"],
    technical: ["What would you check first if a user says 'my laptop won't connect to WiFi'?"],
    company: ["Why does IT support interest you as a starting point in your career?"],
    ask: ["What happens after the 12 months if I perform well?"],
  },
  Internship: {
    behavioural: ["Tell me about a time you had to meet a tight deadline."],
    technical: ["How would you plan a week's worth of social content for a small brand?"],
    company: ["What campaigns of ours have you seen?"],
    ask: ["Will there be a chance to lead a small campaign during the internship?"],
  },
  Bursary: {
    behavioural: ["Why did you choose this field of study?"],
    technical: ["What's a school project you're proud of and why?"],
    company: ["What do you know about our work-back obligation?"],
    ask: ["What vacation work is available during the bursary?"],
  },
};

const ADMIN_STATS = {
  totalUsers: 4218, activeUsers: 1904, opportunities: 312, applications: 6120,
  cvsCreated: 2871, interviewsTracked: 640, reportedScams: 17,
};

const REPORTED_OPPORTUNITIES = [
  { id: "r1", title: "Work From Home – Earn R8000/week Guaranteed", org: "QuickCash Trading", risk: "High", reason: "Requests upfront 'registration fee', unrealistic guaranteed earnings." },
  { id: "r2", title: "Data Capturer Needed Urgently", org: "info@dcapture-jobs7.ru", risk: "High", reason: "Suspicious contact domain, pressure to respond within 2 hours." },
  { id: "r3", title: "Admin Assistant – Immediate Start", org: "Prime Office Solutions", risk: "Caution", reason: "No company website found; salary slightly above market for role." },
];

/* ---------------------------------------------------------------
   SIGNATURE ELEMENT — the Opportunity Ring.
   One radial-progress motif reused for match %, profile
   completion, CV score and skill mastery — the whole product's
   thesis ("how close are you, and to what") made visual.
----------------------------------------------------------------*/
function Ring({ value, size = 56, stroke = 6, color, trackColor = T.border, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function matchColor(v) {
  if (v >= 80) return T.teal;
  if (v >= 55) return T.amber;
  return T.coral;
}

/* ---------------------------------------------------------------
   SMALL UI PRIMITIVES
----------------------------------------------------------------*/
function Pill({ children, bg, color, style }) {
  return (
    <span
      className="f-body"
      style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, letterSpacing: 0.2, ...style }}
    >
      {children}
    </span>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: T.paper, borderBottom: `1px solid ${T.border}`, paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex items-center" style={{ padding: "14px 16px", gap: 10 }}>
        {onBack && (
          <button onClick={onBack} style={{ color: T.ink }} aria-label="Back">
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="f-display" style={{ fontSize: 18, fontWeight: 700, color: T.ink, flex: 1 }}>{title}</h1>
        {right}
      </div>
    </div>
  );
}

function TypeTag({ type }) {
  const map = {
    Job: { bg: T.indigoSoft, c: T.indigo },
    "Graduate Programme": { bg: T.tealSoft, c: T.teal },
    Learnership: { bg: T.amberSoft, c: T.amberDeep },
    Internship: { bg: T.amberSoft, c: T.amberDeep },
    Bursary: { bg: T.coralSoft, c: T.coral },
  };
  const s = map[type] || { bg: T.surfaceSunk, c: T.inkMuted };
  return <Pill bg={s.bg} color={s.c}>{type}</Pill>;
}

function OpportunityCard({ o, saved, onToggleSave, onOpen }) {
  return (
    <button
      onClick={() => onOpen(o.id)}
      className="f-body"
      style={{
        display: "block", width: "100%", textAlign: "left", background: T.surface,
        border: `1px solid ${T.border}`, borderRadius: 16, padding: 14, marginBottom: 10,
      }}
    >
      <div className="flex items-start justify-between" style={{ gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <TypeTag type={o.type} />
            {o.verified ? (
              <Pill bg={T.tealSoft} color={T.teal}><span className="flex items-center" style={{ gap: 3 }}><ShieldCheck size={11} /> Verified</span></Pill>
            ) : (
              <Pill bg={T.surfaceSunk} color={T.inkMuted}><span className="flex items-center" style={{ gap: 3 }}><ShieldQuestion size={11} /> Needs review</span></Pill>
            )}
          </div>
          <h3 className="f-display" style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 2 }}>{o.title}</h3>
          <p style={{ fontSize: 13, color: T.inkMuted, marginBottom: 8 }}>{o.org}</p>
          <div className="flex items-center flex-wrap" style={{ gap: 10, fontSize: 12, color: T.inkMuted }}>
            <span className="flex items-center" style={{ gap: 4 }}><MapPin size={12} /> {o.location}</span>
            <span className="flex items-center" style={{ gap: 4 }}><Clock size={12} /> Closes {o.closing}</span>
          </div>
        </div>
        <div className="flex flex-col items-center" style={{ gap: 6 }}>
          <Ring value={o.match} size={48} stroke={5} color={matchColor(o.match)}>
            <span className="f-mono" style={{ fontSize: 12, fontWeight: 600, color: matchColor(o.match) }}>{o.match}%</span>
          </Ring>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(o.id); }}
            aria-label={saved ? `Remove ${o.title} from saved` : `Save ${o.title}`}
            aria-pressed={saved}
            style={{ color: saved ? T.amber : T.inkFaint, padding: 4 }}
          >
            <Star size={17} fill={saved ? T.amber : "none"} />
          </button>
        </div>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------
   STAGE 0 — LANDING
----------------------------------------------------------------*/
function Landing({ onStart }) {
  return (
    <div className="sm-scroll" style={{ height: "100%", overflowY: "auto", background: T.indigo }}>
      <div style={{ padding: "calc(env(safe-area-inset-top) + 32px) 24px 40px" }}>
        <div className="flex items-center" style={{ gap: 8, marginBottom: 40 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: T.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color={T.indigo} />
          </div>
          <span className="f-display" style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Siza Mzansi</span>
        </div>

        <h1 className="f-display" style={{ color: "#fff", fontSize: 34, lineHeight: 1.15, fontWeight: 700, marginBottom: 14 }}>
          We help you access opportunities.
        </h1>
        <p className="f-body" style={{ color: "#B9BEDB", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Find jobs, learnerships, internships and bursaries — and get the CV, skills plan and
          interview prep to actually land one.
        </p>

        <div className="flex items-center" style={{ gap: 14, marginBottom: 40 }}>
          <Ring value={92} size={72} stroke={7} color={T.amber}>
            <span className="f-mono" style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>92%</span>
          </Ring>
          <div>
            <p className="f-body" style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Junior Software Tester</p>
            <p className="f-body" style={{ color: "#8E93B8", fontSize: 12 }}>matched to a real profile, Johannesburg</p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="f-body"
          style={{ width: "100%", background: T.amber, color: "#221503", fontWeight: 700, fontSize: 15, padding: "14px 0", borderRadius: 14, marginBottom: 10 }}
        >
          Find Opportunities
        </button>
        <button
          onClick={onStart}
          className="f-body"
          style={{ width: "100%", background: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, padding: "13px 0", borderRadius: 14, border: "1px solid #454C74" }}
        >
          Create My CV
        </button>

        <div style={{ marginTop: 44, display: "grid", gap: 14 }}>
          {[
            ["Find opportunities made for you", TrendingUp],
            ["Build a better CV, with AI help you control", FileText],
            ["Know exactly what skills you need next", Award],
            ["Track every application in one place", Briefcase],
          ].map(([txt, Icon], i) => (
            <div key={i} className="flex items-center" style={{ gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#2E3559", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color={T.amber} />
              </div>
              <span className="f-body" style={{ color: "#D6D9EC", fontSize: 13.5 }}>{txt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   STAGE 1 — ONBOARDING
----------------------------------------------------------------*/
function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", phone: "", province: "", city: "",
    education: "", fieldOfStudy: "", experience: "", skills: "",
    jobTitle: "", industries: "", relocate: false, remote: true,
  });
  const steps = ["Basics", "Education & experience", "Preferences"];
  const stepPct = Math.round(((step + 1) / steps.length) * 100);
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const finish = (data) => {
    const filled = Object.entries(data).filter(([k, v]) => {
      if (k === "relocate" || k === "remote") return true; // booleans always "answered"
      return String(v).trim().length > 0;
    }).length;
    const completion = Math.max(20, Math.round((filled / Object.keys(data).length) * 100));
    onFinish({
      name: data.name.trim() || "New user",
      title: data.jobTitle.trim() || "Job seeker",
      location: data.city.trim() || data.province.trim() || "South Africa",
      completion,
      raw: data,
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.paper }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span className="f-display" style={{ fontWeight: 700, color: T.ink, fontSize: 16 }}>Set up your profile</span>
          <button onClick={() => finish(form)} className="f-body" style={{ color: T.inkMuted, fontSize: 13 }}>Skip</button>
        </div>
        <div style={{ height: 6, background: T.surfaceSunk, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${stepPct}%`, background: T.amber, transition: "width .4s ease" }} />
        </div>
        <p className="f-mono" style={{ fontSize: 11, color: T.inkMuted, marginTop: 6 }}>{stepPct}% through setup · {steps[step]}</p>
      </div>

      <div className="sm-scroll" style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {step === 0 && (
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Full name" placeholder="e.g. Lindiwe Khumalo" value={form.name} onChange={set("name")} />
            <Field label="Phone number" placeholder="082 000 0000" value={form.phone} onChange={set("phone")} type="tel" />
            <Field label="Province" placeholder="Gauteng" value={form.province} onChange={set("province")} />
            <Field label="City / town" placeholder="Johannesburg" value={form.city} onChange={set("city")} />
          </div>
        )}
        {step === 1 && (
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Highest education level" placeholder="Diploma in IT" value={form.education} onChange={set("education")} />
            <Field label="Field of study" placeholder="Information Technology" value={form.fieldOfStudy} onChange={set("fieldOfStudy")} />
            <Field label="Years of experience" placeholder="0–1 years" value={form.experience} onChange={set("experience")} />
            <Field label="Key skills" placeholder="Manual testing, Excel, SQL" value={form.skills} onChange={set("skills")} />
          </div>
        )}
        {step === 2 && (
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Desired job title" placeholder="Junior Software Tester" value={form.jobTitle} onChange={set("jobTitle")} />
            <Field label="Preferred industries" placeholder="Tech, Banking" value={form.industries} onChange={set("industries")} />
            <div className="flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <span className="f-body" style={{ fontSize: 13.5, color: T.ink }}>Willing to relocate</span>
              <Toggle checked={form.relocate} onChange={set("relocate")} label="Willing to relocate" />
            </div>
            <div className="flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <span className="f-body" style={{ fontSize: 13.5, color: T.ink }}>Open to remote work</span>
              <Toggle checked={form.remote} onChange={set("remote")} label="Open to remote work" />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 20, borderTop: `1px solid ${T.border}` }}>
        <button
          onClick={() => (step < 2 ? setStep(step + 1) : finish(form))}
          className="f-body"
          style={{ width: "100%", background: T.ink, color: "#fff", fontWeight: 600, fontSize: 14.5, padding: "13px 0", borderRadius: 12 }}
        >
          {step < 2 ? "Continue" : "Finish set up"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <label className="f-body" style={{ display: "block" }}>
      <span style={{ fontSize: 12, color: T.inkMuted, fontWeight: 600, marginBottom: 5, display: "block" }}>{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, color: T.ink, outline: "none" }}
      />
    </label>
  );
}

function Toggle({ checked, onChange, defaultOn = false, label }) {
  // Supports both controlled (checked/onChange) and uncontrolled (defaultOn) use.
  const isControlled = typeof checked === "boolean";
  const [internal, setInternal] = useState(defaultOn);
  const on = isControlled ? checked : internal;
  const flip = () => (isControlled ? onChange(!on) : setInternal(!on));
  return (
    <button
      onClick={flip} role="switch" aria-checked={on} aria-label={label}
      style={{ width: 40, height: 23, borderRadius: 999, background: on ? T.teal : T.border, position: "relative", transition: "background .2s", flexShrink: 0 }}
    >
      <div style={{ width: 17, height: 17, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 20 : 3, transition: "left .2s" }} />
    </button>
  );
}

/* ---------------------------------------------------------------
   HOME TAB
----------------------------------------------------------------*/
function HomeTab({ opportunities, saved, onToggleSave, onOpen, profile }) {
  const [filter, setFilter] = useState("Recommended");
  const tabs = ["Recommended", "New", "Learnerships", "Internships", "Bursaries"];
  const filtered = useMemo(() => {
    if (filter === "Recommended") return [...opportunities].sort((a, b) => b.match - a.match).slice(0, 4);
    if (filter === "New") return opportunities;
    if (filter === "Learnerships") return opportunities.filter((o) => o.type === "Learnership");
    if (filter === "Internships") return opportunities.filter((o) => o.type === "Internship");
    if (filter === "Bursaries") return opportunities.filter((o) => o.type === "Bursary");
    return opportunities;
  }, [filter, opportunities]);

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
        <div>
          <p className="f-body" style={{ fontSize: 13, color: T.inkMuted }}>Good morning</p>
          <h1 className="f-display" style={{ fontSize: 21, fontWeight: 700, color: T.ink }}>{profile.name} 👋</h1>
        </div>
        <div style={{ position: "relative" }}>
          <Bell size={20} color={T.ink} />
          <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: T.coral }} />
        </div>
      </div>

      <div style={{ background: T.indigo, borderRadius: 18, padding: 18, marginBottom: 18 }} className="flex items-center justify-between">
        <div>
          <p className="f-mono" style={{ color: T.amber, fontSize: 26, fontWeight: 600 }}>{opportunities.length}</p>
          <p className="f-body" style={{ color: "#C4C8E4", fontSize: 12.5 }}>opportunities matched to you today</p>
        </div>
        <Ring value={profile.completion} size={54} stroke={5} color={T.amber} trackColor="#3A4066">
          <span className="f-mono" style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{profile.completion}%</span>
        </Ring>
      </div>
      {profile.completion < 100 && (
        <div className="flex items-center justify-between" style={{ background: T.amberSoft, borderRadius: 12, padding: "10px 14px", marginBottom: 18 }}>
          <span className="f-body" style={{ fontSize: 12.5, color: T.amberDeep, fontWeight: 600 }}>Complete your profile to improve matches</span>
          <ChevronRight size={16} color={T.amberDeep} />
        </div>
      )}

      <div className="flex sm-scroll" style={{ gap: 8, overflowX: "auto", marginBottom: 14, paddingBottom: 2 }}>
        {tabs.map((t) => (
          <button
            key={t} onClick={() => setFilter(t)} className="f-body"
            style={{
              whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 600, padding: "7px 14px", borderRadius: 999,
              background: filter === t ? T.ink : T.surface, color: filter === t ? "#fff" : T.inkMuted,
              border: `1px solid ${filter === t ? T.ink : T.border}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.map((o) => (
        <OpportunityCard key={o.id} o={o} saved={saved.has(o.id)} onToggleSave={onToggleSave} onOpen={onOpen} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   OPPORTUNITIES TAB (search + filters)
----------------------------------------------------------------*/
function OpportunitiesTab({ opportunities, saved, onToggleSave, onOpen }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const types = ["All", "Job", "Learnership", "Internship", "Bursary", "Graduate Programme"];
  const filtered = opportunities.filter(
    (o) => (type === "All" || o.type === type) && (o.title.toLowerCase().includes(q.toLowerCase()) || o.org.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <h1 className="f-display" style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Opportunities</h1>
      <div className="flex items-center" style={{ gap: 8, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
        <Search size={16} color={T.inkFaint} />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or organisation"
          className="f-body" style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, background: "transparent", color: T.ink }}
        />
      </div>
      <div className="flex sm-scroll" style={{ gap: 8, overflowX: "auto", marginBottom: 16 }}>
        {types.map((t) => (
          <button
            key={t} onClick={() => setType(t)} className="f-body"
            style={{
              whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 600, padding: "7px 14px", borderRadius: 999,
              background: type === t ? T.teal : T.surface, color: type === t ? "#fff" : T.inkMuted,
              border: `1px solid ${type === t ? T.teal : T.border}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="f-mono" style={{ fontSize: 11.5, color: T.inkMuted, marginBottom: 10 }}>{filtered.length} results</p>
      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matches" body="Try a different keyword or clear your filters." />
      ) : (
        filtered.map((o) => <OpportunityCard key={o.id} o={o} saved={saved.has(o.id)} onToggleSave={onToggleSave} onOpen={onOpen} />)
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, cta, onCta }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: T.surfaceSunk, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <Icon size={22} color={T.inkFaint} />
      </div>
      <p className="f-display" style={{ fontWeight: 700, fontSize: 15, color: T.ink, marginBottom: 4 }}>{title}</p>
      <p className="f-body" style={{ fontSize: 13, color: T.inkMuted, marginBottom: cta ? 16 : 0 }}>{body}</p>
      {cta && (
        <button onClick={onCta} className="f-body" style={{ background: T.ink, color: "#fff", fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 10 }}>
          {cta}
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   OPPORTUNITY DETAIL OVERLAY
----------------------------------------------------------------*/
function OpportunityDetail({ o, saved, onToggleSave, onBack, onPrepInterview, applications, onApply }) {
  const applied = applications.some((a) => a.title === o.title);
  return (
    <div style={{ height: "100%", background: T.paper, display: "flex", flexDirection: "column" }}>
      <TopBar title="Opportunity" onBack={onBack} />
      <div className="sm-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }}>
        <div className="flex items-center" style={{ gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <TypeTag type={o.type} />
          {o.verified ? (
            <Pill bg={T.tealSoft} color={T.teal}><span className="flex items-center" style={{ gap: 3 }}><ShieldCheck size={11} /> Verified opportunity</span></Pill>
          ) : (
            <Pill bg={T.surfaceSunk} color={T.inkMuted}><span className="flex items-center" style={{ gap: 3 }}><ShieldQuestion size={11} /> Needs review</span></Pill>
          )}
        </div>
        <h1 className="f-display" style={{ fontSize: 22, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{o.title}</h1>
        <p className="f-body" style={{ fontSize: 14, color: T.inkMuted, marginBottom: 14 }}>{o.org} · {o.location}</p>

        <div className="flex" style={{ gap: 10, marginBottom: 18 }}>
          {[["Closing", o.closing], ["Experience", o.experience], ["Salary", o.salary]].map(([k, v]) => (
            <div key={k} style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 10 }}>
              <p style={{ fontSize: 10.5, color: T.inkFaint, fontWeight: 600, marginBottom: 3 }}>{k.toUpperCase()}</p>
              <p style={{ fontSize: 12, color: T.ink, fontWeight: 600 }}>{v}</p>
            </div>
          ))}
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <div className="flex items-center" style={{ gap: 14, marginBottom: 14 }}>
            <Ring value={o.match} size={64} stroke={6} color={matchColor(o.match)}>
              <span className="f-mono" style={{ fontSize: 15, fontWeight: 600, color: matchColor(o.match) }}>{o.match}%</span>
            </Ring>
            <div>
              <p className="f-display" style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>Match score</p>
              <p className="f-body" style={{ fontSize: 12, color: T.inkMuted }}>Based on your profile, CV and preferences</p>
            </div>
          </div>
          {o.reasons.map((r, i) => (
            <div key={i} className="flex items-start" style={{ gap: 8, marginBottom: 6 }}>
              <Check size={14} color={T.teal} style={{ marginTop: 2, flexShrink: 0 }} />
              <span className="f-body" style={{ fontSize: 13, color: T.ink }}>{r}</span>
            </div>
          ))}
          {o.gaps.map((g, i) => (
            <div key={i} className="flex items-start" style={{ gap: 8, marginBottom: 6 }}>
              <AlertTriangle size={14} color={T.amber} style={{ marginTop: 2, flexShrink: 0 }} />
              <span className="f-body" style={{ fontSize: 13, color: T.ink }}>{g}</span>
            </div>
          ))}
        </div>

        <Section title="About this opportunity"><p className="f-body" style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.6 }}>{o.description}</p></Section>
        <Section title="Requirements">
          {o.requirements.map((r, i) => (
            <div key={i} className="flex items-start" style={{ gap: 8, marginBottom: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.inkMuted, marginTop: 7, flexShrink: 0 }} />
              <span className="f-body" style={{ fontSize: 13.5, color: T.ink }}>{r}</span>
            </div>
          ))}
        </Section>

        <button
          onClick={() => onPrepInterview(o)}
          className="f-body flex items-center justify-center"
          style={{ width: "100%", gap: 8, background: T.indigo, color: "#fff", fontWeight: 600, fontSize: 13.5, padding: "12px 0", borderRadius: 12, marginTop: 6 }}
        >
          <MessageSquare size={16} /> Prepare for this interview
        </button>
      </div>

      <div className="flex" style={{ gap: 10, padding: 16, borderTop: `1px solid ${T.border}`, background: T.paper }}>
        <button onClick={() => onToggleSave(o.id)} aria-label={saved ? "Remove from saved" : "Save opportunity"} aria-pressed={saved} style={{ width: 48, height: 48, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Star size={18} color={saved ? T.amber : T.inkFaint} fill={saved ? T.amber : "none"} />
        </button>
        <button
          onClick={() => onApply(o)} disabled={applied}
          className="f-body" style={{ flex: 1, background: applied ? T.surfaceSunk : T.amber, color: applied ? T.inkMuted : "#221503", fontWeight: 700, fontSize: 14.5, borderRadius: 12 }}
        >
          {applied ? "Already tracked" : "Apply & track"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p className="f-display" style={{ fontWeight: 700, fontSize: 14, color: T.ink, marginBottom: 8 }}>{title}</p>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------
   APPLICATIONS TAB
----------------------------------------------------------------*/
function ApplicationsTab({ applications, onOpenApp }) {
  const counts = STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: applications.filter((a) => a.status === s).length }), {});
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <h1 className="f-display" style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Applications</h1>

      <div className="flex" style={{ gap: 10, marginBottom: 18 }}>
        {[["Applied", counts["Applied"] + counts["Assessment"] + counts["Interview"] + counts["Offer"]], ["Interviews", counts["Interview"]], ["Offers", counts["Offer"]]].map(([k, v]) => (
          <div key={k} style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 12, textAlign: "center" }}>
            <p className="f-mono" style={{ fontSize: 20, fontWeight: 600, color: T.ink }}>{v}</p>
            <p style={{ fontSize: 11, color: T.inkMuted }}>{k}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={Briefcase} title="No applications yet" body="Applications you track will show up here." />
      ) : (
        STATUS_ORDER.filter((s) => counts[s] > 0).map((status) => (
          <div key={status} style={{ marginBottom: 16 }}>
            <div className="flex items-center" style={{ gap: 7, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLOR[status] }} />
              <p className="f-body" style={{ fontSize: 12.5, fontWeight: 700, color: T.ink }}>{status}</p>
              <span className="f-mono" style={{ fontSize: 11, color: T.inkFaint }}>{counts[status]}</span>
            </div>
            {applications.filter((a) => a.status === status).map((a) => (
              <button key={a.id} onClick={() => onOpenApp(a)} className="f-body" style={{ display: "block", width: "100%", textAlign: "left", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: T.inkMuted }}>{a.org}</p>
                  </div>
                  <ChevronRight size={16} color={T.inkFaint} />
                </div>
                {a.interviewDate && (
                  <div className="flex items-center" style={{ gap: 5, marginTop: 8 }}>
                    <Clock size={12} color={T.teal} />
                    <span style={{ fontSize: 11.5, color: T.teal, fontWeight: 600 }}>Interview {a.interviewDate}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function ApplicationDetail({ app, onBack, onChangeStatus }) {
  return (
    <div style={{ height: "100%", background: T.paper }}>
      <TopBar title="Application" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <p className="f-display" style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>{app.title}</p>
        <p className="f-body" style={{ fontSize: 13, color: T.inkMuted, marginBottom: 16 }}>{app.org}</p>

        <p className="f-body" style={{ fontSize: 11.5, fontWeight: 700, color: T.inkMuted, marginBottom: 8 }}>STATUS</p>
        <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 20 }}>
          {STATUS_ORDER.map((s) => (
            <button
              key={s} onClick={() => onChangeStatus(app.id, s)} className="f-body"
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 999, background: app.status === s ? STATUS_COLOR[s] : T.surface, color: app.status === s ? "#fff" : T.inkMuted, border: `1px solid ${app.status === s ? STATUS_COLOR[s] : T.border}` }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {app.appliedDate && (
            <div className="flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
              <span className="f-body" style={{ fontSize: 13, color: T.inkMuted }}>Applied</span>
              <span className="f-mono" style={{ fontSize: 13, color: T.ink }}>{app.appliedDate}</span>
            </div>
          )}
          {app.interviewDate && (
            <div className="flex items-center justify-between" style={{ background: T.tealSoft, borderRadius: 12, padding: 12 }}>
              <span className="f-body" style={{ fontSize: 13, color: T.teal, fontWeight: 600 }}>Interview</span>
              <span className="f-mono" style={{ fontSize: 13, color: T.teal }}>{app.interviewDate}</span>
            </div>
          )}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
            <p className="f-body" style={{ fontSize: 11.5, color: T.inkFaint, fontWeight: 700, marginBottom: 5 }}>NOTES</p>
            <p className="f-body" style={{ fontSize: 13, color: T.ink }}>{app.notes || "No notes yet."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   CV TAB
----------------------------------------------------------------*/
function CvTab() {
  const [mode, setMode] = useState("builder");
  const sections = [
    { name: "Personal information", done: true }, { name: "Professional summary", done: true },
    { name: "Work experience", done: true }, { name: "Education", done: true },
    { name: "Skills", done: true }, { name: "Certifications", done: false },
    { name: "Projects", done: false }, { name: "Languages", done: true }, { name: "References", done: false },
  ];
  const donePct = Math.round((sections.filter((s) => s.done).length / sections.length) * 100);

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <h1 className="f-display" style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Your CV</h1>
      <div className="flex" style={{ gap: 8, marginBottom: 18, background: T.surfaceSunk, borderRadius: 12, padding: 4 }}>
        {[["builder", "Build with AI"], ["review", "AI review"]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className="f-body" style={{ flex: 1, fontSize: 12.5, fontWeight: 600, padding: "8px 0", borderRadius: 9, background: mode === k ? T.surface : "transparent", color: mode === k ? T.ink : T.inkMuted }}>
            {l}
          </button>
        ))}
      </div>

      {mode === "builder" ? (
        <>
          <div className="flex items-center" style={{ gap: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Ring value={donePct} size={56} stroke={6} color={T.teal}>
              <span className="f-mono" style={{ fontSize: 13, fontWeight: 600, color: T.teal }}>{donePct}%</span>
            </Ring>
            <div>
              <p className="f-display" style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>CV completeness</p>
              <p className="f-body" style={{ fontSize: 12, color: T.inkMuted }}>Finish remaining sections to unlock export</p>
            </div>
          </div>
          {sections.map((s) => (
            <div key={s.name} className="flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
              <div className="flex items-center" style={{ gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.done ? T.tealSoft : T.surfaceSunk, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.done ? <Check size={12} color={T.teal} /> : <Plus size={12} color={T.inkFaint} />}
                </div>
                <span className="f-body" style={{ fontSize: 13.5, color: T.ink }}>{s.name}</span>
              </div>
              <ChevronRight size={15} color={T.inkFaint} />
            </div>
          ))}
          <div style={{ background: T.tealSoft, borderRadius: 12, padding: 12, marginTop: 4, marginBottom: 16 }} className="flex items-start">
            <Sparkles size={15} color={T.teal} style={{ marginTop: 1, marginRight: 8, flexShrink: 0 }} />
            <p className="f-body" style={{ fontSize: 12, color: T.teal, lineHeight: 1.5 }}>
              AI-suggested text is always labelled <b>AI suggestion</b> and never invents jobs, employers or qualifications — you approve everything before it's added.
            </p>
          </div>
          <button className="f-body flex items-center justify-center" style={{ width: "100%", gap: 8, background: T.ink, color: "#fff", fontWeight: 600, fontSize: 14, padding: "13px 0", borderRadius: 12 }}>
            <Download size={16} /> Export as PDF
          </button>
        </>
      ) : (
        <CvReview />
      )}
    </div>
  );
}

function CvReview() {
  const [analysed, setAnalysed] = useState(false);
  if (!analysed) {
    return (
      <div style={{ textAlign: "center", padding: "40px 12px" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: T.surfaceSunk, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Upload size={22} color={T.inkMuted} />
        </div>
        <p className="f-display" style={{ fontWeight: 700, fontSize: 15, color: T.ink, marginBottom: 4 }}>Upload your existing CV</p>
        <p className="f-body" style={{ fontSize: 13, color: T.inkMuted, marginBottom: 18 }}>PDF or Word, up to 5MB. We'll score it and never fabricate details.</p>
        <button onClick={() => setAnalysed(true)} className="f-body" style={{ background: T.amber, color: "#221503", fontWeight: 700, fontSize: 13.5, padding: "11px 22px", borderRadius: 10 }}>
          Upload CV_Lindiwe_Khumalo.pdf (demo)
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center" style={{ gap: 16, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <Ring value={78} size={64} stroke={6} color={matchColor(78)}>
          <span className="f-mono" style={{ fontSize: 15, fontWeight: 600, color: matchColor(78) }}>78</span>
        </Ring>
        <div>
          <p className="f-display" style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>CV Score: 78/100</p>
          <p className="f-body" style={{ fontSize: 12, color: T.inkMuted }}>Good foundation, a few gaps to close</p>
        </div>
      </div>
      <ReviewBlock title="What you're doing well" icon={Check} color={T.teal} bg={T.tealSoft} items={["Clear, consistent formatting", "Quantified achievement in your testing project", "Skills section is easy to scan"]} />
      <ReviewBlock title="What needs improvement" icon={AlertTriangle} color={T.amber} bg={T.amberSoft} items={["Professional summary is generic — make it specific to QA roles", "No dedicated skills-to-role mapping for ATS scanning"]} />
      <ReviewBlock title="Recommended changes" icon={Sparkles} color={T.indigo} bg={T.indigoSoft} items={["Add measurable outcomes to each bullet ('reduced regression time by 20%')", "Move testing tools to the top of your skills list"]} />
      <ReviewBlock title="Skills you may want to develop" icon={Award} color={T.coral} bg={T.coralSoft} items={["SQL for test data validation", "API testing with Postman"]} />
    </div>
  );
}

function ReviewBlock({ title, icon: Icon, color, bg, items }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex items-center" style={{ gap: 7, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} color={color} />
        </div>
        <p className="f-body" style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{title}</p>
      </div>
      {items.map((it, i) => (
        <p key={i} className="f-body" style={{ fontSize: 12.5, color: T.inkMuted, marginBottom: 4, paddingLeft: 29 }}>· {it}</p>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   PROFILE TAB
----------------------------------------------------------------*/
function ProfileTab({ profile, onOpenTool, onToggleAdmin, onReset }) {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <h1 className="f-display" style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 18 }}>Profile</h1>
      <div className="flex items-center" style={{ gap: 14, marginBottom: 20 }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: T.indigo, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="f-display" style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{profile.name[0]}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p className="f-display" style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>{profile.name}</p>
          <p className="f-body" style={{ fontSize: 12.5, color: T.inkMuted }}>{profile.title} · {profile.location}</p>
        </div>
        <Ring value={profile.completion} size={44} stroke={5} color={T.teal}>
          <span className="f-mono" style={{ fontSize: 11, color: T.teal, fontWeight: 600 }}>{profile.completion}%</span>
        </Ring>
      </div>

      <p className="f-body" style={{ fontSize: 11.5, fontWeight: 700, color: T.inkFaint, marginBottom: 8 }}>CAREER TOOLS</p>
      {[
        { key: "skills", label: "Skills-gap analysis", desc: "See what's missing for your target role", icon: Award },
        { key: "scam", label: "Check an opportunity", desc: "Screen a job ad for scam warning signs", icon: Shield },
      ].map((t) => (
        <button key={t.key} onClick={() => onOpenTool(t.key)} className="f-body" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 13, marginBottom: 8, textAlign: "left" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.surfaceSunk, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <t.icon size={17} color={T.ink} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{t.label}</p>
            <p style={{ fontSize: 11.5, color: T.inkMuted }}>{t.desc}</p>
          </div>
          <ChevronRight size={16} color={T.inkFaint} />
        </button>
      ))}

      <p className="f-body" style={{ fontSize: 11.5, fontWeight: 700, color: T.inkFaint, margin: "18px 0 8px" }}>ACCOUNT</p>
      {[
        { label: "Notification preferences", icon: Bell }, { label: "Privacy & data", icon: Shield }, { label: "Settings", icon: Settings },
      ].map((t) => (
        <div key={t.label} className="flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 13, marginBottom: 8 }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <t.icon size={16} color={T.inkMuted} />
            <span style={{ fontSize: 13.5, color: T.ink }}>{t.label}</span>
          </div>
          <ChevronRight size={15} color={T.inkFaint} />
        </div>
      ))}

      <button onClick={onToggleAdmin} className="f-body flex items-center justify-center" style={{ width: "100%", gap: 8, marginTop: 16, background: T.indigoSoft, color: T.indigo, fontWeight: 600, fontSize: 13, padding: "11px 0", borderRadius: 12 }}>
        <Building2 size={15} /> View admin dashboard (demo)
      </button>
      <button className="f-body flex items-center justify-center" style={{ width: "100%", gap: 8, marginTop: 10, color: T.coral, fontWeight: 600, fontSize: 13, padding: "10px 0" }}>
        <LogOut size={15} /> Log out
      </button>
      <button
        onClick={() => { if (window.confirm("Reset all demo data (saved jobs, applications, profile)? This can't be undone.")) onReset(); }}
        className="f-body" style={{ width: "100%", marginTop: 4, color: T.inkFaint, fontWeight: 500, fontSize: 11.5, padding: "8px 0" }}
      >
        Reset demo data
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   SKILLS GAP OVERLAY
----------------------------------------------------------------*/
function SkillsGap({ onBack }) {
  const [target, setTarget] = useState("Junior Data Analyst");
  const skills = SKILLS_TARGETS[target];
  const haveCount = skills.filter((s) => s.level === "have").length;
  const pct = Math.round((haveCount / skills.length) * 100);
  const icon = { have: Check, partial: AlertTriangle, missing: X };
  const color = { have: T.teal, partial: T.amber, missing: T.coral };
  const nextSteps = {
    "Junior Data Analyst": ["Learn Python basics (start with pandas)", "Build one end-to-end data-analysis project", "Get comfortable with Power BI dashboards", "Add the project to your CV", "Apply for entry-level analyst roles"],
    "Junior Software Tester": ["Practice writing SQL queries against sample data", "Complete a Playwright basics tutorial", "Try API testing in Postman on a public API", "Add a personal testing project to your CV"],
  };
  return (
    <div style={{ height: "100%", background: T.paper }}>
      <TopBar title="Skills-gap analysis" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <p className="f-body" style={{ fontSize: 11.5, fontWeight: 700, color: T.inkFaint, marginBottom: 8 }}>TARGET ROLE</p>
        <div className="flex" style={{ gap: 8, marginBottom: 18 }}>
          {Object.keys(SKILLS_TARGETS).map((k) => (
            <button key={k} onClick={() => setTarget(k)} className="f-body" style={{ fontSize: 12, fontWeight: 600, padding: "8px 12px", borderRadius: 10, background: target === k ? T.ink : T.surface, color: target === k ? "#fff" : T.inkMuted, border: `1px solid ${target === k ? T.ink : T.border}` }}>
              {k}
            </button>
          ))}
        </div>

        <div className="flex items-center" style={{ gap: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <Ring value={pct} size={60} stroke={6} color={matchColor(pct)}>
            <span className="f-mono" style={{ fontSize: 14, fontWeight: 600, color: matchColor(pct) }}>{pct}%</span>
          </Ring>
          <div>
            <p className="f-display" style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{target}</p>
            <p className="f-body" style={{ fontSize: 12, color: T.inkMuted }}>{haveCount} of {skills.length} skills in place</p>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          {skills.map((s) => {
            const Icon = icon[s.level];
            return (
              <div key={s.name} className="flex items-center justify-between" style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <span className="f-body" style={{ fontSize: 13.5, color: T.ink }}>{s.name}</span>
                <span className="flex items-center" style={{ gap: 5, color: color[s.level] }}>
                  <Icon size={14} />
                  <span className="f-body" style={{ fontSize: 11.5, fontWeight: 600, textTransform: "capitalize" }}>{s.level}</span>
                </span>
              </div>
            );
          })}
        </div>

        <p className="f-display" style={{ fontWeight: 700, fontSize: 14, color: T.ink, marginBottom: 10 }}>Your next steps</p>
        {(nextSteps[target] || []).map((s, i) => (
          <div key={i} className="flex items-center" style={{ gap: 10, marginBottom: 8 }}>
            <div className="f-mono" style={{ width: 22, height: 22, borderRadius: "50%", background: T.amberSoft, color: T.amberDeep, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <span className="f-body" style={{ fontSize: 13, color: T.ink }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   INTERVIEW COACH OVERLAY
----------------------------------------------------------------*/
function InterviewCoach({ opportunity, onBack }) {
  const [practice, setPractice] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const qset = INTERVIEW_QUESTIONS[opportunity?.type] || INTERVIEW_QUESTIONS.Job;
  const practiceQ = qset.behavioural[0];

  const giveFeedback = () => {
    const words = answer.trim().split(/\s+/).filter(Boolean).length;
    if (words < 15) setFeedback({ tone: "amber", text: "A bit brief — try adding a concrete Situation, Task, Action and Result (STAR)." });
    else setFeedback({ tone: "teal", text: "Good structure and length. Consider naming a measurable result to make it land harder." });
  };

  return (
    <div style={{ height: "100%", background: T.paper, display: "flex", flexDirection: "column" }}>
      <TopBar title={practice ? "Practice mode" : "Interview prep"} onBack={practice ? () => setPractice(false) : onBack} />
      <div className="sm-scroll" style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {!practice ? (
          <>
            <p className="f-body" style={{ fontSize: 13, color: T.inkMuted, marginBottom: 18 }}>
              Tailored for <b style={{ color: T.ink }}>{opportunity?.title || "this role"}</b> at {opportunity?.org || "the organisation"}.
            </p>
            <QBlock title="Behavioural" items={qset.behavioural} color={T.indigo} bg={T.indigoSoft} />
            <QBlock title="Technical" items={qset.technical} color={T.teal} bg={T.tealSoft} />
            <QBlock title="About the company" items={qset.company} color={T.amberDeep} bg={T.amberSoft} />
            <QBlock title="Ask the interviewer" items={qset.ask} color={T.coral} bg={T.coralSoft} />
            <div style={{ background: T.surfaceSunk, borderRadius: 12, padding: 12, marginBottom: 18 }}>
              <p className="f-body" style={{ fontSize: 12, color: T.inkMuted, lineHeight: 1.5 }}>
                💡 Structure behavioural answers with <b>STAR</b>: Situation, Task, Action, Result. This isn't a guarantee of an offer — it's practice.
              </p>
            </div>
            <button onClick={() => setPractice(true)} className="f-body" style={{ width: "100%", background: T.ink, color: "#fff", fontWeight: 600, fontSize: 14, padding: "13px 0", borderRadius: 12 }}>
              Start practice mode
            </button>
          </>
        ) : (
          <>
            <p className="f-body" style={{ fontSize: 11.5, fontWeight: 700, color: T.inkFaint, marginBottom: 8 }}>QUESTION</p>
            <p className="f-display" style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 16 }}>{practiceQ}</p>
            <textarea
              value={answer} onChange={(e) => { setAnswer(e.target.value); setFeedback(null); }} rows={6}
              placeholder="Type your answer here..." className="f-body"
              style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontSize: 13.5, color: T.ink, outline: "none", marginBottom: 12, resize: "vertical" }}
            />
            <button onClick={giveFeedback} className="f-body" style={{ width: "100%", background: T.amber, color: "#221503", fontWeight: 700, fontSize: 13.5, padding: "12px 0", borderRadius: 12, marginBottom: 12 }}>
              Get feedback
            </button>
            {feedback && (
              <div style={{ background: feedback.tone === "teal" ? T.tealSoft : T.amberSoft, borderRadius: 12, padding: 12 }}>
                <p className="f-body" style={{ fontSize: 13, color: feedback.tone === "teal" ? T.teal : T.amberDeep, lineHeight: 1.5 }}>{feedback.text}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QBlock({ title, items, color, bg }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <Pill bg={bg} color={color} style={{ marginBottom: 8, display: "inline-block" }}>{title}</Pill>
      {items.map((q, i) => (
        <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginBottom: 6 }}>
          <p className="f-body" style={{ fontSize: 13, color: T.ink }}>{q}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   SCAM CHECKER OVERLAY
----------------------------------------------------------------*/
function ScamChecker({ onBack }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const check = () => {
    const t = text.toLowerCase();
    const flags = [];
    if (/(registration fee|upfront|pay before|deposit required)/.test(t)) flags.push("Requests an upfront payment");
    if (/(bank details|account number|otp|pin number)/.test(t)) flags.push("Asks for banking credentials or OTP");
    if (/(guaranteed|earn r\d|no experience.*r\d{4,})/.test(t)) flags.push("Unrealistic or guaranteed earnings claim");
    if (/(urgent|immediately|within \d+ hours|act now)/.test(t)) flags.push("Pressure to act immediately");
    if (/(gmail\.com|@[a-z]+\.ru|whatsapp only)/.test(t)) flags.push("Unusual or informal contact details");
    if (!text.trim()) { setResult(null); return; }
    let risk = "Low";
    if (flags.length >= 2) risk = "High";
    else if (flags.length === 1) risk = "Caution";
    setResult({ risk, flags });
  };

  const riskStyle = { Low: { c: T.teal, bg: T.tealSoft, Icon: ShieldCheck }, Caution: { c: T.amberDeep, bg: T.amberSoft, Icon: ShieldAlert }, High: { c: T.coral, bg: T.coralSoft, Icon: ShieldAlert } };

  return (
    <div style={{ height: "100%", background: T.paper }}>
      <TopBar title="Check this opportunity" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <p className="f-body" style={{ fontSize: 13, color: T.inkMuted, marginBottom: 14 }}>Paste a job ad or description below. We'll scan for common scam warning signs.</p>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Paste the job advert text here..."
          className="f-body" style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontSize: 13.5, color: T.ink, outline: "none", marginBottom: 12, resize: "vertical" }}
        />
        <button onClick={check} className="f-body" style={{ width: "100%", background: T.ink, color: "#fff", fontWeight: 600, fontSize: 14, padding: "13px 0", borderRadius: 12, marginBottom: 16 }}>
          Check for risk
        </button>

        {result && (
          <div style={{ background: riskStyle[result.risk].bg, borderRadius: 16, padding: 16 }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
              {React.createElement(riskStyle[result.risk].Icon, { size: 20, color: riskStyle[result.risk].c })}
              <p className="f-display" style={{ fontWeight: 700, fontSize: 15, color: riskStyle[result.risk].c }}>{result.risk} concern</p>
            </div>
            {result.flags.length > 0 ? (
              result.flags.map((f, i) => (
                <div key={i} className="flex items-start" style={{ gap: 8, marginBottom: 5 }}>
                  <AlertTriangle size={13} color={riskStyle[result.risk].c} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span className="f-body" style={{ fontSize: 12.5, color: riskStyle[result.risk].c }}>{f}</span>
                </div>
              ))
            ) : (
              <p className="f-body" style={{ fontSize: 12.5, color: riskStyle[result.risk].c }}>No obvious warning signs found in the text you pasted.</p>
            )}
            <p className="f-body" style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 10 }}>This is not a guarantee the opportunity is legitimate or a scam — always verify through the organisation's official channels.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ADMIN DASHBOARD
----------------------------------------------------------------*/
function AdminDashboard({ onExit }) {
  const [tab, setTab] = useState("overview");
  return (
    <div style={{ height: "100%", background: T.paper, display: "flex", flexDirection: "column" }}>
      <div style={{ background: T.indigo, padding: "calc(env(safe-area-inset-top) + 18px) 16px 18px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <span className="f-display" style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Admin · Siza Mzansi</span>
          <button onClick={onExit} className="f-body" style={{ color: "#B9BEDB", fontSize: 12.5 }}>Exit</button>
        </div>
        <div className="flex" style={{ gap: 6 }}>
          {[["overview", "Overview"], ["opportunities", "Opportunities"], ["reports", "Reports"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="f-body" style={{ fontSize: 12, fontWeight: 600, padding: "7px 13px", borderRadius: 999, background: tab === k ? T.amber : "#2E3559", color: tab === k ? "#221503" : "#C4C8E4" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="sm-scroll" style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Total users", ADMIN_STATS.totalUsers, Users], ["Active users", ADMIN_STATS.activeUsers, TrendingUp],
              ["Opportunities", ADMIN_STATS.opportunities, Briefcase], ["Applications", ADMIN_STATS.applications, FileText],
              ["CVs created", ADMIN_STATS.cvsCreated, GraduationCap], ["Interviews tracked", ADMIN_STATS.interviewsTracked, MessageSquare],
              ["Reported scams", ADMIN_STATS.reportedScams, Flag],
            ].map(([label, val, Icon]) => (
              <div key={label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
                <Icon size={16} color={T.indigo} style={{ marginBottom: 8 }} />
                <p className="f-mono" style={{ fontSize: 19, fontWeight: 600, color: T.ink }}>{val.toLocaleString()}</p>
                <p className="f-body" style={{ fontSize: 11, color: T.inkMuted }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "opportunities" && (
          <>
            <button className="f-body flex items-center justify-center" style={{ width: "100%", gap: 8, background: T.ink, color: "#fff", fontWeight: 600, fontSize: 13.5, padding: "12px 0", borderRadius: 12, marginBottom: 14 }}>
              <Plus size={16} /> Create opportunity
            </button>
            {OPPORTUNITIES.map((o) => (
              <div key={o.id} className="flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{o.title}</p>
                  <p style={{ fontSize: 11.5, color: T.inkMuted }}>{o.org} · {o.type}</p>
                </div>
                {o.verified ? <Pill bg={T.tealSoft} color={T.teal}>Verified</Pill> : <Pill bg={T.amberSoft} color={T.amberDeep}>Review</Pill>}
              </div>
            ))}
          </>
        )}

        {tab === "reports" && (
          <>
            <p className="f-body" style={{ fontSize: 12.5, color: T.inkMuted, marginBottom: 12 }}>Opportunities flagged by users via the scam checker.</p>
            {REPORTED_OPPORTUNITIES.map((r) => (
              <div key={r.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{r.title}</p>
                  <Pill bg={r.risk === "High" ? T.coralSoft : T.amberSoft} color={r.risk === "High" ? T.coral : T.amberDeep}>{r.risk}</Pill>
                </div>
                <p style={{ fontSize: 11.5, color: T.inkMuted, marginBottom: 4 }}>{r.org}</p>
                <p style={{ fontSize: 12, color: T.ink }}>{r.reason}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   BOTTOM NAV
----------------------------------------------------------------*/
function BottomNav({ active, onChange }) {
  const items = [["home", Home, "Home"], ["opportunities", Briefcase, "Jobs"], ["applications", FileText, "Apps"], ["cv", GraduationCap, "CV"], ["profile", User, "Profile"]];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, display: "flex", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map(([key, Icon, label]) => {
        const isActive = active === key;
        return (
          <button key={key} onClick={() => onChange(key)} className="f-body" style={{ flex: 1, padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 30, height: 22, borderRadius: 10, background: isActive ? T.amberSoft : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={16} color={isActive ? T.amberDeep : T.inkFaint} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? T.ink : T.inkFaint }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
----------------------------------------------------------------*/
/* ---------------------------------------------------------------
   PERSISTENCE
   Real device storage, not artifact sandbox storage — this is a
   deployed app, so localStorage is the right tool: it survives
   refreshes and closing the browser, scoped to one device/browser.
----------------------------------------------------------------*/
const STORAGE_KEY = "siza-mzansi:v1";
const DEFAULT_PROFILE = { name: "Guest", title: "Job seeker", location: "South Africa", completion: 20 };

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, saved: new Set(parsed.saved || []) };
  } catch {
    return null; // corrupted or blocked storage — fall back to defaults, don't crash
  }
}

function savePersisted(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, saved: Array.from(state.saved) }));
  } catch {
    // storage full or unavailable (e.g. private browsing) — fail silently, app still works this session
  }
}

/* ---------------------------------------------------------------
   ERROR BOUNDARY
   Catches render errors so a bug in one screen shows a recoverable
   message instead of a blank white screen on a user's phone.
----------------------------------------------------------------*/
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("Siza Mzansi crashed:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="f-body" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", background: T.paper }}>
          <AlertTriangle size={28} color={T.coral} style={{ marginBottom: 12 }} />
          <p className="f-display" style={{ fontWeight: 700, fontSize: 16, color: T.ink, marginBottom: 6 }}>Something went wrong</p>
          <p style={{ fontSize: 13, color: T.inkMuted, marginBottom: 18 }}>This screen hit an error. Your saved data is safe — reloading should fix it.</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="f-body" style={{ background: T.ink, color: "#fff", fontWeight: 600, fontSize: 13.5, padding: "11px 22px", borderRadius: 10 }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------------------------------------------------------
   ROOT APP
----------------------------------------------------------------*/
function SizaMzansiApp() {
  const persisted = useMemo(() => loadPersisted(), []);
  const [stage, setStage] = useState(persisted?.stage || "landing"); // landing | onboarding | app
  const [tab, setTab] = useState("home");
  const [overlay, setOverlay] = useState(null); // { type, data }
  const [adminMode, setAdminMode] = useState(false);
  const [saved, setSaved] = useState(persisted?.saved || new Set(["o2"]));
  const [applications, setApplications] = useState(persisted?.applications || APPLICATIONS_SEED);
  const [profile, setProfile] = useState(persisted?.profile || DEFAULT_PROFILE);

  // Persist the parts of state worth surviving a refresh. Nav/overlay state
  // is deliberately excluded — always start a fresh visit on Home.
  React.useEffect(() => {
    savePersisted({ stage, saved, applications, profile });
  }, [stage, saved, applications, profile]);

  const toggleSave = (id) => setSaved((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const applyToOpportunity = (o) => {
    setApplications((prev) => [{ id: `a${Date.now()}`, title: o.title, org: o.org, status: "Applied", appliedDate: new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }), interviewDate: "", notes: "" }, ...prev]);
    setOverlay(null);
    setTab("applications");
  };

  const changeAppStatus = (id, status) => setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSaved(new Set(["o2"]));
    setApplications(APPLICATIONS_SEED);
    setProfile(DEFAULT_PROFILE);
    setAdminMode(false);
    setOverlay(null);
    setTab("home");
    setStage("landing");
  };

  let body;
  if (stage === "landing") body = <Landing onStart={() => setStage("onboarding")} />;
  else if (stage === "onboarding") body = <Onboarding onFinish={(data) => { setProfile(data); setStage("app"); }} />;
  else if (adminMode) body = <AdminDashboard onExit={() => setAdminMode(false)} />;
  else if (overlay?.type === "opportunity") {
    body = (
      <OpportunityDetail
        o={overlay.data} saved={saved.has(overlay.data.id)} onToggleSave={toggleSave}
        onBack={() => setOverlay(null)} applications={applications} onApply={applyToOpportunity}
        onPrepInterview={(o) => setOverlay({ type: "interview", data: o })}
      />
    );
  } else if (overlay?.type === "application") {
    body = <ApplicationDetail app={overlay.data} onBack={() => setOverlay(null)} onChangeStatus={(id, s) => { changeAppStatus(id, s); setOverlay({ type: "application", data: { ...overlay.data, status: s } }); }} />;
  } else if (overlay?.type === "skills") {
    body = <SkillsGap onBack={() => setOverlay(null)} />;
  } else if (overlay?.type === "interview") {
    body = <InterviewCoach opportunity={overlay.data} onBack={() => setOverlay(null)} />;
  } else if (overlay?.type === "scam") {
    body = <ScamChecker onBack={() => setOverlay(null)} />;
  } else {
    const tabBody =
      tab === "home" ? <HomeTab opportunities={OPPORTUNITIES} saved={saved} onToggleSave={toggleSave} onOpen={(id) => setOverlay({ type: "opportunity", data: OPPORTUNITIES.find((o) => o.id === id) })} profile={profile} />
      : tab === "opportunities" ? <OpportunitiesTab opportunities={OPPORTUNITIES} saved={saved} onToggleSave={toggleSave} onOpen={(id) => setOverlay({ type: "opportunity", data: OPPORTUNITIES.find((o) => o.id === id) })} />
      : tab === "applications" ? <ApplicationsTab applications={applications} onOpenApp={(a) => setOverlay({ type: "application", data: a })} />
      : tab === "cv" ? <CvTab />
      : <ProfileTab profile={profile} onOpenTool={(k) => setOverlay({ type: k })} onToggleAdmin={() => setAdminMode(true)} onReset={resetDemoData} />;

    body = (
      <div style={{ height: "100%", position: "relative" }}>
        <div className="sm-scroll" style={{ height: "100%", overflowY: "auto" }}>{tabBody}</div>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    );
  }

  return (
    <div className="f-body phone-outer" style={{ display: "flex", justifyContent: "center", background: T.surfaceSunk }}>
      <div className="phone-frame" style={{ background: T.paper, position: "relative" }}>
        {body}
      </div>
    </div>
  );
}

export default function SizaMzansi() {
  return (
    <ErrorBoundary>
      <SizaMzansiApp />
    </ErrorBoundary>
  );
}
