import { PDFDocument } from 'pdf-lib';

// Make sure these match your actual file names
import logoLeftPath from '../assets/logos/logo1.png';
import logoCenterPath from '../assets/logos/logo2.png';
import logoRightPath from '../assets/logos/logo3.png';

export async function processPdfWithLogos(file) {
  try {
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const logoLeftBytes = await fetch(logoLeftPath).then(res => res.arrayBuffer());
    const logoCenterBytes = await fetch(logoCenterPath).then(res => res.arrayBuffer());
    const logoRightBytes = await fetch(logoRightPath).then(res => res.arrayBuffer());

    // Assuming they are PNGs. If JPG, change to embedJpg
    const logoLeft = await pdfDoc.embedPng(logoLeftBytes);
    const logoCenter = await pdfDoc.embedPng(logoCenterBytes);
    const logoRight = await pdfDoc.embedPng(logoRightBytes);

    const pages = pdfDoc.getPages();

    // --- NEW PERFECT SCALING LOGIC ---
    // A standard A4 PDF is about 842 points tall.
    // We force the logos to a specific target height so they stay small and professional.
    const TARGET_SIDE_HEIGHT = 35;   // Height for the Left and Right logos
    const TARGET_CENTER_HEIGHT = 70; // Height for the Center VitaHealthCare logo

    // Calculate the perfect scale based on the original image dimensions
    const leftDims = logoLeft.scale(TARGET_SIDE_HEIGHT / logoLeft.height);
    const centerDims = logoCenter.scale(TARGET_CENTER_HEIGHT / logoCenter.height);
    const rightDims = logoRight.scale(TARGET_SIDE_HEIGHT / logoRight.height);

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // How much empty space to leave at the absolute top of the page
      const TOP_MARGIN = 20; 

      // Draw Left Logo (NABL Accredited)
      page.drawImage(logoLeft, {
        x: 40, // 40 points from the left edge
        // Nudge it down slightly so it vertically aligns with the taller center logo
        y: height - leftDims.height - TOP_MARGIN - 10, 
        width: leftDims.width,
        height: leftDims.height,
      });

      // Draw Center Logo (VitaHealthCare)
      page.drawImage(logoCenter, {
        x: (width / 2) - (centerDims.width / 2), // Perfectly centered
        y: height - centerDims.height - TOP_MARGIN,
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
    }

    const modifiedPdfBytes = await pdfDoc.save();
    
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
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