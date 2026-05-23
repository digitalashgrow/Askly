// Custom lightweight profanity filter
// Keeps the application light and ESM-compliant

const BAD_WORDS = [
  'abuse', 'ass', 'asshole', 'bastard', 'bitch', 'bullshit',
  'crap', 'cunt', 'dick', 'fag', 'fuck', 'fucking', 'motherfucker',
  'nigger', 'piss', 'prick', 'pussy', 'retard', 'shit', 'slut',
  'whore', 'bastards', 'bitches', 'cocksucker', 'faggot', 'fucks'
];

/**
 * Checks if a string contains any profanity words
 */
export function hasProfanity(text: string): boolean {
  if (!text) return false;
  const words = text.toLowerCase().split(/\s+/);
  return words.some(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    return BAD_WORDS.includes(cleanWord);
  });
}

/**
 * Replaces profanity words in a text with asterisks
 */
export function cleanProfanity(text: string): string {
  if (!text) return '';
  let cleanedText = text;
  
  BAD_WORDS.forEach(badWord => {
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    cleanedText = cleanedText.replace(regex, '***');
  });

  return cleanedText;
}
