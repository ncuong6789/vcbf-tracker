import { useEffect, useState } from 'react';
import { fetchCurrentNavs, fetchHistory, fetchComparisonData, VCBF_FUNDS } from './api/fmarket';
import FundCard from './components/FundCard';
import NavChart from './components/NavChart';
import CompareChart from './components/CompareChart';
import Calculator from './components/Calculator';
import Portfolio from './components/Portfolio';
import FundHoldings from './components/FundHoldings';
import { LineChart, Calculator as CalcIcon, LayoutDashboard, History, Wallet, PieChart } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [funds, setFunds] = useState([]);
  const [activeFund, setActiveFund] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch initial real-time funds
  useEffect(() => {
    async function init() {
      setLoading(true);
      const data = await fetchCurrentNavs();
      setFunds(data);
      if (data.length > 0) {
        setActiveFund(data.find(f => f.shortName === 'BCF') || data[0]);
      }
      setLastUpdated(new Date());
      setLoading(false);
    }
    init();
    // Auto-refresh every 5 minutes
    const interval = setInterval(init, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch history when active fund changes
  useEffect(() => {
    if (activeFund && (activeTab === 'dashboard' || activeTab === 'history')) {
      const today = new Date();
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(today.getFullYear() - 3);
      
      const fromDate = threeYearsAgo.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];
      
      fetchHistory(activeFund.id, fromDate, toDate).then(history => {
        // Append the current NAV as today's data point to bridge the gap.
        if (activeFund.nav) {
          const todayStr = today.toISOString().split('T')[0];
          const lastEntry = history[history.length - 1];
          // Only add if today isn't already the last point
          if (!lastEntry || lastEntry.navDate !== todayStr) {
            history = [...history, { navDate: todayStr, nav: activeFund.nav, productId: activeFund.id }];
          }
        }
        setHistoryData(history);
      });
    }
  }, [activeFund, activeTab]);

  // Fetch comparison data
  useEffect(() => {
    if (activeTab === 'compare' && funds.length > 0) {
      const today = new Date();
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(today.getFullYear() - 3);
      
      const fromDate = threeYearsAgo.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];
      
      fetchComparisonData(funds, fromDate, toDate).then(setCompareData);
    }
  }, [activeTab, funds]);


  // Update activeFund after fund data refreshes (keep selection in sync)
  useEffect(() => {
    if (activeFund && funds.length > 0) {
      const updated = funds.find(f => f.id === activeFund.id);
      if (updated) setActiveFund(updated);
    }
  }, [funds]);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div>
          <h1 className="text-2xl font-bold text-green mb-8 px-4" style={{textShadow: '0 0 10px var(--primary-glow)'}}>VCBF Tracker</h1>
          <div className="flex flex-col gap-2">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button 
              className={`nav-item ${activeTab === 'holdings' ? 'active' : ''}`}
              onClick={() => setActiveTab('holdings')}
              style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <PieChart size={20} /> Fund Holdings
            </button>
            <button 
              className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
              style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <Wallet size={20} /> My Portfolio
            </button>
            <button 
              className={`nav-item ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
              style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <LineChart size={20} /> Compare Funds
            </button>
            <button 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <History size={20} /> Historical Data
            </button>
            <button 
              className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
              style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <CalcIcon size={20} /> Projections
            </button>
          </div>
        </div>
        <div className="px-4 text-sm text-muted mt-auto">
          <p>Data provided by Fmarket</p>
          {lastUpdated && (
            <p className="mt-1 text-xs">
              Last updated: {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xl animate-fade-in-up text-green" style={{textShadow: '0 0 10px var(--primary-glow)'}}>
              Loading VCBF data...
            </div>
          </div>
        ) : (
          <>
            {/* Top Funds Row - Visible everywhere except Calculator and Portfolio */}
            {['dashboard', 'history', 'holdings'].includes(activeTab) && (
              <div className="animate-fade-in-up mb-6">
                <h2 className="text-2xl font-bold mb-4">VCBF Open-Ended Funds {" "}
                  <span className="text-sm font-normal text-muted bg-green/10 text-green px-2 py-1 rounded" style={{background: 'rgba(46, 160, 67, 0.1)'}}>LIVE</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {funds.map((f, i) => (
                    <div className={`animate-delay-${Math.min(i, 3)}`} key={f.id}>
                      <FundCard 
                        fund={f} 
                        isActive={activeFund?.id === f.id}
                        onClick={setActiveFund}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboard View - Chart + Performance */}
            {activeTab === 'dashboard' && activeFund && (
              <div className="animate-fade-in-up animate-delay-2">
                {/* Performance Summary for active fund */}
                {activeFund.navTo1Month !== undefined && (
                  <div className="glass-panel p-4 mb-6">
                    <h3 className="font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
                      Performance {activeFund.shortName} (%)
                    </h3>
                    <div className="perf-grid">
                      {[
                        { label: '1 Month', val: activeFund.navTo1Month },
                        { label: '3 Months', val: activeFund.navTo3Months },
                        { label: '6 Months', val: activeFund.navTo6Months },
                        { label: '12 Months', val: activeFund.navTo12Months },
                        { label: '36 Months', val: activeFund.navTo36Months },
                        { label: 'Inception', val: activeFund.navToEstablish },
                      ].map(({ label, val }) => (
                        val !== null && val !== undefined ? (
                          <div key={label} className="perf-item">
                            <div className="text-muted text-xs">{label}</div>
                            <div className={`font-bold text-lg ${val >= 0 ? 'text-green' : 'text-red'}`}>
                              {val >= 0 ? '+' : ''}{val?.toFixed(2)}%
                            </div>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{activeFund.fullName} ({activeFund.shortName})</h3>
                    <p className="text-muted">NAV History (3 Years)</p>
                  </div>
                </div>
                <NavChart data={historyData} />
              </div>
            )}

            {/* Holdings View */}
            {activeTab === 'holdings' && activeFund && (
              <div className="animate-fade-in-up animate-delay-1">
                <h3 className="text-xl font-bold mb-4">
                  Top Holdings & Sectors – {activeFund.fullName} ({activeFund.shortName})
                </h3>
                <FundHoldings fund={activeFund} />
              </div>
            )}

            {/* Portfolio View */}
            {activeTab === 'portfolio' && (
              <Portfolio funds={funds} />
            )}

            {/* Compare Funds View */}
            {activeTab === 'compare' && (
              <div className="animate-fade-in-up animate-delay-1">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Multi-Fund Comparison</h3>
                    <p className="text-muted">3-Year Growth Percentage (%)</p>
                  </div>
                </div>
                <CompareChart data={compareData} funds={VCBF_FUNDS} />
              </div>
            )}

            {/* History View */}
            {activeTab === 'history' && activeFund && (
              <div className="animate-fade-in-up animate-delay-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h3 className="text-xl font-bold mb-4">{activeFund.shortName} Chart</h3>
                    <NavChart data={historyData} />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4">Data Log</h3>
                    <div className="glass-panel p-4" style={{ height: '400px', overflowY: 'auto' }}>
                    <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', backdropFilter: 'var(--glass-blur)' }}>
                        <tr>
                            <th className="p-2 border-b" style={{ borderColor: 'var(--panel-border)' }}>Date</th>
                            <th className="p-2 border-b text-right" style={{ borderColor: 'var(--panel-border)' }}>NAV (VND)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[...historyData].reverse().map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td className="p-2">{new Date(d.navDate).toLocaleDateString('en-GB')}</td>
                            <td className="p-2 font-semibold text-right">{(d.nav).toLocaleString('vi-VN')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
              </div>
            )}

            {/* Calculator View */}
            {activeTab === 'calculator' && (
              <Calculator />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
