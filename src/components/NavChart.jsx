import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function NavChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="glass-panel p-6 w-full flex items-center justify-center text-muted" style={{ height: '400px' }}>
      No historical data available
    </div>
  );

  const minNav = Math.min(...data.map(d => d.nav));
  const maxNav = Math.max(...data.map(d => d.nav));

  return (
    <div className="glass-panel p-6 w-full" style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="navDate" 
            stroke="var(--text-secondary)" 
            tickFormatter={(tick) => {
              const d = new Date(tick);
              return `${d.getMonth()+1}/${d.getFullYear()}`;
            }}
            minTickGap={30}
          />
          <YAxis 
            domain={[minNav * 0.95, maxNav * 1.05]} 
            stroke="var(--text-secondary)"
            tickFormatter={(value) => (value / 1000).toLocaleString('vi-VN') + 'k'} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
            itemStyle={{ color: 'var(--primary-color)' }}
            formatter={(value) => [`${value.toLocaleString('vi-VN')} VND`, 'NAV']}
            labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
          />
          <Area type="monotone" dataKey="nav" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorNav)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
