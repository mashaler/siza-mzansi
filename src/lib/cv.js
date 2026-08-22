export const CV_SECTIONS = [
  { key: "personal", label: "Personal information", optional: false },
  { key: "summary", label: "Professional summary", optional: false },
  { key: "experience", label: "Work experience", optional: false },
  { key: "education", label: "Education", optional: false },
  { key: "skills", label: "Skills", optional: false },
  { key: "certifications", label: "Certifications", optional: true },
  { key: "projects", label: "Projects", optional: true },
  { key: "languages", label: "Languages", optional: false },
  { key: "references", label: "References", optional: true },
];

export const ENTRY_FIELDS = {
  experience: [
    { key: "title", label: "Job title" },
    { key: "company", label: "Company" },
    { key: "duration", label: "Duration", placeholder: "e.g. Jan 2023 – Present" },
    { key: "description", label: "Description", multiline: true },
  ],
  education: [
    { key: "qualification", label: "Qualification" },
    { key: "institution", label: "Institution" },
    { key: "duration", label: "Duration", placeholder: "e.g. 2022 – 2025" },
  ],
  certifications: [
    { key: "name", label: "Certification name" },
    { key: "issuer", label: "Issuing organisation" },
    { key: "year", label: "Year" },
  ],
  projects: [
    { key: "name", label: "Project name" },
    { key: "description", label: "Description", multiline: true },
    { key: "link", label: "Link (optional)" },
  ],
  references: [
    { key: "name", label: "Name" },
    { key: "relationship", label: "Relationship" },
    { key: "contact", label: "Contact details" },
  ],
};

export const ADD_ENTRY_LABEL = {
  experience: "Add work experience", education: "Add education",
  certifications: "Add certification", projects: "Add project", references: "Add reference",
};

export function isSectionComplete(key, data) {
  const d = data?.[key];
  switch (key) {
    case "personal": {
      const p = d || {};
      return !!(p.fullName?.trim() && p.email?.trim() && p.phone?.trim() && p.location?.trim());
    }
    case "summary":
      return !!(d?.text && d.text.trim().length >= 30);
    case "experience":
      return !!(d?.entries?.length && d.entries.every((e) => e.title?.trim() && e.company?.trim()));
    case "education":
      return !!(d?.entries?.length && d.entries.every((e) => e.institution?.trim() && e.qualification?.trim()));
    case "skills":
      return !!(d?.text && d.text.split(",").map((s) => s.trim()).filter(Boolean).length >= 3);
    case "languages":
      return !!(d?.text && d.text.trim().length > 0);
    case "certifications":
    case "projects":
    case "references":
      return !!(d?.skipped || (d?.entries?.length > 0));
    default:
      return false;
  }
}

export function cvCompletion(data) {
  const done = CV_SECTIONS.filter((s) => isSectionComplete(s.key, data)).length;
  return { done, total: CV_SECTIONS.length, pct: Math.round((done / CV_SECTIONS.length) * 100) };
}

/* ---------------------------------------------------------------
   Real PDF export — reads only what the user actually entered.
   jsPDF is loaded lazily (dynamic import) since it's only needed
   when someone actually clicks Export, not on every app load.
----------------------------------------------------------------*/
export async function exportCvPdf(cvData, displayName) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginX * 2;
  let y = 56;

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 48) { doc.addPage(); y = 56; }
  };

  const heading = (label) => {
    ensureSpace(30);
    doc.setDrawColor(200);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(label.toUpperCase(), marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
  };

  const paragraph = (text, gap = 6) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line) => { ensureSpace(14); doc.text(line, marginX, y); y += 14; });
    y += gap;
  };

  const personal = cvData.personal || {};
  const name = personal.fullName || displayName || "CV";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(name, marginX, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const contactLine = [personal.email, personal.phone, personal.location].filter(Boolean).join("   ·   ");
  if (contactLine) { doc.text(contactLine, marginX, y); y += 24; } else y += 12;

  if (cvData.summary?.text) {
    heading("Professional summary");
    paragraph(cvData.summary.text);
  }

  if (cvData.experience?.entries?.length) {
    heading("Work experience");
    cvData.experience.entries.forEach((e) => {
      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${e.title || "Role"} — ${e.company || ""}`, marginX, y);
      y += 13;
      doc.setFont("helvetica", "normal");
      if (e.duration) {
        doc.setFontSize(9.5); doc.setTextColor(110);
        doc.text(e.duration, marginX, y);
        doc.setTextColor(0); doc.setFontSize(10.5);
        y += 13;
      }
      if (e.description) paragraph(e.description, 10); else y += 6;
    });
  }

  if (cvData.education?.entries?.length) {
    heading("Education");
    cvData.education.entries.forEach((e) => {
      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${e.qualification || ""} — ${e.institution || ""}`, marginX, y);
      y += 13;
      doc.setFont("helvetica", "normal");
      if (e.duration) {
        doc.setFontSize(9.5); doc.setTextColor(110);
        doc.text(e.duration, marginX, y);
        doc.setTextColor(0); doc.setFontSize(10.5);
        y += 16;
      } else y += 6;
    });
  }

  if (cvData.skills?.text) {
    heading("Skills");
    paragraph(cvData.skills.text);
  }

  if (cvData.certifications?.entries?.length) {
    heading("Certifications");
    cvData.certifications.entries.forEach((c) => {
      paragraph(`${c.name || ""}${c.issuer ? " — " + c.issuer : ""}${c.year ? " (" + c.year + ")" : ""}`, 4);
    });
  }

  if (cvData.projects?.entries?.length) {
    heading("Projects");
    cvData.projects.entries.forEach((p) => {
      ensureSpace(14);
      doc.setFont("helvetica", "bold");
      doc.text(p.name || "Project", marginX, y);
      y += 13;
      doc.setFont("helvetica", "normal");
      if (p.description) paragraph(p.description, 8);
    });
  }

  if (cvData.languages?.text) {
    heading("Languages");
    paragraph(cvData.languages.text);
  }

  if (cvData.references?.entries?.length) {
    heading("References");
    cvData.references.entries.forEach((r) => {
      paragraph(`${r.name || ""}${r.relationship ? " — " + r.relationship : ""}${r.contact ? " · " + r.contact : ""}`, 4);
    });
  }

  doc.save(`${name.replace(/\s+/g, "_")}_CV.pdf`);
}
