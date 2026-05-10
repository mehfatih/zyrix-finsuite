// ================================================================
// Sprint D-8 — Chat input.
//
// Auto-grow textarea (max 6 lines), submit on Enter (Shift+Enter
// = newline), submit button. Voice button slot is left for B.11
// (`<VoiceMicButton>` will render here when supported).
// ================================================================
import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const MAX_LINES = 6;
const LINE_HEIGHT_PX = 20;
const MAX_HEIGHT_PX = MAX_LINES * LINE_HEIGHT_PX + 20; // padding allowance

export default function ChatInput({ onSubmit, disabled, placeholder, leftSlot }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);

  // Auto-grow.
  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const next = Math.min(ta.scrollHeight, MAX_HEIGHT_PX);
    ta.style.height = `${next}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit?.(trimmed);
    setValue('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: '10px 14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.10)',
        background: 'rgba(15, 23, 42, 0.55)'
      }}
    >
      {leftSlot}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder || 'Bir şey sor…'}
        rows={1}
        disabled={disabled}
        style={{
          flex: 1,
          resize: 'none',
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#F8FAFC',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          padding: '10px 12px',
          fontFamily: 'inherit',
          fontSize: 14,
          lineHeight: `${LINE_HEIGHT_PX}px`,
          outline: 'none',
          maxHeight: MAX_HEIGHT_PX,
          colorScheme: 'dark'
        }}
        onFocus={(e) => { e.target.style.borderColor = '#00D9FF'; e.target.style.boxShadow = '0 0 0 1px #00D9FF66'; }}
        onBlur={(e)  => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'; e.target.style.boxShadow = 'none'; }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send"
        style={{
          flexShrink: 0,
          width: 38, height: 38,
          borderRadius: 10,
          background: (disabled || !value.trim())
            ? 'rgba(255, 255, 255, 0.08)'
            : 'linear-gradient(135deg, rgba(157, 78, 221, 0.95), rgba(0, 217, 255, 0.75))',
          color: '#FFFFFF',
          border: '1px solid rgba(157, 78, 221, 0.45)',
          cursor: (disabled || !value.trim()) ? 'not-allowed' : 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit'
        }}
      >
        {disabled
          ? <Loader2 size={16} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
          : <Send size={16} />}
      </button>
    </div>
  );
}
