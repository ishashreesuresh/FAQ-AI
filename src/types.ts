import { MatchResult } from './nlp/nlpEngine';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  matchData?: MatchResult;
  isWelcome?: boolean;
}

export interface TestCase {
  id: number;
  query: string;
  expectedCategory: string;
  expectedIntent: string;
  isUnrelated?: boolean;
}
