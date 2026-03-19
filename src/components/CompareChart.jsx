import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function CompareChart({ data, funds }) {
  if (!data || data.length === 0) return (
    <div className="glass-panel p-6 w-full flex items-center justify-center text-muted" style={{ height: '400px' }}>
      Loading comparison data...
    </div>
  );

  const colors = {
    'MGF': '#10b981', // green
    'BCF': '#3b82f6', // blue
    'FIF': '#8b5cf6', // purple
    'TBF': '#f59e0b', // orange
    'AIF': '#ef4444', // red
  };

  return (
    <div className="glass-panel p-6 w-full" style={{ height: '500px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-secondary)" 
            tickFormatter={(tick) => {
              const d = new Date(tick);
              return `${d.getMonth()+1}/${d.getFullYear()}`;
            }}
            minTickGap={30}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
            formatter={(value, name) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, name]}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB')}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {funds.map(fund => (
            <Line 
              key={fund.id}
              type="monotone" 
              dataKey={fund.shortName} 
              name={fund.shortName}
              stroke={colors[fund.shortName] || '#fff'} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
