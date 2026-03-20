export default function FundCard({ fund, onClick, isActive }) {
  if (!fund) return null;
  const isPositive = fund.change >= 0;
  
  return (
    <div 
      className={`glass-panel p-4 flex flex-col gap-2 cursor-pointer transition-all ${isActive ? 'active' : ''}`}
      onClick={() => onClick(fund)}
      style={{
        borderColor: isActive ? 'var(--primary-color)' : '',
        boxShadow: isActive ? '0 0 15px var(--primary-glow)' : '',
        transform: isActive ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold">{fund.shortName}</span>
        <span className="text-muted text-sm">{fund.navDate ? new Date(fund.navDate).toLocaleDateString('vi-VN') : ''}</span>
      </div>
      <div className="text-2xl font-bold mt-2">
        {fund.nav ? fund.nav.toLocaleString('vi-VN') : '---'} <span className="text-lg text-muted font-normal">VND</span>
      </div>
      <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green' : 'text-red'}`}>
        {isPositive ? '▲' : '▼'}
        {fund.change ? Math.round(Math.abs(fund.change)).toLocaleString('vi-VN') : '---'} 
        ({fund.changePercent ? fund.changePercent.toFixed(2) : '0.00'}%)
      </div>
    </div>
  );
}
