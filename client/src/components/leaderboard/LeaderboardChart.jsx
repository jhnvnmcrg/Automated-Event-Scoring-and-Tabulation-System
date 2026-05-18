import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#F59E0B', '#9CA3AF', '#92400E', '#3B82F6', '#8B5CF6', '#10B981'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
      <p className="text-blue-600 font-bold text-lg">{payload[0].value.toFixed(2)} pts</p>
    </div>
  );
};

const LeaderboardChart = ({ results }) => {
  if (!results?.length) return null;

  const data = results.slice(0, 10).map((r) => ({
    name:  r.participant?.name?.split(' ')[0] || 'N/A',
    score: r.totalScore || 0,
    rank:  r.rank,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">
        Score Comparison (Top {data.length})
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i] || '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeaderboardChart;