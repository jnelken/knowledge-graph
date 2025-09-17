import { 
  ParsedTranscript, 
  ExtractedStatement, 
  ExtractedEntity,
  NodeType
} from '@/types/graph';

interface ParsedLine {
  lineNumber: number;
  content: string;
  speaker?: string;
}

// Patterns to identify statement types
const STATEMENT_PATTERNS = [
  // Claims and assertions
  /\b(I believe|I think|it's clear that|the fact is|obviously|certainly|definitely)\b/i,
  // Financial/numerical claims
  /\$[\d,]+ (billion|trillion|million)/i,
  // Institutional claims
  /\b(the [A-Z][A-Za-z\s]+ (Department|Agency|Administration|Bank|Federal|Treasury))/i,
  // Temporal claims
  /\b(in \d{4}|since \d{4}|by \d{4}|during the)/i,
];

// Entity extraction patterns by type
const ENTITY_PATTERNS = {
  [NodeType.PERSON]: [
    /\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g, // Names
    /\b(Dr\.|Mr\.|Ms\.|Mrs\.) ([A-Z][a-z]+ [A-Z][a-z]+)/g, // Titles with names
  ],
  [NodeType.INSTITUTION]: [
    /\b(Department of [A-Z][A-Za-z\s]+|[A-Z][A-Za-z\s]+ Department)\b/g,
    /\b(Federal [A-Z][A-Za-z\s]+|[A-Z][A-Za-z\s]+ Federal)\b/g,
    /\b(Bank of [A-Z][A-Za-z\s]+|[A-Z][A-Za-z\s]+ Bank)\b/g,
    /\b(University of [A-Z][A-Za-z\s]+|[A-Z][A-Za-z\s]+ University)\b/g,
  ],
  [NodeType.DOCUMENT]: [
    /\b([A-Z][A-Za-z\s]+ Act)\b/g,
    /\b([A-Z][A-Za-z\s]+ Report)\b/g,
    /\b([A-Z][A-Za-z\s]+ Statement)\b/g,
    /\b(Financial Accounting Standards Advisory Board Statement \d+)\b/g,
  ],
  [NodeType.LOCATION]: [
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,?\s(?:State|Province|Country|City))\b/g,
    /\b(Washington(?:\s+D\.?C\.?)?|New York|California|Texas|Pentagon|Wall Street)\b/g,
  ],
  [NodeType.EVENT]: [
    /\b(\d{4}\s(?:financial\s)?crisis)\b/g,
    /\b(World War [IVX]+|9\/11|September 11|pandemic)\b/g,
  ]
};

/**
 * Parse raw transcript text into structured data
 */
export function parseTranscript(content: string, source?: string): ParsedTranscript {
  const lines = content.split('\n').filter(line => line.trim());
  const parsedLines = parseLines(lines);
  
  const title = extractTitle(lines);
  const statements = extractStatements(parsedLines);
  const entities = extractEntities(content);

  return {
    title,
    source: source || '',
    content,
    statements,
    entities
  };
}

/**
 * Parse individual lines and detect speakers
 */
function parseLines(lines: string[]): ParsedLine[] {
  return lines.map((line, index) => {
    // Try to detect speaker (simple heuristic)
    const speakerMatch = line.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)?):?\s+(.+)$/);
    
    if (speakerMatch) {
      return {
        lineNumber: index + 1,
        content: speakerMatch[2],
        speaker: speakerMatch[1]
      };
    }

    return {
      lineNumber: index + 1,
      content: line.trim()
    };
  }).filter(parsed => parsed.content.length > 0);
}

/**
 * Extract the title from transcript lines
 */
function extractTitle(lines: string[]): string {
  // Look for source URL first
  const sourceLine = lines.find(line => line.startsWith('source:'));
  if (sourceLine) {
    const url = sourceLine.replace('source:', '').trim();
    if (url.includes('youtube') || url.includes('youtu.be')) {
      return 'YouTube Interview Transcript';
    }
  }

  // Look for "Transcript:" line
  const transcriptIndex = lines.findIndex(line => 
    line.toLowerCase().includes('transcript')
  );

  if (transcriptIndex >= 0 && transcriptIndex < lines.length - 1) {
    return 'Interview Transcript';
  }

  return 'Untitled Transcript';
}

/**
 * Extract statements from parsed lines
 */
function extractStatements(parsedLines: ParsedLine[]): ExtractedStatement[] {
  const statements: ExtractedStatement[] = [];

  parsedLines.forEach(line => {
    // Skip very short lines
    if (line.content.length < 20) return;

    // Check if line contains statement patterns
    const hasStatementPattern = STATEMENT_PATTERNS.some(pattern => 
      pattern.test(line.content)
    );

    if (hasStatementPattern) {
      // Split into sentences and extract meaningful statements
      const sentences = line.content.split(/[.!?]+/).filter(s => s.trim().length > 15);
      
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed.length > 20) {
          statements.push({
            text: trimmed,
            speaker: line.speaker,
            context: line.content,
            confidence: calculateStatementConfidence(trimmed),
            type: classifyStatement(trimmed)
          });
        }
      });
    }
  });

  return statements;
}

/**
 * Extract entities from the full text content
 */
function extractEntities(content: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const entityMap = new Map<string, ExtractedEntity>();

  Object.entries(ENTITY_PATTERNS).forEach(([type, patterns]) => {
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1] || match[0];
        const cleanText = text.trim();
        
        if (cleanText.length > 2) {
          const key = `${type}-${cleanText.toLowerCase()}`;
          
          if (!entityMap.has(key)) {
            entityMap.set(key, {
              text: cleanText,
              type: type as NodeType,
              mentions: [],
              confidence: 0.8
            });
          }

          const entity = entityMap.get(key)!;
          entity.mentions.push({
            context: getContext(content, match.index!),
            position: match.index!,
            length: text.length
          });
        }
      }
    });
  });

  return Array.from(entityMap.values());
}

/**
 * Get context around a position in text
 */
function getContext(content: string, position: number, contextLength = 100): string {
  const start = Math.max(0, position - contextLength);
  const end = Math.min(content.length, position + contextLength);
  return content.substring(start, end).trim();
}

/**
 * Calculate confidence level for a statement
 */
function calculateStatementConfidence(statement: string): number {
  let confidence = 0.5;

  // Increase confidence for specific patterns
  if (/\d+(\.\d+)?\s*(billion|trillion|million|percent)/.test(statement)) {
    confidence += 0.2; // Specific numbers
  }
  
  if (/\b(according to|research shows|data indicates|studies show)\b/i.test(statement)) {
    confidence += 0.1; // References to evidence
  }

  if (/\b(I think|I believe|maybe|perhaps|probably)\b/i.test(statement)) {
    confidence -= 0.2; // Uncertainty words
  }

  return Math.max(0.1, Math.min(1.0, confidence));
}

/**
 * Classify the type of statement
 */
function classifyStatement(statement: string): 'claim' | 'fact' | 'opinion' | 'question' {
  if (statement.includes('?')) return 'question';
  
  if (/\b(I think|I believe|in my opinion|it seems)\b/i.test(statement)) {
    return 'opinion';
  }
  
  if (/\b(\d+|according to|research|data|study)\b/i.test(statement)) {
    return 'fact';
  }
  
  return 'claim';
}