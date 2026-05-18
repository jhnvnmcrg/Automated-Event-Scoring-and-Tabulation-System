const ExcelJS  = require('exceljs');
const PDFKit   = require('pdfkit');
const Result   = require('../models/Result');
const Score    = require('../models/Score');
const Category = require('../models/Category');
const Event    = require('../models/Event');

// ─── EXCEL EXPORT ──────────────────────────────────────────

const exportToExcel = async (eventId) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AESTS';
  workbook.created = new Date();

  const event      = await Event.findById(eventId);
  const categories = await Category.find({ event: eventId });

  for (const category of categories) {
    const results = await Result.find({ category: category._id })
      .populate('participant', 'name identifier')
      .sort({ rank: 1 });

    if (!results.length) continue;

    const sheet = workbook.addWorksheet(category.name.slice(0, 31));

    // ── Styles ──────────────────────────────────────────────
    const headerFill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF1D4ED8' },
    };
    const subHeaderFill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FFE0E7FF' },
    };
    const goldFill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FFFFF9C4' },
    };
    const borderStyle = {
      top:    { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left:   { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right:  { style: 'thin', color: { argb: 'FFD1D5DB' } },
    };

    // ── Title ───────────────────────────────────────────────
    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `${event.name} — ${category.name}`;
    sheet.getCell('A1').font  = { bold: true, size: 14, color: { argb: 'FF1D4ED8' } };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.mergeCells('A2:F2');
    sheet.getCell('A2').value = `Generated: ${new Date().toLocaleString()}`;
    sheet.getCell('A2').font  = { size: 9, color: { argb: 'FF9CA3AF' } };
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    sheet.addRow([]);

    // ── Column headers ───────────────────────────────────────
    const criterionNames = results[0]?.breakdown?.map(b => b.criterionName) || [];
    const headers = ['Rank', 'Name', 'ID', ...criterionNames, 'Total Score'];

    const headerRow = sheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill      = headerFill;
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = borderStyle;
    });
    headerRow.height = 28;

    // ── Data rows ────────────────────────────────────────────
    results.forEach((r) => {
      const breakdownVals = r.breakdown.map(b => b.weightedScore);
      const row = sheet.addRow([
        r.rank,
        r.participant?.name || '',
        r.participant?.identifier || '',
        ...breakdownVals,
        r.totalScore,
      ]);

      row.eachCell((cell) => {
        cell.border    = borderStyle;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Highlight rank 1
      if (r.rank === 1) {
        row.eachCell(cell => { cell.fill = goldFill; });
      }

      row.height = 22;
    });

    // ── Column widths ────────────────────────────────────────
    sheet.getColumn(1).width = 8;
    sheet.getColumn(2).width = 28;
    sheet.getColumn(3).width = 14;
    criterionNames.forEach((_, i) => {
      sheet.getColumn(4 + i).width = 18;
    });
    sheet.getColumn(4 + criterionNames.length).width = 14;

    // ── Freeze top rows ──────────────────────────────────────
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];
  }

  // ── Summary Sheet ────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Summary');

  summarySheet.mergeCells('A1:D1');
  summarySheet.getCell('A1').value = `${event.name} — Results Summary`;
  summarySheet.getCell('A1').font  = { bold: true, size: 13, color: { argb: 'FF1D4ED8' } };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };
  summarySheet.addRow([]);

  const summaryHeader = summarySheet.addRow(['Category', 'Winner', 'ID', 'Score']);
  summaryHeader.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    cell.font   = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
    cell.alignment = { horizontal: 'center' };
  });

  for (const category of categories) {
    const winner = await Result.findOne({ category: category._id, rank: 1 })
      .populate('participant', 'name identifier');

    const row = summarySheet.addRow([
      category.name,
      winner?.participant?.name   || 'N/A',
      winner?.participant?.identifier || '',
      winner?.totalScore?.toFixed(2) || '0.00',
    ]);
    row.eachCell(cell => {
      cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { horizontal: 'center' };
    });
  }

  summarySheet.getColumn(1).width = 25;
  summarySheet.getColumn(2).width = 28;
  summarySheet.getColumn(3).width = 14;
  summarySheet.getColumn(4).width = 12;

  return workbook;
};

// ─── PDF EXPORT ────────────────────────────────────────────

