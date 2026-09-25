/**
 * NexaFAQ AI - Local NLP & TF-IDF Cosine Similarity Engine (TypeScript Implementation)
 * Multi-signal matching architecture:
 * 1. Word n-grams (1-2) + Character n-grams (3-5) TF-IDF Vectorization
 * 2. Keyword Overlap scoring
 * 3. Character sequence similarity scoring
 * 4. Multi-Signal Formula: 0.60 * tfidf + 0.25 * keyword + 0.15 * char
 */

import { FAQItem, FAQS_DATA } from '../data/faqs';

// Standard English Stopwords
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're",
  "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he',
  'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's",
  'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
  'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because',
  'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
  'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'all', 'any',
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
  'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're',
  've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't",
  'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't",
  'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn',
  "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't",
  'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", 'would', 'could'
]);

/**
 * General word canonicalization mapping common English/domain variations
 */
const CANONICAL_MAP: Record<string, string> = {
  'log in': 'login',
  'sign in': 'login',
  'signin': 'login',
  'logged': 'login',
  'logging': 'login',
  'settings': 'setting',
  'notifications': 'notification',
  'payments': 'payment',
  'cancellation': 'cancel',
  'cancelling': 'cancel',
  'canceled': 'cancel',
  'resetting': 'reset',
  'recovering': 'recover',
  'recovery': 'recover',
  'passwords': 'password',
  'invoices': 'invoice',
  'accounts': 'account',
  'profiles': 'profile',
  'supports': 'support',
  'assisting': 'assist',
  'assistance': 'support',
  'helping': 'help',
  'customer support': 'support'
};

/**
 * Porter Stemmer implementation for morphological word normalization.
 */
export function porterStem(word: string): string {
  let w = word.toLowerCase();
  if (w.length < 3) return w;

  // Step 1a
  if (w.endsWith('sses')) w = w.slice(0, -2);
  else if (w.endsWith('ies')) w = w.slice(0, -2);
  else if (w.endsWith('ss')) w = w;
  else if (w.endsWith('s')) w = w.slice(0, -1);

  // Step 1b
  if (w.endsWith('eed')) {
    if (w.length > 4) w = w.slice(0, -1);
  } else if ((w.endsWith('ed') || w.endsWith('ing')) && /[aeiou]/.test(w.slice(0, -2))) {
    w = w.endsWith('ed') ? w.slice(0, -2) : w.slice(0, -3);
    if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) {
      w += 'e';
    } else if (w.length > 2 && w[w.length - 1] === w[w.length - 2] && !'lsz'.includes(w[w.length - 1])) {
      w = w.slice(0, -1);
    }
  }

  // Step 1c: y -> i
  if (w.endsWith('y') && w.length > 2 && !/[aeiou]/.test(w[w.length - 2])) {
    w = w.slice(0, -1) + 'i';
  }

  // Common suffix reductions
  if (w.endsWith('tional')) w = w.slice(0, -4) + 'e';
  else if (w.endsWith('ation')) w = w.slice(0, -3) + 'e';
  else if (w.endsWith('izer')) w = w.slice(0, -1);
  else if (w.endsWith('enci')) w = w.slice(0, -1) + 'e';
  else if (w.endsWith('able')) w = w;
  else if (w.endsWith('ment') && w.length > 6) w = w.slice(0, -4);

  return w;
}

/**
 * General text normalization pipeline:
 * 1. Lowercase conversion
 * 2. Unfold common contractions (can't -> cannot, won't -> will not, i'm -> i am)
 * 3. General domain phrase canonicalization (log in -> login, sign in -> login)
 * 4. Punctuation removal & whitespace normalization
 * 5. Tokenization, stopword filtering & stemming
 */
