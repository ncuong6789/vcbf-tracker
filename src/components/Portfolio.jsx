import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';

export default function Portfolio({ funds }) {
  // Load saved CCQ (Chứng chỉ quỹ) from localStorage, or default to 0
  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem('vcbf_portfolio');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [isEditing, setIsEditing] = useState(false);

  // Save to localStorage whenever holdings change
  useEffect(() => {
    localStorage.setItem('vcbf_portfolio', JSON.stringify(holdings));
  }, [holdings]);

  const handleUpdateHolding = (fundId, amount) => {
    setHoldings(prev => ({
      ...prev,
      [fundId]: Number(amount)
    }));
  };

  // Calculate total portfolio value
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
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Xong (Done)' : 'Sửa số lượng CCQ'}
        </button>
      </div>

      <div className="mb-8 p-6 bg-green/10 rounded-lg text-center" style={{ background: 'rgba(46, 160, 67, 0.1)', border: '1px solid var(--primary-color)' }}>
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
            <div key={fund.id} className="p-4 bg-black/20 rounded-lg" style={{ border: '1px solid var(--panel-border)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{fund.shortName}</span>
                <span className="text-sm text-green font-semibold">{fundValue.toLocaleString('vi-VN')} VND</span>
              </div>
              
              {isEditing ? (
                <div className="flex flex-col mt-4">
                  <label className="text-xs text-muted mb-1">Số lượng CCQ (Quantity)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="0.00"
                    value={amount === 0 ? '' : amount.toLocaleString('vi-VN')}
                    onChange={(e) => {
                       // allow numbers and decimal comma
                       let rawValue = e.target.value.replace(/[^0-9,]/g, '');
                       // convert comma to dot for parsing
                       const parseVal = rawValue.replace(',', '.');
                       if (parseVal === '') {
                          handleUpdateHolding(fund.id, 0);
                       } else {
                          // Keep the string formatting raw but convert back to numbers for state
                          // Here we simply parse float. It might lose trailing comma visually, 
                          // but for simple CCQ (e.g. 1000.5) it is acceptable
                          handleUpdateHolding(fund.id, parseFloat(parseVal) || 0);
                       }
                    }}
                    className="p-2 text-sm"
                  />
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted flex justify-between">
                  <span>Sở hữu: <strong className="text-white">{amount.toLocaleString('vi-VN')} CCQ</strong></span>
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
