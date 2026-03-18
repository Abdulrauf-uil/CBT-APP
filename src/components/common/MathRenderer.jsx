import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathRenderer({ text, className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    // Replace $...$ and $$...$$ with spans
    const html = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, { displayMode: true, throwOnError: false });
      } catch (e) {
        return match;
      }
    }).replace(/\$([\s\S]+?)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    containerRef.current.innerHTML = html;
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={`math-container ${className}`}
      style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
    />
  );
}
