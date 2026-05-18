const colors = {
  upcoming:  'bg-blue-100 text-blue-700',
  ongoing:   'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const StatusBadge = ({ status }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
    {status}
  </span>
);

export default StatusBadge;