export default function FundHoldings({ fund }) {
  if (!fund) return null;

  const { topHoldings = [], industryHoldings = [], assetAllocation = [] } = fund;

  const assetColors = {
    STOCK: '#3FEBA2',
    BOND: '#479258',
    CASH: '#F59E0B',
    GOLD: '#FBBF24',
    FUND: '#6366F1',
  };

  return (
    <div className="holdings-container">
      {/* Asset Allocation Pie-like bars */}
      {assetAllocation.length > 0 && (
        <div className="glass-panel p-4 mb-4">
          <h3 className="font-bold mb-3" style={{ color: 'var(--primary-color)' }}>Phân bổ tài sản</h3>
          <div className="allocation-bars">
            {assetAllocation.map((item) => (
              <div key={item.id || item.assetType?.code} className="allocation-row">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold">
                    <span className="asset-dot" style={{ background: item.assetType?.colorCode || assetColors[item.assetType?.code] || '#aaa' }}></span>
                    {item.assetType?.name}
                  </span>
                  <span className="text-sm font-bold">{item.assetPercent?.toFixed(2)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${item.assetPercent}%`,
                      background: item.assetType?.colorCode || assetColors[item.assetType?.code] || 'var(--primary-color)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row with Industry Holdings and Top Holdings side by side */}
      <div className="holdings-grid">
        {/* Industry Allocation */}
        {industryHoldings.length > 0 && (
          <div className="glass-panel p-4">
            <h3 className="font-bold mb-3" style={{ color: 'var(--primary-color)' }}>Phân bổ ngành</h3>
            <div className="industry-list">
              {industryHoldings.map((item, i) => (
                <div key={i} className="industry-row">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{item.industry}</span>
                    <span className="text-sm font-bold">{item.assetPercent?.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${item.assetPercent}%`, background: 'var(--primary-color)' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Stock Holdings */}
        {topHoldings.length > 0 && (
          <div className="glass-panel p-4">
            <h3 className="font-bold mb-3" style={{ color: 'var(--primary-color)' }}>Top cổ phiếu nắm giữ</h3>
            <div className="top-holdings-list">
              {topHoldings.slice(0, 10).map((h, i) => {
                const isPos = h.changeFromPrevious >= 0;
                return (
                  <div key={h.id || i} className="holding-row">
                    <div className="holding-rank">{i + 1}</div>
                    <div className="holding-info">
                      <div className="flex justify-between">
                        <span className="font-bold">{h.stockCode}</span>
                        <span className="font-bold">{h.netAssetPercent?.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted">
                        <span>{h.industry}</span>
                        <span className={isPos ? 'text-green' : 'text-red'}>
                          {isPos ? '▲' : '▼'} {Math.abs(h.changeFromPreviousPercent)?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