const exportToPDF = async (eventId, res) => {
  const event      = await Event.findById(eventId);
  const categories = await Category.find({ event: eventId });

  const doc = new PDFKit({ margin: 50, size: 'A4' });
  doc.pipe(res);

  const W        = doc.page.width - 100;
  const BLUE     = '#1D4ED8';
  const GOLD     = '#F59E0B';
  const GRAY     = '#6B7280';
  const LIGHTBG  = '#F3F4F6';

  // ── Cover Page ───────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 180).fill(BLUE);

  doc.fill('white')
    .font('Helvetica-Bold')
    .fontSize(26)
    .text('AESTS', 50, 60)
    .fontSize(14)
    .font('Helvetica')
    .text('Automated Event Scoring & Tabulation System', 50, 95);

  doc.fontSize(18)
    .font('Helvetica-Bold')
    .text(event.name, 50, 135, { width: W });

  doc.fill(GRAY)
    .fontSize(10)
    .font('Helvetica')
    .text(`Generated: ${new Date().toLocaleString()}`, 50, 200)
    .text(`Venue: ${event.venue || 'N/A'}`, 50, 215)
    .text(`Date: ${new Date(event.date).toLocaleDateString()}`, 50, 230);

  // ── Per-Category Results ─────────────────────────────────
  for (const category of categories) {
    const results = await Result.find({ category: category._id })
      .populate('participant', 'name identifier')
      .sort({ rank: 1 });

    if (!results.length) continue;

    doc.addPage();

    // Section header
    doc.rect(50, 50, W, 36).fill(BLUE);
    doc.fill('white')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(category.name, 62, 61);

    // Judge count
    const scores     = await Score.find({ category: category._id });
    const judgeCount = [...new Set(scores.map(s => s.judge.toString()))].length;
    doc.fill('white').fontSize(9).font('Helvetica')
      .text(`${results.length} participants · ${judgeCount} judges`, 62, 78);

    let y = 105;

    // Table headers
    const cols = { rank: 50, name: 90, score: 430, total: 490 };

    doc.rect(50, y, W, 24).fill(LIGHTBG);
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(9);
    doc.text('Rank', cols.rank,  y + 8);
    doc.text('Participant',      cols.name,  y + 8);
    doc.text('Weighted Score',   cols.score, y + 8);
    doc.text('Total',            cols.total, y + 8);
    y += 24;

    // Table rows
    results.forEach((r, i) => {
      const rowH = 28;
      const fill = r.rank === 1 ? '#FEF9C3' : i % 2 === 0 ? 'white' : '#F9FAFB';

      doc.rect(50, y, W, rowH).fill(fill);

      // Rank medals
      const medals = { 1: '1st', 2: '2nd', 3: '3rd' };
      const rankLabel = medals[r.rank] || `#${r.rank}`;

      doc.fill(r.rank <= 3 ? GOLD : GRAY)
        .font('Helvetica-Bold').fontSize(9)
        .text(rankLabel, cols.rank, y + 10);

      doc.fill('#111827').font('Helvetica').fontSize(9)
        .text(r.participant?.name || '', cols.name, y + 10, { width: 300 });

      // Breakdown bars (mini)
      let bx = cols.score;
      r.breakdown?.slice(0, 3).forEach(b => {
        const pct  = Math.min(1, b.weightedScore / b.weight);
        const barW = 30;
        doc.rect(bx, y + 10, barW, 8).fill('#E5E7EB');
        doc.rect(bx, y + 10, barW * pct, 8).fill(BLUE);
        bx += barW + 4;
      });

      doc.fill('#1D4ED8').font('Helvetica-Bold').fontSize(10)
        .text(r.totalScore?.toFixed(2) || '0', cols.total, y + 9);

      // Divider line
      doc.moveTo(50, y + rowH).lineTo(50 + W, y + rowH)
        .strokeColor('#E5E7EB').lineWidth(0.5).stroke();

      y += rowH;

      // Page break if needed
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }
    });

    // Breakdown legend
    if (results[0]?.breakdown?.length) {
      y += 15;
      doc.fill(GRAY).font('Helvetica').fontSize(8)
        .text('Score Breakdown per Criterion:', 50, y);
      y += 12;

      results[0].breakdown.forEach((b, i) => {
        doc.fill(GRAY).fontSize(8)
          .text(`${b.criterionName} — Weight: ${b.weight}% · Max: ${b.maxScore}`, 60, y);
        y += 12;
      });
    }
  }

  // ── Summary Page ─────────────────────────────────────────
  doc.addPage();

  doc.rect(50, 50, W, 36).fill(BLUE);
  doc.fill('white').font('Helvetica-Bold').fontSize(14)
    .text('Winners Summary', 62, 63);

  let y = 110;
  for (const category of categories) {
    const winner = await Result.findOne({ category: category._id, rank: 1 })
      .populate('participant', 'name identifier');

    doc.rect(50, y, W, 44).fill('#FEFCE8');
    doc.rect(50, y, 6, 44).fill(GOLD);

    doc.fill(BLUE).font('Helvetica-Bold').fontSize(10)
      .text(category.name, 65, y + 8);
    doc.fill('#111827').font('Helvetica').fontSize(11)
      .text(`🏆 ${winner?.participant?.name || 'No winner yet'}`, 65, y + 22);
    doc.fill(GRAY).fontSize(9)
      .text(`Score: ${winner?.totalScore?.toFixed(2) || '—'}/100`, 420, y + 22);

    y += 56;
    if (y > doc.page.height - 80) { doc.addPage(); y = 50; }
  }

  doc.end();
};

module.exports = { exportToExcel, exportToPDF };