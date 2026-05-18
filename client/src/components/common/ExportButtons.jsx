import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const ExportButtons = ({ eventId }) => {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF,   setLoadingPDF]   = useState(false);

  const download = async (type) => {
    const setLoading = type === 'excel' ? setLoadingExcel : setLoadingPDF;
    setLoading(true);
    try {
      const response = await API.get(`/export/${type}/${eventId}`, {
        responseType: 'blob',
      });

      const ext      = type === 'excel' ? 'xlsx' : 'pdf';
      const mimeType = type === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      const blob = new Blob([response.data], { type: mimeType });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `results_${eventId}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`${type.toUpperCase()} downloaded!`);
    } catch {
      toast.error(`Failed to export ${type.toUpperCase()}`);
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => download('excel')}
        disabled={loadingExcel}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
      >
        {loadingExcel ? '⟳ Exporting...' : '📊 Excel'}
      </button>
      <button
        onClick={() => download('pdf')}
        disabled={loadingPDF}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
      >
        {loadingPDF ? '⟳ Exporting...' : '📄 PDF'}
      </button>
    </div>
  );
};

export default ExportButtons;