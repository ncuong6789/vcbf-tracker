import { useEffect, useState } from 'react';
import { fetchGoldPrice } from '../api/fmarket';

export default function GoldPrice() {
  const [gold, setGold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchGoldPrice();
      if (data) {
        setGold(data);
      } else {
        setError('Không thể tải giá vàng');
      }
      setLoading(false);
    };
    load();
    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isPos = gold?.changePercent >= 0;

  return (
    <div className="glass-panel p-4" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(17,24,39,0.8) 100%)', borderColor: 'rgba(251,191,36,0.3)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🥇</span>
        <span className="font-bold text-lg" style={{ color: '#FBBF24' }}>Giá vàng thế giới</span>
        <span className="text-muted text-xs">Yahoo Finance</span>
      </div>

      {loading ? (
        <div className="text-muted text-sm">Đang tải giá vàng...</div>
      ) : error ? (
        <div className="text-red text-sm">{error}</div>
      ) : gold ? (
        <div className="gold-grid">
          <div className="gold-item">
            <div className="text-muted text-xs mb-1">Giá (USD/oz)</div>
            <div className="font-bold text-xl" style={{ color: '#FBBF24' }}>
              ${gold.priceUsdOz?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-semibold ${isPos ? 'text-green' : 'text-red'}`}>
              {isPos ? '▲' : '▼'} {Math.abs(gold.changePercent)?.toFixed(2)}%
              <span className="text-muted font-normal"> (${Math.abs(gold.changeUsd)?.toFixed(2)})</span>
            </div>
          </div>

          <div className="gold-item">
            <div className="text-muted text-xs mb-1">VND/chi (≈3,75g)</div>
            <div className="font-bold text-xl" style={{ color: '#FBBF24' }}>
              {Math.round(gold.priceVndChi)?.toLocaleString('vi-VN')}
            </div>
            <div className="text-muted text-xs">1 lượng ≈ {Math.round(gold.priceVndLuong)?.toLocaleString('vi-VN')} VND</div>
          </div>

          <div className="gold-item">
            <div className="text-muted text-xs mb-1">Tỷ giá USD/VND</div>
            <div className="font-bold text-lg">
              {Math.round(gold.usdVnd)?.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
