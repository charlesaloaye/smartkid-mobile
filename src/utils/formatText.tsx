import React from 'react';
import { Text } from 'react-native';
import { type } from '../theme';

/**
 * Cleans up raw LaTeX formatting and formats questions onto separate bold lines.
 */
export function formatMathText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Replace \frac{num}{den} with num/den or (num)/(den)
  cleaned = cleaned.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_, num: string, den: string) => {
    const n = num.trim();
    const d = den.trim();
    const formattedNum = /[\s+\-]/.test(n) ? `(${n})` : n;
    const formattedDen = /[\s+\-]/.test(d) ? `(${d})` : d;
    return `${formattedNum}/${formattedDen}`;
  });

  // Remove LaTeX math block delimiters \( \) and \[ \]
  cleaned = cleaned.replace(/\\\(|\\\)|\\\[|\\\]/g, '');

  // Replace common LaTeX symbols with clean unicode
  const symbolMap: Record<string, string> = {
    '\\times': '×',
    '\\div': '÷',
    '\\cdot': '•',
    '\\leq': '≤',
    '\\le': '≤',
    '\\geq': '≥',
    '\\ge': '≥',
    '\\neq': '≠',
    '\\approx': '≈',
    '\\pi': 'π',
    '\\degree': '°',
    '^\\circ': '°',
  };

  for (const [pattern, replacement] of Object.entries(symbolMap)) {
    cleaned = cleaned.replaceAll(pattern, replacement);
  }

  // Replace \sqrt{x} with √x or √(expression)
  cleaned = cleaned.replace(/\\sqrt\s*\{([^{}]+)\}/g, (_, inner: string) => {
    const trimmed = inner.trim();
    return /^[a-zA-Z0-9]+$/.test(trimmed) ? `√${trimmed}` : `√(${trimmed})`;
  });

  // Format "Here's a simple example: What is 1/2 + 1/3?" onto its own bold line
  cleaned = cleaned.replace(
    /(Here's a simple example|Example|Question|Try this|Solve this):\s*([^\n?]+\?)\s*/gi,
    (_, intro: string, q: string) => {
      const trimmedQ = q.trim();
      if (trimmedQ.startsWith('**') && trimmedQ.endsWith('**')) {
        return `${intro}:\n\n${trimmedQ}\n\n`;
      }
      return `${intro}:\n\n**${trimmedQ}**\n\n`;
    }
  );

  // Clean up any extra triple/quadruple newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

/**
 * Renders text containing **bold** markup into React Native Text nodes.
 */
export function renderFormattedText(text: string, baseStyle: any, boldStyle?: any) {
  const formatted = formatMathText(text);
  const parts = formatted.split(/\*\*/g);

  return (
    <Text style={baseStyle}>
      {parts.map((part, index) => {
        const isBold = index % 2 === 1;
        if (isBold) {
          return (
            <Text key={index} style={[baseStyle, { fontFamily: type.bodyBold, fontWeight: '700' }, boldStyle]}>
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}
