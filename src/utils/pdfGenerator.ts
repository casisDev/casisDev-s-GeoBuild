import { jsPDF } from "jspdf";
import { TerrainAnalysisReport, User } from "../types";

export function generateTerrainPDF(report: TerrainAnalysisReport, currentUser: User | null) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Color Definitions (Tech-Slate & Professional Emerald accents)
  const headerColor = [15, 23, 42];      // #0f172a (Slate 900)
  const accentColor = [16, 185, 129];     // #10b981 (Emerald 500)
  const textColorDark = [15, 23, 42];     // #0f172a
  const textColorMedium = [71, 85, 105];  // #475569 (Slate 600)
  const highlightBg = [241, 245, 249];    // #f1f5f9 (Slate 100)
  const borderLineColor = [226, 232, 240]; // #e2e8f0 (Slate 200)

  // Document metadata setting
  doc.setProperties({
    title: `Relatório de Terreno - ${report.title}`,
    subject: "Viabilidade Técnica Geotécnica Loteamento",
    author: currentUser ? currentUser.name : "Convidado",
    creator: "Análise Híbrida de Terreno IA",
  });

  // Page dimensions helper
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 20;
  let currentY = 15;

  // Header Section with Title Bar
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Emerald Accent Accent Bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 42, pageWidth, 2.5, "F");

  // Header Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(15);
  doc.text("ANÁLISE HÍBRIDA DE TERRENO", marginX, 16);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("Sistema de Engenharia e Modelagem Assistida por IA", marginX, 22);

  // Inspector and Date metadata
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  doc.text(`Data de Emissão: ${dateStr}`, marginX, 30);
  
  const inspectorName = currentUser ? (currentUser.username === "convidado" ? "Convidado (Não-registrado)" : currentUser.name) : "Convidado";
  doc.text(`Profissional Responsável: ${inspectorName}`, marginX, 35);

  currentY = 56;

  // Title section
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text(`LOTE: ${report.title.toUpperCase()}`, marginX, currentY);

  // Subtitle/Classification Badge
  currentY += 6;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(textColorMedium[0], textColorMedium[1], textColorMedium[2]);
  
  const formattedClassification = `Classificação: ${report.classification} | Nível de Viabilidade Geral: ${report.score}%`;
  doc.text(formattedClassification, marginX, currentY);

  // Score Bar Indicator
  currentY += 5;
  // Draw light grey background bar
  doc.setFillColor(226, 232, 240);
  doc.rect(marginX, currentY, 170, 4.5, "F");
  // Draw green active fill bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  const activeWidth = (170 * report.score) / 100;
  doc.rect(marginX, currentY, activeWidth, 4.5, "F");

  currentY += 12;

  // Draw Horizontal Separator
  doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 8;

  // SECTION 1: MÉTRICAS GEOTÉCNICAS ESTIMADAS
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.text("1. MÉTRICAS GEOTÉCNICAS ESTIMADAS", marginX, currentY);

  currentY += 6;

  const rowHeight = 8;
  const colWidth = 85;

  // Metric Tables (Grid layout using simple cells)
  const metricsList = [
    { label: "Inclinação Média / Declividade", val: `${report.metrics.slope}% (${report.metrics.slope < 5 ? "Plano" : report.metrics.slope < 15 ? "Regular" : "Íngreme"})` },
    { label: "Classificação do Solo", val: report.metrics.soilTypeEstimate },
    { label: "Densidade Florestal", val: report.metrics.vegetationDensity },
    { label: "Drenagem e Escoamento de Água", val: report.metrics.waterDrainageRate },
    { label: "Acessibilidade Mecânica", val: report.metrics.accessibility },
  ];

  doc.setFontSize(9);
  metricsList.forEach((m, idx) => {
    const isCol1 = idx % 2 === 0;
    const xPos = isCol1 ? marginX : marginX + colWidth;
    const yPos = currentY + Math.floor(idx / 2) * rowHeight;

    // Background Highlight
    doc.setFillColor(highlightBg[0], highlightBg[1], highlightBg[2]);
    doc.rect(xPos, yPos - 5, colWidth - 5, rowHeight - 1, "F");

    // Left Border Stripe
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(xPos, yPos - 5, 1.2, rowHeight - 1, "F");

    // Label and Value
    doc.setTextColor(textColorMedium[0], textColorMedium[1], textColorMedium[2]);
    doc.setFont("Helvetica", "bold");
    doc.text(m.label, xPos + 3, yPos - 1.5);

    doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
    doc.setFont("Helvetica", "normal");
    const safeTextVal = doc.splitTextToSize(String(m.val), colWidth - 10);
    doc.text(safeTextVal[0], xPos + colWidth - 8, yPos - 1.5, { align: "right" });
  });

  currentY += Math.ceil(metricsList.length / 2) * rowHeight + 4;

  // Draw Horizontal Separator
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 8;

  // SECTION 2: SOLUÇÕES ESTRUTURAIS E FUNDAÇÃO SUGERIDA
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.text("2. SOLUÇÕES ESTRUTURAIS E FUNDAÇÕES SUGERIDAS", marginX, currentY);

  currentY += 6;

  // Foundation sugerida Highlight block
  doc.setFillColor(15, 23, 42); // Slate-900 back for suggested foundation
  doc.rect(marginX, currentY, 170, 16, "F");
  
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(marginX, currentY, 2, 16, "F");

  doc.setTextColor(110, 231, 183); // Green 300
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FUNDAÇÃO RECOMENDADA PELO SISTEMA IA:", marginX + 5, currentY + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(report.structuralSuggestions.recommendedFoundation.toUpperCase(), marginX + 5, currentY + 11);

  currentY += 21;

  // Foundation explanation
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text("Justificativa Técnica da Fundação:", marginX, currentY);

  currentY += 4.5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColorMedium[0], textColorMedium[1], textColorMedium[2]);
  const splitExplanation = doc.splitTextToSize(report.structuralSuggestions.foundationExplanation, 170);
  doc.text(splitExplanation, marginX, currentY);

  currentY += splitExplanation.length * 4.5 + 4;

  // Earthworks
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text(`Complexidade de Terraplenagem: ${report.structuralSuggestions.earthworksComplexity}`, marginX, currentY);

  currentY += 4.5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColorMedium[0], textColorMedium[1], textColorMedium[2]);
  const splitEarth = doc.splitTextToSize(report.structuralSuggestions.earthworksExplanation, 170);
  doc.text(splitEarth, marginX, currentY);

  currentY += splitEarth.length * 4.5 + 4;

  // Zoning risk / Urbanismo limit
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text("Restrições Urbanísticas e Licenciamento Ambiental:", marginX, currentY);

  currentY += 4.5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // Amber 800 for risk highlight
  const splitZoning = doc.splitTextToSize(`🛡️ ${report.structuralSuggestions.zoningRisk}`, 170);
  doc.text(splitZoning, marginX, currentY);

  currentY += splitZoning.length * 4.5 + 4;

  // Let's check page boundaries. If remaining height is tight, we should force a page break!
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
    
    // Add page outline / watermark for page 2 header
    doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
    doc.line(marginX, currentY - 5, pageWidth - marginX, currentY - 5);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textColorMedium[0], textColorMedium[1], textColorMedium[2]);
    doc.text("CONVERSÃO DA ANÁLISE TÉCNICA - CONTINUAÇÃO", marginX, currentY - 8);
  } else {
    // Draw Horizontal Separator
    doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 8;
  }

  // SECTION 3: PLANILHA DE GABARITO DE INVESTIMENTO
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.text("3. ESTIMATIVAS E GABARITO DE INVESTIMENTO PRELIMINAR", marginX, currentY);

  currentY += 6;

  // Draw table for costs
  doc.setFillColor(highlightBg[0], highlightBg[1], highlightBg[2]);
  doc.rect(marginX, currentY, 170, 16, "F");

  doc.setFontSize(9);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(textColorMedium[0], textColorMedium[1], textColorMedium[2]);
  doc.text("FATORES DE CUSTO ANALISADOS", marginX + 4, currentY + 5.5);
  doc.text("NÍVEL DE INVESTIMENTO ESTIMADO", pageWidth - marginX - 4, currentY + 5.5, { align: "right" });

  doc.line(marginX + 4, currentY + 7.5, pageWidth - marginX - 4, currentY + 7.5);

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text("- Impacto Estimado em Fundações:", marginX + 4, currentY + 12);
  doc.setFont("Helvetica", "bold");
  doc.text(report.costEstimations.foundationFactor, pageWidth - marginX - 4, currentY + 12, { align: "right" });

  currentY += 19;
  
  doc.setFillColor(highlightBg[0], highlightBg[1], highlightBg[2]);
  doc.rect(marginX, currentY, 170, 10, "F");

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text("- Custo para Preparação Física do Lote:", marginX + 4, currentY + 6);
  doc.setFont("Helvetica", "bold");
  doc.text(report.costEstimations.sitePreparationCost, pageWidth - marginX - 4, currentY + 6, { align: "right" });

  currentY += 16;

  // SECTION 4: VEREDITO TÉCNICO COMPLETO
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.text("4. VEREDITO DO ESPECIALISTA GEOTÉCNICO", marginX, currentY);

  currentY += 6;

  // Quote or verdict box
  doc.setFillColor(248, 250, 252); // extra light slate
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  
  const splitVerdict = doc.splitTextToSize(`"${report.detailedAnalysis}"`, 164);
  const verdictBoxHeight = splitVerdict.length * 4.5 + 8;

  // Check overflow before drawing
  if (currentY + verdictBoxHeight > 270) {
    doc.addPage();
    currentY = 20;
  }

  doc.rect(marginX, currentY, 170, verdictBoxHeight);
  // vertical indicator stripe
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(marginX, currentY, 1.5, verdictBoxHeight, "F");

  doc.setFont("Helvetica", "oblique");
  doc.setFontSize(9);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text(splitVerdict, marginX + 4, currentY + 6);

  currentY += verdictBoxHeight + 10;

  // Stamp and Sign block
  if (currentY + 25 > pageHeight) {
    doc.addPage();
    currentY = 25;
  }

  doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 8;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(textColorMedium[0], textColorMedium[1], textColorMedium[2]);
  doc.text("CERTIFICADO DE ANÁLISE GEOTÉCNICA PRELIMINAR", marginX, currentY, { align: "left" });
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Documento gerado dinamicamente via login civilID: ${currentUser ? currentUser.username : "Convidado"}.`, marginX, currentY + 4);
  doc.text("Este material baseia-se em parâmetros estimados via Inteligência Artificial e não substitui os furos padrão SPT e Sondagem de campo.", marginX, currentY + 7);

  // Footer: page numbers
  const pagesCount = doc.getNumberOfPages();
  for (let idx = 1; idx <= pagesCount; idx++) {
    doc.setPage(idx);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Página ${idx} de ${pagesCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text("Análise Geotécnica IA © 2026", marginX, pageHeight - 10);
    doc.text("DOCUMENTO DE SIMULAÇÃO TÉCNICA", pageWidth - marginX, pageHeight - 10, { align: "right" });
  }

  // Save / Download PDF
  const safeFilename = report.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`relatorio_geotecnico_${safeFilename}.pdf`);
}
