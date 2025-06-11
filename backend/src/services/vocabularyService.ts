import { Word, VocabularyCategory } from '../types/vocabulary';
import vocabularyData from '../data/vocabulary.json';

class VocabularyService {
  private vocabulary: VocabularyCategory[];

  constructor() {
    // Transform the data to match our types
    this.vocabulary = vocabularyData.words.map((category: any) => ({
      id: category.category.toLowerCase().replace(/\s+/g, '-'),
      name: category.category,
      words: category.items.map((item: any) => ({
        word: item.word,
        translation: item.meaning,
        pronunciation: item.pronunciation,
        definition: item.definition,
        examples: item.examples,
        category: category.category,
        difficulty: item.difficulty || 'medium',
        hint: item.hint
      }))
    }));
  }

  getAllWords(): Word[] {
    return this.vocabulary.reduce((acc: Word[], category) => {
      return [...acc, ...category.words];
    }, []);
  }

  getWordsByCategory(categoryName: string): Word[] {
    const category = this.vocabulary.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category ? category.words : [];
  }

  getWordsByDifficulty(level: 'easy' | 'medium' | 'hard'): Word[] {
    return this.getAllWords().filter(word => word.difficulty === level);
  }

  getCategories(): string[] {
    return this.vocabulary.map(cat => cat.name);
  }

  getWord(word: string): Word | null {
    const allWords = this.getAllWords();
    return allWords.find(w => w.word.toLowerCase() === word.toLowerCase()) || null;
  }
}

export const vocabularyService = new VocabularyService(); 