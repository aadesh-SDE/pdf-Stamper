import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Make sure these match your actual file names
import logoLeftPath from "../assets/logos/logo1.png";
import logoCenterPath from "../assets/logos/logo2.png";
import logoRightPath from "../assets/logos/logo3.png";

export async function processPdfWithLogos(file) {
  try {
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const logoLeftBytes = await fetch(logoLeftPath).then((res) =>
      res.arrayBuffer(),
    );
    const logoCenterBytes = await fetch(logoCenterPath).then((res) =>
      res.arrayBuffer(),
    );
    const logoRightBytes = await fetch(logoRightPath).then((res) =>
      res.arrayBuffer(),
    );

    // Assuming they are PNGs. If JPG, change to embedJpg
    const logoLeft = await pdfDoc.embedPng(logoLeftBytes);
    const logoCenter = await pdfDoc.embedPng(logoCenterBytes);
    const logoRight = await pdfDoc.embedPng(logoRightBytes);

    // Embed a standard font for the footer text
    const customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();

    const TARGET_SIDE_HEIGHT = 40;
    const TARGET_CENTER_HEIGHT = 60;

    const leftDims = logoLeft.scale(TARGET_SIDE_HEIGHT / logoLeft.height);
    const centerDims = logoCenter.scale(
      TARGET_CENTER_HEIGHT / logoCenter.height,
    );
    const rightDims = logoRight.scale(TARGET_SIDE_HEIGHT / logoRight.height);

    for (const page of pages) {
      const { width, height } = page.getSize();

      // --- HEADER LOGIC ---
      const TOP_MARGIN = 20;

      page.drawImage(logoLeft, {
        x: 40, // 40 points from the left edge
        // Nudge it down slightly so it vertically aligns with the taller center logo
        y: height - leftDims.height - TOP_MARGIN - 10,
        width: leftDims.width,
        height: leftDims.height,
      });

      // Draw Center Logo (VitaHealthCare)
      page.drawImage(logoCenter, {
        x: width / 2 - centerDims.width / 2, // Perfectly centered
        // Nudge it down further to position it slightly lower than the other two logos
        y: height - centerDims.height - TOP_MARGIN - 30, // <-- Added - 20 here
        width: centerDims.width,
        height: centerDims.height,
      });

      // Draw Right Logo (Quick & Reliable Results)
      page.drawImage(logoRight, {
        x: width - rightDims.width - 40, // 40 points from the right edge
        // Nudge it down slightly so it vertically aligns with the taller center logo
        y: height - rightDims.height - TOP_MARGIN - 10,
        width: rightDims.width,
        height: rightDims.height,
      });

      // --- NEW FOOTER LOGIC ---
      // Update these three variables with your exact text!
      const footerTextLeft = "Reach Us: 77961 00390";
      const footerTextCenter = "ECG/Xray at Home";
      const footerTextRight = "Alt: 8600706216"; // <-- Put your second number here

      const fontSize = 12;
      const bandHeight = 22;
      const bandY = 40; // 60 points from the bottom of the page

      // 1. Draw the Dark Blue Rectangle (Full width)
      page.drawRectangle({
        x: 0,
        y: bandY,
        width: width,
        height: bandHeight,
        color: rgb(0.05, 0.2, 0.5),
      });

      // 2. Draw the Left Number
      page.drawText(footerTextLeft, {
        x: 40,
        y: bandY + 6,
        size: fontSize,
        font: customFont,
        color: rgb(1, 1, 1),
      });

      // 3. Draw the Center Text
      // We calculate the width of the text so we can perfectly center it
      const centerTextWidth = customFont.widthOfTextAtSize(
        footerTextCenter,
        fontSize,
      );
      page.drawText(footerTextCenter, {
        x: width / 2 - centerTextWidth / 2, // Perfectly centered
        y: bandY + 6,
        size: fontSize,
        font: customFont,
        color: rgb(1, 1, 1),
      });

      // 4. Draw the Right Number
      // We calculate the width of this text so it aligns neatly with the right margin
      const rightTextWidth = customFont.widthOfTextAtSize(
        footerTextRight,
        fontSize,
      );
      page.drawText(footerTextRight, {
        x: width - rightTextWidth - 40, // Right aligned
        y: bandY + 6,
        size: fontSize,
        font: customFont,
        color: rgb(1, 1, 1),
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();

    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `VitaHealth_${file.name}`;
    link.click();

    URL.revokeObjectURL(link.href);
    return true;
  } catch (error) {
    console.error("Error processing PDF:", error);
    alert("Something went wrong while processing the PDF.");
    return false;
  }
}
