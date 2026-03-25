import { useState, useRef, useEffect } from 'react';

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [position, setPosition] = useState({ x: window.innerWidth - 300 - 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Drag logic
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  // Prevent window bounds clipping
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(Math.max(0, prev.x), window.innerWidth - 300),
        y: Math.min(Math.max(0, prev.y), window.innerHeight - 400)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculator logic
  const handleInput = (char) => {
    if (display === '0' || display === 'Error') {
      setDisplay(char);
    } else {
      setDisplay(display + char);
    }
  };

  const clear = () => setDisplay('0');
  const backspace = () => {
    if (display.length > 1 && display !== 'Error') {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const evaluate = () => {
    try {
      // safe eval alternative using new Function
      // replacing standard math symbols
      let sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      // basic validation to only allow math chars
      if (/[^0-9+\-*/.() ]/.test(sanitized)) throw new Error('Invalid input');
      
      const result = new Function(`return ${sanitized}`)();
      if (!isFinite(result) || isNaN(result)) throw new Error('Math error');
      
      // limit decimals
      setDisplay(String(Math.round(result * 1000000) / 1000000));
    } catch {
      setDisplay('Error');
    }
  };

  const buttons = [
    ['C', '⌫', '÷', '×'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '(', ')']
  ];

  return (
    <div className="calculator-wrapper card" style={{
      position: 'fixed',
      left: position.x,
      top: position.y,
      width: '280px',
      zIndex: 9999,
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      backgroundColor: 'var(--bg-surface)',
    }}>
      {/* Header / Drag Handle */}
      <div 
        className="calc-header"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>🧮 Calculator</span>
        <button 
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: 'white', 
            fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1, padding: '0 0.25rem'
          }}
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Display */}
      <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)' }}>
        <input 
          type="text" 
          value={display} 
          readOnly 
          style={{
            width: '100%',
            textAlign: 'right',
            fontSize: '1.5rem',
            padding: '0.5rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontFamily: 'monospace'
          }}
        />
      </div>

      {/* Keypad */}
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {buttons.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {row.map(btn => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === 'C') clear();
                  else if (btn === '⌫') backspace();
                  else if (btn === '=') evaluate();
                  else handleInput(btn);
                }}
                style={{
                  padding: '0.75rem 0',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: ['=', 'C', '⌫'].includes(btn) 
                    ? (btn === '=' ? 'var(--color-primary)' : 'var(--color-danger)') 
                    : ['+', '-', '×', '÷'].includes(btn) ? 'var(--color-secondary)' : 'var(--bg-body)',
                  color: ['=', 'C', '⌫', '+', '-', '×', '÷'].includes(btn) ? 'white' : 'var(--text-primary)',
                  transition: 'transform 0.1s, opacity 0.1s'
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.opacity = '0.8'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1'; }}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
