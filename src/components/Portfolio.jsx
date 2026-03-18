import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';

export default function Portfolio({ funds }) {
  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem('vcbf_portfolio');
    if (saved) {
      try { return JSON.parse(saved); }
      catch (e) { return {}; }
    }
    return {};
  });

  // Raw string inputs for editing (to allow typing "1." or "1.4")
  const [rawInputs, setRawInputs] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem('vcbf_portfolio', JSON.stringify(holdings));
  }, [holdings]);

  // When entering edit mode, populate raw inputs with current values
  const startEditing = () => {
    const raw = {};
    funds.forEach(f => {
      raw[f.id] = (holdings[f.id] || 0) > 0 ? String(holdings[f.id]) : '';
    });
    setRawInputs(raw);
    setIsEditing(true);
  };

  const stopEditing = () => {
    // Commit all raw inputs to holdings
    const updated = { ...holdings };
    funds.forEach(f => {
      const val = parseFloat(rawInputs[f.id]) || 0;
      updated[f.id] = val;
    });
    setHoldings(updated);
    setIsEditing(false);
  };

  const handleRawInput = (fundId, value) => {
    // Allow digits and one decimal dot only
    const clean = value.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    const normalized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : clean;
    setRawInputs(prev => ({ ...prev, [fundId]: normalized }));
  };

  const totalValue = funds.reduce((acc, fund) => {
    const amount = holdings[fund.id] || 0;
    return acc + (amount * (fund.nav || 0));
  }, 0);

  return (
    <div className="glass-panel p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="text-green" /> My Portfolio (Danh mục của tôi)
        </h2>
        <button 
          className="btn btn-secondary text-sm px-3 py-1"
          onClick={isEditing ? stopEditing : startEditing}
        >
          {isEditing ? 'Xong (Done)' : 'Sửa số lượng CCQ'}
        </button>
      </div>

      <div className="mb-8 p-6 rounded-lg text-center" style={{ background: 'rgba(46, 160, 67, 0.1)', border: '1px solid var(--primary-color)' }}>
        <p className="text-muted mb-2">Tổng tài sản ước tính (Estimated Total Value)</p>
        <h3 className="text-3xl font-bold text-green" style={{ textShadow: '0 0 20px var(--primary-glow)' }}>
          {totalValue.toLocaleString('vi-VN')} <span className="text-xl">VND</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {funds.map(fund => {
          const amount = holdings[fund.id] || 0;
          const fundValue = amount * (fund.nav || 0);

          return (
            <div key={fund.id} className="p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{fund.shortName}</span>
                <span className="text-sm text-green font-semibold">{fundValue.toLocaleString('vi-VN')} VND</span>
              </div>
              
              {isEditing ? (
                <div className="flex flex-col mt-4">
                  <label className="text-xs text-muted mb-1">Số lượng CCQ (ví dụ: 1.4)</label>
                  <input 
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={rawInputs[fund.id] ?? ''}
                    onChange={(e) => handleRawInput(fund.id, e.target.value)}
                    className="p-2 text-sm"
                  />
                  <span className="text-xs text-muted mt-1">
                    Giá hiện tại: {(fund.nav || 0).toLocaleString('vi-VN')} VND/CCQ
                  </span>
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted flex justify-between">
                  <span>Sở hữu: <strong className="text-white">{amount.toLocaleString('vi-VN', { maximumFractionDigits: 4 })} CCQ</strong></span>
                  <span>Giá: {(fund.nav || 0).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