export function preprocessText(text: string): string[] {
  if (!text) return [];

  let clean = text.toLowerCase();

  // Contraction unfolding
  clean = clean
    .replace(/can't|cant/g, 'cannot')
    .replace(/won't/g, 'will not')
    .replace(/n't/g, ' not')
    .replace(/'re/g, ' are')
    .replace(/'s/g, ' is')
    .replace(/'d/g, ' would')
    .replace(/'ll/g, ' will')
    .replace(/'ve/g, ' have')
    .replace(/'m/g, ' am');

  // General phrase canonicalization
  clean = clean
    .replace(/\blog\s+in\b/g, 'login')
    .replace(/\bsign\s+in\b/g, 'login')
    .replace(/\bpersonal\s+data\b/g, 'personal data privacy')
    .replace(/\buser\s+data\b/g, 'user data privacy')
    .replace(/\bcustomer\s+support\b/g, 'support customer_support');

  // Strip punctuation
  clean = clean.replace(/[^a-z0-9_\s]/g, ' ');

  // Tokenize
  const rawTokens = clean.split(/\s+/).filter(t => t.length > 0);

  const processed: string[] = [];
  for (const token of rawTokens) {
    const canonical = CANONICAL_MAP[token] || token;
    if (!STOP_WORDS.has(canonical) && canonical.length > 1) {
      processed.push(porterStem(canonical));
    }
  }

  if (processed.length === 0 && rawTokens.length > 0) {
    return rawTokens.map(t => porterStem(CANONICAL_MAP[t] || t));
  }

  return processed;
}

/**
 * Extracts word n-grams (1-2) from processed token list
 */
function extractWordNgrams(tokens: string[]): string[] {
  const ngrams = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return ngrams;
}

/**
 * Extracts character n-grams (3-5) from normalized text
 */
function extractCharNgrams(text: string, minN: number = 3, maxN: number = 5): string[] {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const charGrams: string[] = [];
  const len = cleaned.length;
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i <= len - n; i++) {
      charGrams.push(`c#${cleaned.substring(i, i + n)}`);
    }
  }
  return charGrams;
}

export interface MatchResult {
  success: boolean;
  is_match: boolean;
  confidence: number;
  confidence_percentage: number;
  confidence_level: 'high' | 'medium' | 'low';
  answer: string;
  category: string | null;
  matched_question: string | null;
  faq_id?: number;
  keywords?: string[];
  query_preprocessed?: string;
  suggested_categories?: string[];
  sample_questions?: string[];
  tfidf_score?: number;
  keyword_score?: number;
  character_score?: number;
  alternatives?: Array<{
    id: number;
    question: string;
    category: string;
    score: number;
  }>;
  error?: string;
}

export class LocalNLPEngine {
  private faqs: FAQItem[] = [];
  private vocabulary: Map<string, number> = new Map();
  private idf: number[] = [];
  private tfidfVectors: number[][] = [];
  private faqQuestionVectors: number[][] = [];
  private faqKeywordSets: Set<string>[] = [];
  public categories: string[] = [];
  public highThreshold = 0.65;
  public minThreshold = 0.40;

  constructor(faqs: FAQItem[] = FAQS_DATA) {
    this.buildIndex(faqs);
  }

  /**
   * Builds the rich TF-IDF index using Word n-grams (1-2) + Char n-grams (3-5)
   * Precomputed once on startup.
   */
  public buildIndex(faqs: FAQItem[]) {
    this.faqs = faqs;
    const catSet = new Set<string>();
    faqs.forEach(f => catSet.add(f.category));
    this.categories = Array.from(catSet).sort();

    this.faqKeywordSets = [];

    const docGrams: string[][] = [];
    const questionGramsList: string[][] = [];
    const termDocFreq = new Map<string, number>();

    for (const faq of faqs) {
      // Build rich searchable representation: Question (weighted) + Keywords + Category
      const questionStr = faq.question;
      const keywordsStr = faq.keywords.join(' ');
      const categoryStr = faq.category;
      
      // Question tokens given priority in representation
      const combined = `${questionStr} ${questionStr} ${keywordsStr} ${categoryStr}`;

      // Preprocessed keyword tokens set
      const kwTokens = preprocessText(`${questionStr} ${keywordsStr} ${categoryStr}`);
      this.faqKeywordSets.push(new Set(kwTokens));

      // Extract word n-grams (1-2)
      const wordTokens = preprocessText(combined);
      const wordNgrams = extractWordNgrams(wordTokens);

      // Extract character n-grams (3-5)
      const charNgrams = extractCharNgrams(combined, 3, 5);

      const allGrams = [...wordNgrams, ...charNgrams];
      docGrams.push(allGrams);

      // Question specific grams
      const qWordTokens = preprocessText(questionStr);
      const qWordNgrams = extractWordNgrams(qWordTokens);
      const qCharNgrams = extractCharNgrams(questionStr, 3, 5);
      questionGramsList.push([...qWordNgrams, ...qCharNgrams]);

      const uniqueInDoc = new Set(allGrams);
      uniqueInDoc.forEach(term => {
        termDocFreq.set(term, (termDocFreq.get(term) || 0) + 1);
      });
    }

    // Vocabulary mapping
    this.vocabulary.clear();
    let termIdx = 0;
    termDocFreq.forEach((_df, term) => {
      this.vocabulary.set(term, termIdx++);
    });

    const vocabSize = this.vocabulary.size;
    const numDocs = faqs.length;

    // Smoothed Inverse Document Frequency
    this.idf = new Array(vocabSize).fill(0);
    termDocFreq.forEach((df, term) => {
      const idx = this.vocabulary.get(term)!;
      this.idf[idx] = Math.log((1 + numDocs) / (1 + df)) + 1.0;
    });

    // Compute normalized TF-IDF matrix for full combined document
    this.tfidfVectors = docGrams.map(grams => this.vectorizeGrams(grams));

    // Compute normalized TF-IDF matrix for question target
    this.faqQuestionVectors = questionGramsList.map(grams => this.vectorizeGrams(grams));
  }

  /**
   * Vectorize n-grams list into L2-normalized vector
   */
  private vectorizeGrams(grams: string[]): number[] {
    const vocabSize = this.vocabulary.size;
    const vec = new Array(vocabSize).fill(0);
    const termCounts = new Map<string, number>();
    grams.forEach(g => termCounts.set(g, (termCounts.get(g) || 0) + 1));

    let normSq = 0;
    termCounts.forEach((count, term) => {
      const idx = this.vocabulary.get(term);
      if (idx !== undefined) {
        const tf = 1 + Math.log(count);
        const tfidf = tf * this.idf[idx];
        vec[idx] = tfidf;
        normSq += tfidf * tfidf;
      }
    });

    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let i = 0; i < vocabSize; i++) {
        vec[i] /= norm;
      }
    }
    return vec;
  }

  /**
   * Cosine similarity between normalized vectors
   */
  private cosineSimilarity(v1: number[], v2: number[]): number {
    let dot = 0;
    for (let i = 0; i < v1.length; i++) {
      if (v1[i] !== 0 && v2[i] !== 0) {
        dot += v1[i] * v2[i];
      }
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Keyword Overlap Score: Proportion of query tokens present in the FAQ representation
   */
  private computeKeywordOverlap(queryTokens: string[], faqIdx: number): number {
    if (queryTokens.length === 0) return 0;
    const kwSet = this.faqKeywordSets[faqIdx];
    let matches = 0;
    for (const t of queryTokens) {
      if (kwSet.has(t)) {
        matches++;
      }
    }
    return matches / queryTokens.length;
  }

  /**
   * Character Similarity Score (Sørensen-Dice over character bigrams)
   */
  private computeCharSimilarity(query: string, targetText: string): number {
    const qClean = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tClean = targetText.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (qClean.length < 2 || tClean.length < 2) return 0;

    const qBigrams = new Map<string, number>();
    for (let i = 0; i < qClean.length - 1; i++) {
      const bg = qClean.substring(i, i + 2);
      qBigrams.set(bg, (qBigrams.get(bg) || 0) + 1);
    }

    let intersection = 0;
    for (let i = 0; i < tClean.length - 1; i++) {
      const bg = tClean.substring(i, i + 2);
      const count = qBigrams.get(bg) || 0;
      if (count > 0) {
        intersection++;
        qBigrams.set(bg, count - 1);
      }
    }

    const total = (qClean.length - 1) + (tClean.length - 1);
    return (2.0 * intersection) / total;
  }

  /**
   * Multi-Signal Matching:
   * final_score = 0.60 * tfidf_score + 0.25 * keyword_score + 0.15 * character_score
   */
  public findBestMatch(query: string, categoryFilter: string = 'All'): MatchResult {
    const cleaned = query.trim();
    if (!cleaned) {
      return {
        success: false,
        is_match: false,
        confidence: 0,
        confidence_percentage: 0,
        confidence_level: 'low',
        answer: 'Please enter a question to get started.',
        category: null,
        matched_question: null,
        error: 'Empty message'
      };
    }

    if (cleaned.length < 3) {
      return {
        success: false,
        is_match: false,
        confidence: 0,
        confidence_percentage: 0,
        confidence_level: 'low',
        answer: 'Question is too short. Please provide more context.',
        category: null,
        matched_question: null,
        error: 'Short query'
      };
    }

    const tokens = preprocessText(cleaned);
    const wordNgrams = extractWordNgrams(tokens);
    const charNgrams = extractCharNgrams(cleaned, 3, 5);
    const queryGrams = [...wordNgrams, ...charNgrams];

    if (tokens.length === 0) {
      return {
        success: true,
        is_match: false,
        confidence: 0,
        confidence_percentage: 0,
        confidence_level: 'low',
        answer: "I couldn't find a reliable answer for that question. Try rephrasing with specific keywords.",
        category: null,
        matched_question: null,
        suggested_categories: this.categories.slice(0, 5),
        sample_questions: [
          'How can I reset my password?',
          'Where can I see my payment details?',
          'How do I cancel my subscription?'
        ]
      };
    }

    const queryVec = this.vectorizeGrams(queryGrams);

    let bestScore = -1;
    let bestIdx = -1;
    let bestTfidf = 0;
    let bestKw = 0;
    let bestChar = 0;

    const scores: Array<{
      idx: number;
      finalScore: number;
      tfidfScore: number;
      kwScore: number;
      charScore: number;
    }> = [];

    for (let i = 0; i < this.faqs.length; i++) {
      const faq = this.faqs[i];
      if (categoryFilter !== 'All' && faq.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        continue;
      }

      // Signal 1: TF-IDF Cosine Similarity (max between rich document vector & direct question vector)
      const docTfidf = this.cosineSimilarity(queryVec, this.tfidfVectors[i]);
      const qTfidf = this.cosineSimilarity(queryVec, this.faqQuestionVectors[i]);
      const tfidfScore = Math.max(docTfidf, qTfidf * 1.05);

      // Signal 2: Keyword Overlap Score
      const kwScore = this.computeKeywordOverlap(tokens, i);

      // Signal 3: Character Sequence Similarity against question
      const qCharScore = this.computeCharSimilarity(cleaned, faq.question);
      const docCharScore = this.computeCharSimilarity(cleaned, `${faq.question} ${faq.keywords.join(' ')}`);
      const charScore = Math.max(qCharScore, docCharScore * 0.9);

      // Multi-Signal Formula
      const finalScore = 0.60 * tfidfScore + 0.25 * kwScore + 0.15 * charScore;

      scores.push({
        idx: i,
        finalScore,
        tfidfScore,
        kwScore,
        charScore
      });

      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestIdx = i;
        bestTfidf = tfidfScore;
        bestKw = kwScore;
        bestChar = charScore;
      }
    }

    scores.sort((a, b) => b.finalScore - a.finalScore);
    const alternatives = scores
      .filter(s => s.idx !== bestIdx && s.finalScore > 0.25)
      .slice(0, 3)
      .map(s => ({
        id: this.faqs[s.idx].id,
        question: this.faqs[s.idx].question,
        category: this.faqs[s.idx].category,
        score: Math.round(s.finalScore * 100) / 100
      }));

    // Confidence percentage representation (capped cleanly between 0% and 100%)
    const normalizedScore = Math.min(1.0, Math.max(0.0, bestScore));
    const confidencePct = Math.round(normalizedScore * 1000) / 10;

    let confidenceLevel: 'high' | 'medium' | 'low';
    let isMatch = false;
    let answer = '';

    if (normalizedScore >= this.highThreshold) {
      confidenceLevel = 'high';
      isMatch = true;
      answer = this.faqs[bestIdx].answer;
    } else if (normalizedScore >= this.minThreshold) {
      confidenceLevel = 'medium';
      isMatch = true;
      answer = this.faqs[bestIdx].answer;
    } else {
      confidenceLevel = 'low';
      isMatch = false;
      answer = "I couldn't find a reliable answer for that question.";
    }

    const matchedFaq = isMatch && bestIdx >= 0 ? this.faqs[bestIdx] : null;

    return {
      success: true,
      is_match: isMatch,
      confidence: Math.round(normalizedScore * 1000) / 1000,
      confidence_percentage: Math.max(0, confidencePct),
      confidence_level: confidenceLevel,
      answer,
      category: matchedFaq ? matchedFaq.category : null,
      matched_question: matchedFaq ? matchedFaq.question : null,
      faq_id: matchedFaq?.id,
      keywords: matchedFaq?.keywords,
      query_preprocessed: tokens.join(' '),
      tfidf_score: Math.round(bestTfidf * 1000) / 1000,
      keyword_score: Math.round(bestKw * 1000) / 1000,
      character_score: Math.round(bestChar * 1000) / 1000,
      alternatives,
      suggested_categories: !isMatch ? this.categories.slice(0, 5) : undefined,
      sample_questions: !isMatch
        ? [
            'How do I reset my password?',
            'Where can I see my payment details?',
            'How do I cancel my subscription?',
            'How do I contact support?',
            'What happens to my data?'
          ]
        : undefined
    };
  }

  public getAllFaqs(): FAQItem[] {
    return this.faqs;
  }
}

// Export singleton instance for instant use
export const defaultNlpEngine = new LocalNLPEngine(FAQS_DATA);
