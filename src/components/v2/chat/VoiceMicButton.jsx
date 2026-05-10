// ================================================================
// Sprint D-8 — Lightweight chat mic button.
//
// Per decision §7.H: reuses the SAME Web Speech API pattern as
// the existing dashboard/voice-cx/VoiceCommandRecorder.jsx, but
// in a chat-flavored shim (small icon button slot for ChatInput's
// leftSlot, no full recorder UI).
//
// Only renders when SpeechRecognition is supported AND we're not
// on a mobile browser (mobile relies on the native keyboard mic
// per spec; system keyboard mic is superior).
// ================================================================
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isSupported() {
  return typeof window !== 'undefined' &&
         !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function langCodeFor(lang) {
  const v = String(lang || 'tr').toLowerCase();
  if (v === 'ar') return 'ar-SA';
  if (v === 'en') return 'en-US';
  return 'tr-TR';
}

export default function VoiceMicButton({ lang = 'tr', onTranscript, onError }) {
  const [recording, setRecording] = useState(false);
  const recogRef = useRef(null);

  useEffect(() => () => {
    try { recogRef.current?.stop?.(); } catch { /* ignore */ }
  }, []);

  // Don't render on unsupported browsers / mobile (rely on system keyboard mic).
  if (!isSupported() || isMobile()) return null;

  const start = () => {
    try {
      const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new Recog();
      recog.lang = langCodeFor(lang);
      recog.interimResults = true;
      recog.continuous = true;
      let acc = '';
      recog.onresult = (ev) => {
        let txt = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          txt += ev.results[i][0].transcript;
        }
        acc = (acc + ' ' + txt).trim();
        onTranscript?.(acc, /* final */ false);
      };
      recog.onend = () => {
        setRecording(false);
        if (acc) onTranscript?.(acc, /* final */ true);
      };
      recog.onerror = (e) => {
        setRecording(false);
        onError?.(e?.error || 'recording_error');
      };
      recog.start();
      recogRef.current = recog;
      setRecording(true);
    } catch (err) {
      onError?.(err?.message || String(err));
      setRecording(false);
    }
  };

  const stop = () => {
    try { recogRef.current?.stop?.(); } catch { /* ignore */ }
    setRecording(false);
  };

  const toggle = () => {
    if (recording) stop(); else start();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={recording ? 'Stop voice input' : 'Start voice input'}
      title={recording ? 'Stop voice input' : 'Voice input'}
      style={{
        flexShrink: 0,
        width: 38, height: 38,
        borderRadius: 10,
        background: recording
          ? 'linear-gradient(135deg, rgba(255, 61, 90, 0.85), rgba(255, 61, 90, 0.55))'
          : 'rgba(255, 255, 255, 0.05)',
        color: recording ? '#FFFFFF' : '#CBD5E1',
        border: recording
          ? '1px solid rgba(255, 61, 90, 0.55)'
          : '1px solid rgba(255, 255, 255, 0.12)',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'inherit',
        boxShadow: recording ? '0 0 0 4px rgba(255, 61, 90, 0.20)' : 'none',
        transition: 'box-shadow 200ms ease, background 200ms ease',
        animation: recording ? 'cn-aurora-pulse 1.6s ease-in-out infinite' : 'none'
      }}
    >
      {recording ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
}
