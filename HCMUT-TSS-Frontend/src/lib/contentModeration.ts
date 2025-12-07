/**
 * Content Moderation - Detect and filter inappropriate content
 */

// List of inappropriate words/patterns (Vietnamese and English)
const INAPPROPRIATE_WORDS = [
  // Profanity
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap',
  'dick', 'pussy', 'cock', 'motherfucker',
  // Vietnamese profanity - common vulgar words
  'địt', 'đụ', 'cặc', 'lồn', 'buồi', 'đéo', 'vãi', 'cứt', 'chết tiệt',
  'đồ chó', 'con chó', 'thằng chó', 'mẹ mày', 'bố mày', 'cụ mày',
  'đồ ngu', 'ngu ngốc', 'ngu dốt', 'chó đẻ', 'súc vật', 'đồ súc sinh',
  'đồ khốn', 'khốn nạn', 'đồ khốn kiếp', 'đồ chết tiệt', 'đồ đểu',
  'đồ bẩn', 'đồ dơ', 'đồ bợn', 'đồ cặn bã', 'đồ phản bội',
  'chết mẹ', 'chết cha', 'chết cụ', 'đéo biết', 'vãi chưởng', 'vãi cả lol',
  'dm', 'dcm', 'dmm', 'đcm', 'đmmm', 'vcl', 'vl', 'cc', 'clgt', 'lmao',
  // Variations with numbers/special chars (l33t speak)
  'f*ck', 'sh*t', 'f@ck', 'sh1t', '4ss', 'd!t', 'c@c',
];

// Spam patterns
const SPAM_PATTERNS = [
  /https?:\/\/.{5,}/gi, // URLs (allow some educational links via moderation)
  /(\w)\1{4,}/gi, // Repeated characters (hellooooooo)
  /[A-Z]{6,}/g, // All caps words (HELLOOOO)
];

// Duplicate content (same message repeated)
const DUPLICATE_THRESHOLD = 0.85; // 85% similarity = duplicate

/**
 * Check if content contains inappropriate words
 */
export const containsInappropriateContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  
  // Check for profanity/inappropriate words
  for (const word of INAPPROPRIATE_WORDS) {
    // Use simple includes for Vietnamese words with diacritics
    // Word boundary \b doesn't work well with Vietnamese characters
    if (lowerText.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if content looks like spam
 */
export const isSpam = (text: string): boolean => {
  // Check for excessive URLs
  const urlMatches = text.match(/https?:\/\//g) || [];
  if (urlMatches.length > 3) return true;
  
  // Check for repeated characters
  if (SPAM_PATTERNS[1].test(text)) return true;
  
  // Check for excessive caps
  const capsMatches = text.match(/[A-Z]{6,}/g) || [];
  if (capsMatches.length > 2) return true;
  
  // Check for excessive special characters
  const specialChars = (text.match(/[!@#$%^&*()_+=\[\]{};:'",.<>?\/\\|`~-]/g) || []).length;
  if (specialChars > text.length * 0.3) return true;
  
  // Check for random gibberish (consonant clusters without vowels)
  // Vietnamese/English have vowels, random spam like "fmnjdanfujeh" doesn't
  const words = text.toLowerCase().split(/\s+/);
  let gibberishCount = 0;
  
  for (const word of words) {
    if (word.length < 5) continue; // Skip short words
    
    // Check for single character repeated excessively (aaaaaaa, 1111111)
    if (/(.)\1{6,}/.test(word)) {
      gibberishCount++;
      continue;
    }
    
    // Check if word has very few vowels (including Vietnamese vowels)
    const vowels = word.match(/[aeiouàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/g) || [];
    const vowelRatio = vowels.length / word.length;
    
    // If word has less than 20% vowels, likely gibberish
    if (vowelRatio < 0.2) {
      gibberishCount++;
    }
    
    // Check for excessive consonant clusters (4+ consonants in a row)
    if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(word)) {
      gibberishCount++;
    }
  }
  
  // If more than 30% of words are gibberish, it's spam
  if (words.length > 0 && gibberishCount / words.length > 0.3) return true;
  
  return false;
};


export const isTooShort = (text: string, minLength: number = 10): boolean => {
  return text.trim().length < minLength;
};

// Check if content is too long (unlikely human-written)

export const isTooLong = (text: string, maxLength: number = 5000): boolean => {
  return text.length > maxLength;
};

/**
 Calculate similarity between two strings (0-1)
 Simple algorithm: matching words / total unique words
 */
const calculateSimilarity = (text1: string, text2: string): number => {
  const normalize = (text: string) => 
    text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const words1 = new Set(normalize(text1));
  const words2 = new Set(normalize(text2));
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.has(word)) matches++;
  });
  
  const totalUnique = new Set([...words1, ...words2]).size;
  return totalUnique > 0 ? matches / totalUnique : 0;
};

// Check if content is duplicate/very similar to previous content

export const isDuplicate = (newContent: string, previousContents: string[]): boolean => {
  if (previousContents.length === 0) return false;
  
  for (const prevContent of previousContents) {
    const similarity = calculateSimilarity(newContent, prevContent);
    if (similarity >= DUPLICATE_THRESHOLD) {
      return true;
    }
  }
  
  return false;
};

/**
 * Sanitize content - replace inappropriate words with asterisks
 */
export const sanitizeContent = (text: string): string => {
  let sanitized = text;
  
  for (const word of INAPPROPRIATE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const replacement = '*'.repeat(word.length);
    sanitized = sanitized.replace(regex, replacement);
  }
  
  return sanitized;
};

/**
 * Validate content comprehensively
 * Returns { isValid: boolean, errors: string[] }
 */
export const validateContent = (
  text: string, 
  options?: {
    minLength?: number;
    maxLength?: number;
    allowUrls?: boolean;
    previousContents?: string[];
  }
) => {
  const errors: string[] = [];
  const minLength = options?.minLength ?? 10;
  const maxLength = options?.maxLength ?? 5000;
  
  // Check length
  if (isTooShort(text, minLength)) {
    errors.push(`Content must be at least ${minLength} characters long`);
  }
  if (isTooLong(text, maxLength)) {
    errors.push(`Content must not exceed ${maxLength} characters`);
  }
  
  // Check for inappropriate content
  if (containsInappropriateContent(text)) {
    errors.push('Content contains inappropriate language');
  }
  
  // Check for spam
  if (isSpam(text)) {
    errors.push('Content appears to be spam');
  }
  
  // Check for duplicates
  if (options?.previousContents && isDuplicate(text, options.previousContents)) {
    errors.push('Content is too similar to previous posts');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
