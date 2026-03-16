import { useState, useEffect } from 'react';

// A custom input component that displays numbers with thousand separators
export default function NumberInput({ value, onChange, label, subtext, min = 0 }) {
  // We keep a local string state for what the user types
  const [displayValue, setDisplayValue] = useState('');

  // Sync internal display state when value prop changes externally
  useEffect(() => {
    if (value === 0 || value) {
      setDisplayValue(value.toLocaleString('vi-VN'));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    // Remove all non-digit characters
    const rawValue = e.target.value.replace(/\D/g, '');
    
    if (rawValue === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const numberValue = parseInt(rawValue, 10);
    // Format back to string with dots
    setDisplayValue(numberValue.toLocaleString('vi-VN'));
    // Pass raw number up to parent
    onChange(numberValue);
  };

  return (
    <div>
      <label className="text-muted block mb-2">{label}</label>
      <input 
        type="text" 
        value={displayValue} 
        onChange={handleChange} 
        inputMode="numeric"
      />
      {subtext && <p className="text-sm text-muted mt-1">{subtext}</p>}
    </div>
  );
}
