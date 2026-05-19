import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

const COLORS = ['#F59E0B', '#9CA3AF', '#92400E', '#3B82F6', '#8B5CF6', '#10B981', '#F97316', '#06B6D4'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="font-bold text-gray-800 text-sm">{payload[0].payload.fullName}</p>
      <p className="text-blue-600 font-black text-xl">{payload[0].value.toFixed(2)}</p>
      <p className="text-gray-400 text-xs">points</p>
    </div>
  );
};

const PublicLeaderboardChart = ({ results }) => {
  if (!results?.length) return null;

  const data = results.slice(0, 10).map((r) => ({
    name:     r.participant?.name?.split(' ')[0] || 'N/A',
    fullName: r.participant?.name || 'N/A',
    score:    r.totalScore || 0,
    rank:     r.rank,
  }));

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-500 mb-4 text-center uppercase tracking-wide">
        Score Comparison
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            <LabelList
              dataKey="score"
              position="top"
              formatter={(v) => v.toFixed(1)}
              style={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }}
            />
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i] || '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PublicLeaderboardChart;