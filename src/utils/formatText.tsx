import React from 'react';
import { Text } from 'react-native';
import { type } from '../theme';

/**
 * Cleans up raw LaTeX formatting, markdown headers, and unescaped symbols.
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

  // Clean markdown headers like "### Title" -> "**Title**"
  cleaned = cleaned.replace(/^#{1,6}\s*(.+)$/gm, '**$1**\n');

  // Convert markdown bullet points "* item" or "- item" at start of lines to "• item"
  cleaned = cleaned.replace(/^[\*\-]\s+(.+)$/gm, '• $1');

  // Format "Here's a simple example: What is 1/2 + 1/3?" onto its own bold line
  cleaned = cleaned.replace(
    /(Here's a simple example|Example|Question|Try this|Solve this):\s*([^\n?]+\?)\s*/gi,
    (_, intro: string, q: string) => {
      const trimmedQ = q.trim().replace(/^\*\*|\*\*$/g, '');
      return `${intro}:\n\n**${trimmedQ}**\n\n`;
    }
  );

  // Clean up any extra triple/quadruple newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

type TextToken = {
  text: string;
  isBold: boolean;
};

/**
 * Parses markdown bold (**text**, __text__, or *text*) into tokens and strips any stray raw asterisks.
 */
export function parseFormattedTokens(input: string): TextToken[] {
  if (!input) return [];

  // Match **bold** or __bold__ or *bold* (word boundary)
  const regex = /(\*\*|__)(.*?)\1|(?<=\s|^)\*([^\s\*].*?[^\s\*]|\w)\*(?=\s|$|[.,!?:;])/gs;
  
  const tokens: TextToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      const beforeText = input.substring(lastIndex, match.index);
      if (beforeText) {
        // Strip any dangling lone asterisks that might have been unclosed
        tokens.push({ text: beforeText.replace(/\*\*/g, '').replace(/\*/g, ''), isBold: false });
      }
    }

    // Bold text inside delimiters
    const boldContent = match[2] ?? match[3] ?? '';
    if (boldContent) {
      tokens.push({ text: boldContent.replace(/\*\*/g, ''), isBold: true });
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text after last match
  if (lastIndex < input.length) {
    const afterText = input.substring(lastIndex);
    if (afterText) {
      tokens.push({ text: afterText.replace(/\*\*/g, '').replace(/\*/g, ''), isBold: false });
    }
  }

  return tokens.filter((t) => t.text.length > 0);
}

/**
 * Renders text containing markdown markup into React Native Text nodes without any raw ** characters.
 */
export function renderFormattedText(text: string, baseStyle: any, boldStyle?: any) {
  const formatted = formatMathText(text);
  const tokens = parseFormattedTokens(formatted);

  if (tokens.length === 0) {
    return <Text style={baseStyle}>{text.replace(/\*\*/g, '').replace(/\*/g, '')}</Text>;
  }

  return (
    <Text style={baseStyle}>
      {tokens.map((token, index) => {
        if (token.isBold) {
          return (
            <Text
              key={index}
              style={[
                baseStyle,
                { fontFamily: type.bodyBold, fontWeight: '700' },
                boldStyle,
              ]}
            >
              {token.text}
            </Text>
          );
        }
        return <Text key={index} style={baseStyle}>{token.text}</Text>;
      })}
    </Text>
  );
}
