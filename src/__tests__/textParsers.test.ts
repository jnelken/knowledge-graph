import { describe, expect, it } from 'vitest';
import { parseTranscript } from '@/utils/data/textParsers';
import { NodeType } from '@/types/graph';

const entityTexts = (content: string, type: NodeType) =>
  parseTranscript(content).entities.filter(e => e.type === type).map(e => e.text);

describe('parseTranscript', () => {
  describe('title', () => {
    it('names YouTube sources', () => {
      expect(parseTranscript('source: https://www.youtube.com/watch?v=abc\nhello').title)
        .toBe('YouTube Interview Transcript');
      expect(parseTranscript('source: https://youtu.be/abc').title).toBe('YouTube Interview Transcript');
    });

    it('falls back to a transcript heading when the source is not YouTube', () => {
      expect(parseTranscript('source: https://example.com\nTranscript:\nhello').title)
        .toBe('Interview Transcript');
    });

    it('ignores a transcript heading on the last non-empty line', () => {
      expect(parseTranscript('hello\nTranscript\n\n').title).toBe('Untitled Transcript');
    });

    it('defaults to Untitled Transcript', () => {
      expect(parseTranscript('just some words').title).toBe('Untitled Transcript');
    });
  });

  it('passes content through and defaults source to an empty string', () => {
    const content = 'just some words';
    expect(parseTranscript(content)).toMatchObject({ content, source: '' });
    expect(parseTranscript(content, 'file.txt').source).toBe('file.txt');
  });

  describe('statements', () => {
    it('strips the speaker prefix into speaker and context', () => {
      const [statement] = parseTranscript('Alice: I think the economy is going to slow down a lot').statements;
      expect(statement).toEqual({
        text: 'I think the economy is going to slow down a lot',
        speaker: 'Alice',
        context: 'I think the economy is going to slow down a lot',
        confidence: 0.3,
        type: 'opinion'
      });
    });

    it('treats any leading capitalized word as a speaker, colon or not', () => {
      const [statement] = parseTranscript('Honestly I think the economy is going to slow down').statements;
      expect(statement).toMatchObject({ speaker: 'Honestly', text: 'I think the economy is going to slow down' });
      expect(parseTranscript('Certainly that was the strangest year of all').statements).toEqual([]);
    });

    it('skips short lines and lines without a statement pattern', () => {
      const { statements } = parseTranscript([
        'I think so.',
        'the weather was pleasant and the coffee was good all morning long.'
      ].join('\n'));
      expect(statements).toEqual([]);
    });

    it('splits matching lines into sentences longer than 20 characters', () => {
      const { statements } = parseTranscript(
        'obviously the market crashed hard last spring. Too short here. The fact is nobody saw it coming at all!'
      );
      expect(statements.map(s => s.text)).toEqual([
        'obviously the market crashed hard last spring',
        'The fact is nobody saw it coming at all'
      ]);
      expect(statements.every(s => s.speaker === undefined)).toBe(true);
    });

    it('scores confidence from numbers, evidence and hedging, clamped to [0.1, 1]', () => {
      const confidenceOf = (line: string) => parseTranscript(line).statements[0].confidence;
      expect(confidenceOf('obviously the plan cost $5 billion dollars to run')).toBeCloseTo(0.7);
      expect(confidenceOf('obviously, according to the report, it cost 3 trillion')).toBeCloseTo(0.8);
      expect(confidenceOf('certainly that was the strangest year of all')).toBeCloseTo(0.5);
      expect(confidenceOf('I believe it probably went somewhere else entirely')).toBeCloseTo(0.3);
    });

    it('classifies opinions, facts and claims, and never questions (splitting drops the "?")', () => {
      const typeOf = (line: string) => parseTranscript(line).statements[0].type;
      expect(typeOf('obviously we should ask where all that money went?')).toBe('claim');
      expect(typeOf('I think the research on this is very thin')).toBe('opinion');
      expect(typeOf('obviously the data shows something went wrong')).toBe('fact');
      expect(typeOf('obviously something went very wrong back then')).toBe('claim');
    });
  });

  describe('entities', () => {
    it('extracts each entity type', () => {
      expect(entityTexts('we spoke with John Smith yesterday', NodeType.PERSON)).toEqual(['John Smith']);
      expect(entityTexts('he worked at the Department of Defense', NodeType.INSTITUTION))
        .toEqual(['Department of Defense']);
      expect(entityTexts('under the Patriot Act', NodeType.DOCUMENT)).toEqual(['Patriot Act']);
      expect(entityTexts('offices on Wall Street', NodeType.LOCATION)).toEqual(['Wall Street']);
      expect(entityTexts('after the 2008 financial crisis', NodeType.EVENT)).toEqual(['2008 financial crisis']);
    });

    it('lets the greedy name pattern match multi-word phrases of any type', () => {
      expect(entityTexts('under the Patriot Act on Wall Street', NodeType.PERSON))
        .toEqual(['Patriot Act', 'Wall Street']);
    });

    it('lets capitalized phrases run across lines', () => {
      expect(entityTexts('the Department of Defense\nunder the Patriot Act', NodeType.DOCUMENT))
        .toEqual(['Department of Defense\nunder the Patriot Act']);
    });

    it('dedupes repeated mentions and records each position', () => {
      const content = 'the pandemic changed things. later the pandemic ended';
      const events = parseTranscript(content).entities.filter(e => e.type === NodeType.EVENT);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({ text: 'pandemic', confidence: 0.8 });
      expect(events[0].mentions).toEqual([
        { context: content, position: 4, length: 8 },
        { context: content, position: 39, length: 8 }
      ]);
    });

    it('limits mention context to 100 characters either side', () => {
      const content = `${'x'.repeat(150)} Texas ${'y'.repeat(150)}`;
      const [texas] = parseTranscript(content).entities.filter(e => e.type === NodeType.LOCATION);
      expect(texas.mentions[0].context).toBe(content.substring(51, 251).trim());
    });

    it('takes the first capture group for titled names', () => {
      expect(entityTexts('met Dr. Jane Doe today', NodeType.PERSON)).toEqual(['Jane Doe', 'Dr.']);
    });
  });
});
