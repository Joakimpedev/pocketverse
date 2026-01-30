import BSBData from '../../assets/BSB.json';

// Type definitions for Bible data structure
interface Verse {
  verse: number;
  text: string;
}

interface Chapter {
  chapter: number;
  verses: Verse[];
}

interface Book {
  name: string;
  chapters: Chapter[];
}

interface BibleData {
  translation: string;
  books: Book[];
}

// Cache the parsed data
let bibleData: BibleData | null = null;

/**
 * Get the Bible data, loading and caching it on first access
 */
export const getBibleData = (): BibleData => {
  if (!bibleData) {
    bibleData = BSBData as BibleData;
  }
  return bibleData;
};

/**
 * Normalize book name to handle variations (e.g., "Psalm" -> "Psalms")
 */
const normalizeBookName = (bookName: string): string => {
  const normalized = bookName.trim();
  
  // Handle common variations
  const variations: Record<string, string> = {
    'Psalm': 'Psalms',
    'Song of Solomon': 'Song of Songs',
    'Song of Songs': 'Song of Songs',
  };
  
  return variations[normalized] || normalized;
};

/**
 * Parse a Bible reference string (e.g., "Psalm 23:4" or "Genesis 1:1")
 * Returns { bookName, chapter, verse } or null if parsing fails
 */
export const parseReference = (reference: string): { bookName: string; chapter: number; verse: number } | null => {
  try {
    // Remove common prefixes/suffixes and clean up
    const cleaned = reference.trim()
      .replace(/^[^\w]*/, '') // Remove leading non-word chars
      .replace(/[^\w\s:]/g, ''); // Remove special chars except colons
    
    // Pattern: BookName Chapter:Verse
    // Examples: "Psalm 23:4", "Genesis 1:1", "1 John 2:3"
    const match = cleaned.match(/^(.+?)\s+(\d+):(\d+)$/);
    
    if (!match) {
      return null;
    }
    
    const bookName = normalizeBookName(match[1].trim());
    const chapter = parseInt(match[2], 10);
    const verse = parseInt(match[3], 10);
    
    if (isNaN(chapter) || isNaN(verse) || chapter < 1 || verse < 1) {
      return null;
    }
    
    return { bookName, chapter, verse };
  } catch (error) {
    console.error('Error parsing reference:', error);
    return null;
  }
};

/**
 * Find a book by name (case-insensitive, handles variations)
 */
export const findBook = (bookName: string): Book | null => {
  const data = getBibleData();
  const normalized = normalizeBookName(bookName);
  
  return data.books.find(
    book => book.name.toLowerCase() === normalized.toLowerCase()
  ) || null;
};

/**
 * Get a specific verse by reference
 */
export const getVerse = (
  bookName: string,
  chapter: number,
  verse: number
): Verse | null => {
  const book = findBook(bookName);
  if (!book) return null;
  
  const chapterData = book.chapters.find(ch => ch.chapter === chapter);
  if (!chapterData) return null;
  
  return chapterData.verses.find(v => v.verse === verse) || null;
};

/**
 * Get all verses in a chapter
 */
export const getChapter = (
  bookName: string,
  chapter: number
): Chapter | null => {
  const book = findBook(bookName);
  if (!book) return null;
  
  return book.chapters.find(ch => ch.chapter === chapter) || null;
};

/**
 * Get all books in the Bible
 */
export const getAllBooks = (): Book[] => {
  return getBibleData().books;
};

/**
 * Get the total number of chapters in a book
 */
export const getBookChapterCount = (bookName: string): number => {
  const book = findBook(bookName);
  return book ? book.chapters.length : 0;
};

/**
 * Check if a chapter exists in a book
 */
export const hasChapter = (bookName: string, chapter: number): boolean => {
  const book = findBook(bookName);
  if (!book) return false;
  
  return book.chapters.some(ch => ch.chapter === chapter);
};

/**
 * Get the previous chapter reference, or null if at first chapter
 */
export const getPreviousChapter = (
  bookName: string,
  chapter: number
): { bookName: string; chapter: number } | null => {
  const book = findBook(bookName);
  if (!book) return null;
  
  if (chapter > 1) {
    return { bookName, chapter: chapter - 1 };
  }
  
  // Find previous book
  const bookIndex = getBibleData().books.findIndex(
    b => b.name.toLowerCase() === bookName.toLowerCase()
  );
  
  if (bookIndex > 0) {
    const prevBook = getBibleData().books[bookIndex - 1];
    const lastChapter = prevBook.chapters[prevBook.chapters.length - 1].chapter;
    return { bookName: prevBook.name, chapter: lastChapter };
  }
  
  return null;
};

/**
 * Get the next chapter reference, or null if at last chapter
 */
export const getNextChapter = (
  bookName: string,
  chapter: number
): { bookName: string; chapter: number } | null => {
  const book = findBook(bookName);
  if (!book) return null;
  
  const maxChapter = book.chapters[book.chapters.length - 1].chapter;
  
  if (chapter < maxChapter) {
    return { bookName, chapter: chapter + 1 };
  }
  
  // Find next book
  const bookIndex = getBibleData().books.findIndex(
    b => b.name.toLowerCase() === bookName.toLowerCase()
  );
  
  if (bookIndex < getBibleData().books.length - 1) {
    const nextBook = getBibleData().books[bookIndex + 1];
    return { bookName: nextBook.name, chapter: 1 };
  }
  
  return null;
};



