import { jsPDF } from "jspdf";

/**
 * Generate a branded, elegant MaternalSupportCo PDF for filled forms.
 * @param {Object} options
 * @param {string} options.title - Document title (e.g. "Client Intake Form")
 * @param {string} options.clientName - Full name of the client
 * @param {string} options.businessName - Doula practice name
 * @param {Array} options.sections - Sections array from form template
 * @param {Object} options.answers - Filled answers dictionary
 * @param {string} [options.signedName] - Typed signature name (if applicable)
 * @param {string} [options.signedAt] - Timestamp of signature
 * @param {boolean} [options.download=true] - Whether to trigger browser download
 * @returns {Blob} The generated PDF blob
 */
export function exportFormToPdf({
  title,
  clientName,
  businessName = "MaternalSupportCo Doula Care",
  sections = [],
  answers = {},
  signedName = null,
  signedAt = null,
  download = true,
}) {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
    orientation: "portrait",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (needed = 40) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
      renderHeader(true);
    }
  };

  const renderHeader = (isContinuation = false) => {
    // Top Brand Accent Bar (Mauve #6B4F4F)
    doc.setFillColor(107, 79, 79);
    doc.rect(margin, y, contentWidth, 3, "F");
    y += 18;

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(156, 123, 123); // Rose-taupe
    doc.text(businessName.toUpperCase(), margin, y);

    const dateStr = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    doc.text(dateStr, pageWidth - margin, y, { align: "right" });
    y += 18;

    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(58, 58, 58); // Charcoal
    doc.text(isContinuation ? `${title} (Continued)` : title, margin, y);
    y += 14;

    if (!isContinuation && clientName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Client: ${clientName}`, margin, y);
      y += 16;
    }

    doc.setDrawColor(231, 220, 213); // Soft line
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;
  };

  renderHeader();

  // Render Form Sections
  sections.forEach((sec) => {
    checkPageBreak(50);

    // Section title
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(107, 79, 79); // Mauve
    doc.text(sec.title || "Section", margin, y);
    y += 16;

    const fields = sec.fields || [];
    fields.forEach((f) => {
      checkPageBreak(35);

      const val = answers[f.id];
      let displayVal = "Not provided";
      if (val !== undefined && val !== null && val !== "") {
        if (typeof val === "boolean") {
          displayVal = val ? "Yes" : "No";
        } else if (Array.isArray(val)) {
          displayVal = val.join(", ");
        } else {
          displayVal = String(val);
        }
      }

      // Question label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      const labelText = f.label || f.id;
      const splitLabel = doc.splitTextToSize(labelText, contentWidth);
      doc.text(splitLabel, margin, y);
      y += splitLabel.length * 12 + 2;

      // Answer value
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      const splitVal = doc.splitTextToSize(displayVal, contentWidth - 10);
      doc.text(splitVal, margin + 8, y);
      y += splitVal.length * 13 + 10;
    });

    y += 6;
  });

  // Render Signature Block if present
  if (signedName || answers.__sig) {
    checkPageBreak(80);

    doc.setDrawColor(231, 220, 213);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.setTextColor(107, 79, 79);
    doc.text("Electronic Signature Verification", margin, y);
    y += 18;

    const sigText = signedName || answers.__sig || "";
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(58, 58, 58);
    doc.text(sigText, margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    const timeFormatted = signedAt
      ? new Date(signedAt).toLocaleString()
      : new Date().toLocaleString();
    doc.text(`Signed electronically via MaternalSupportCo Hub on ${timeFormatted}`, margin, y);
    y += 10;
  }

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `MaternalSupportCo Hub — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 25,
      { align: "center" }
    );
  }

  const safeFilename = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${
    (clientName || "record").toLowerCase().replace(/[^a-z0-9]/g, "_")
  }.pdf`;

  if (download) {
    doc.save(safeFilename);
  }

  return doc.output("blob");
}
