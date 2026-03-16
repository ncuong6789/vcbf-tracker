import { useState } from 'react';
import NumberInput from './NumberInput';

export default function Calculator() {
  const [initialCapital, setInitialCapital] = useState(10000000);
  const [monthlyDCA, setMonthlyDCA] = useState(5000000);
  const [years, setYears] = useState(5);
  const [annualReturn, setAnnualReturn] = useState(12);

  const calculate = () => {
    let principal = initialCapital;
    let totalInvested = initialCapital;
    const monthlyRate = (annualReturn / 100) / 12;
    const months = years * 12;

    for (let i = 0; i < months; i++) {
        principal = (principal + monthlyDCA) * (1 + monthlyRate);
        totalInvested += monthlyDCA;
    }

    return { final: principal, invested: totalInvested, profit: principal - totalInvested };
  };

  const results = calculate();

  return (
    <div className="glass-panel p-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-6">Investment Calculator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <NumberInput 
            label="Initial Capital (VND)" 
            value={initialCapital} 
            onChange={setInitialCapital} 
          />
          <NumberInput 
            label="Monthly Investment - DCA (VND)" 
            value={monthlyDCA} 
            onChange={setMonthlyDCA} 
          />
          <NumberInput 
            label="Investment Period (Years)" 
            value={years} 
            onChange={setYears} 
          />
          <NumberInput 
            label="Expected Annual Return (%)" 
            value={annualReturn} 
            onChange={setAnnualReturn} 
            subtext="Historically VCBF equity funds average ~10-15%/year over long term."
          />
        </div>

        <div className="flex flex-col justify-center glass-panel p-6 bg-black/20" style={{ border: 'none' }}>
          <h3 className="text-xl font-bold mb-4 text-center">Projected Result</h3>
          
          <div className="flex justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-muted">Total Invested:</span>
            <span className="font-bold">{results.invested.toLocaleString('vi-VN')} VND</span>
          </div>
          
          <div className="flex justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-muted">Total Profit:</span>
            <span className="font-bold text-green">+{results.profit.toLocaleString('vi-VN')} VND</span>
          </div>

          <div className="flex justify-between py-4 mt-2">
            <span className="text-lg">Total Wealth:</span>
            <span className="text-3xl font-bold text-green">{Math.round(results.final).toLocaleString('vi-VN')} VND</span>
          </div>
        </div>
      </div>
    </div>
  );
}
