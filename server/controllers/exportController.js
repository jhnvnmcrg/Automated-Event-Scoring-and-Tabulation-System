const { exportToExcel, exportToPDF } = require('../services/exportService');

// @desc    Export results as Excel
// @route   GET /api/export/excel/:eventId
// @access  superadmin, admin
const downloadExcel = async (req, res) => {
  try {
    const workbook = await exportToExcel(req.params.eventId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=results_${req.params.eventId}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export results as PDF
// @route   GET /api/export/pdf/:eventId
// @access  superadmin, admin
const downloadPDF = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=results_${req.params.eventId}.pdf`
    );
    await exportToPDF(req.params.eventId, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { downloadExcel, downloadPDF };