import { KnowledgeEntry } from '../types/knowledge';
import { EmbeddingService } from '../services/EmbeddingService';

export class SemanticDatabaseSearcher {
  private knowledgeBase: KnowledgeEntry[];
  private embeddingService: EmbeddingService;

  constructor(knowledgeBase: KnowledgeEntry[], embeddingService: EmbeddingService) {
    this.knowledgeBase = knowledgeBase;
    this.embeddingService = embeddingService;
  }

  async searchDatabase(keywords: string[], category: string, intent: string, originalQuery: string): Promise<KnowledgeEntry[]> {
    console.log('🔍 Semantic Database Search - Query:', originalQuery);
    console.log('🔍 Category:', category, 'Intent:', intent);

    try {
      // Check for greeting patterns first (these don't need semantic search)
      if (this.isGreetingQuery(keywords, intent)) {
        return this.findGreetingEntries();
      }

      // Check for salary/scheduling patterns
      if (this.isSalaryOrSchedulingQuery(keywords, intent)) {
        return this.findSalaryOrSchedulingEntries(keywords);
      }

      // Check if this is a projects/achievements query
      const isProjectsQuery = this.isProjectsOrAchievementsQuery(originalQuery);
      
      // Perform semantic search
      const semanticResults = await this.embeddingService.semanticSearch(
        originalQuery,
        isProjectsQuery ? 20 : 15, // Get more results for projects queries
        isProjectsQuery ? 0.5 : 0.6  // Lower threshold for projects queries
      );

      console.log('📊 Semantic search found', semanticResults.knowledgeIds.length, 'matches');

      // Convert knowledge IDs back to KnowledgeEntry objects
      const semanticEntries = semanticResults.knowledgeIds
        .map(id => this.knowledgeBase.find(entry => entry.id === id))
        .filter((entry): entry is KnowledgeEntry => entry !== undefined);

      // If semantic search found results, enhance with traditional scoring
      if (semanticEntries.length > 0) {
        const enhancedResults = this.enhanceSemanticResults(
          semanticEntries,
          semanticResults.similarities,
          this.extractKeywordsFromQuery(originalQuery),
          category,
          intent,
          isProjectsQuery
        );

        console.log('✅ Enhanced semantic results:', enhancedResults.length, 'entries');
        return enhancedResults;
      }

      // Fallback to traditional keyword search if semantic search fails
      console.log('⚠️ Semantic search found no results, falling back to keyword search');
      return this.fallbackKeywordSearch(this.extractKeywordsFromQuery(originalQuery), category, intent, isProjectsQuery);

    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      // Fallback to traditional search
      return this.fallbackKeywordSearch(this.extractKeywordsFromQuery(originalQuery), category, intent, false);
    }
  }

  private extractKeywordsFromQuery(query: string): string[] {
    const stopWords = ['what', 'how', 'when', 'where', 'why', 'who', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'tell', 'me', 'can', 'you', 'did', 'do', 'does', 'have', 'has', 'had', 'all'];
    
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  }

  private isProjectsOrAchievementsQuery(query: string): boolean {
    const queryLower = query.toLowerCase();
    
    const projectIndicators = [
      'projects', 'project', 'achievements', 'accomplishments', 'built', 'worked on',
      'developed', 'created', 'portfolio', 'work', 'experience', 'done',
      'ai', 'automation', 'chatbot', 'recommendation', 'system'
    ];
    
    return projectIndicators.some(indicator => queryLower.includes(indicator));
  }
  private enhanceSemanticResults(
    semanticEntries: KnowledgeEntry[],
    similarities: number[],
    keywords: string[],
    category: string,
    intent: string,
    isProjectsQuery: boolean = false
  ): KnowledgeEntry[] {
    // Score each entry combining semantic similarity with traditional factors
    const scoredResults = semanticEntries.map((entry, index) => {
      let score = similarities[index] * 100; // Base semantic similarity score (0-100)

      // Category match bonus
      if (entry.category === category) {
        score += 15;
      }
      
      // Special bonuses for projects queries
      if (isProjectsQuery) {
        if (entry.category === 'projects_&_impact' || entry.category === 'side_projects' || entry.category === 'mvp') {
          score += 20;
        }
        if (entry.keywords.some(k => ['AI', 'Automation', 'Chatbot', 'Project', 'Built', 'Developed'].includes(k))) {
          score += 15;
        }
      }

      // Keyword match bonuses
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // Question match
        if (entry.question.toLowerCase().includes(keywordLower)) {
          score += 10;
        }

        // Keywords array match
        if (entry.keywords.some(k => k.toLowerCase().includes(keywordLower))) {
          score += 8;
        }

        // Organization match
        if (entry.organization && entry.organization.toLowerCase().includes(keywordLower)) {
          score += 6;
        }

        // Relevance match
        if (entry.relevance && entry.relevance.toLowerCase().includes(keywordLower)) {
          score += 8;
        }
      });

      // Intent-based bonuses
      const intentLower = intent.toLowerCase();
      if (intentLower.includes('experience') && entry.category === 'experience') {
        score += 10;
      }
      if (intentLower.includes('project') && 
          (entry.category === 'projects_&_impact' || entry.category === 'side_projects' || entry.category === 'mvp')) {
        score += 15;
      }
      if (intentLower.includes('skill') && entry.category === 'skills') {
        score += 10;
      }
      if (intentLower.includes('ai') && this.isProjectOrAIEntry(entry)) {
        score += 20;
      }

      // Time period relevance (if specified in query)
      if (entry.timePeriod && keywords.some(k => entry.timePeriod?.toLowerCase().includes(k.toLowerCase()))) {
        score += 5;
      }

      return { entry, score, similarity: similarities[index] };
    });

    // Sort by combined score and return top results
    const maxResults = isProjectsQuery ? 15 : 12;
    return scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(result => result.entry);
  }

  private fallbackKeywordSearch(keywords: string[], category: string, intent: string, isProjectsQuery: boolean = false): KnowledgeEntry[] {
    console.log('🔄 Performing fallback keyword search');
    
    const scoredResults = this.knowledgeBase.map(entry => {
      let score = 0;
      const questionLower = entry.question.toLowerCase();
      const answerLower = entry.answer.toLowerCase();
      const keywordsLower = entry.keywords.map(k => k.toLowerCase());
      const relevanceLower = entry.relevance?.toLowerCase() || '';

      // Special handling for projects queries
      if (isProjectsQuery) {
        if (entry.category === 'projects_&_impact' || entry.category === 'side_projects' || entry.category === 'mvp') {
          score += 15;
        }
        if (entry.keywords.some(k => ['AI', 'Automation', 'Chatbot', 'Project', 'Built', 'Developed'].includes(k))) {
          score += 10;
        }
      }

      // Keyword matching
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        if (questionLower.includes(keywordLower)) score += 15;
        if (keywordsLower.some(k => k.includes(keywordLower))) score += 12;
        if (relevanceLower.includes(keywordLower)) score += 10;
        if (entry.organization && entry.organization.toLowerCase().includes(keywordLower)) score += 8;
        if (keywordLower.length > 4 && answerLower.includes(keywordLower)) score += 3;
      });

      // Category match
      if (entry.category === category) score += 8;

      // Intent matching
      const intentLower = intent.toLowerCase();
      if (intentLower.includes('experience') && entry.category === 'experience') score += 6;
      if (intentLower.includes('project') && this.isProjectOrAIEntry(entry)) score += 10;
      if (intentLower.includes('ai') && this.isProjectOrAIEntry(entry)) score += 15;

      return { entry, score };
    });

    const minScore = isProjectsQuery ? 3 : 6;
    const maxResults = isProjectsQuery ? 10 : 8;
    
    return scoredResults
      .filter(result => result.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(result => result.entry);
  }

  private isProjectOrAIEntry(entry: KnowledgeEntry): boolean {
    return entry.category === 'projects_&_impact' || 
           entry.category === 'side_projects' || 
           entry.category === 'mvp' ||
           entry.keywords.some(k => ['AI', 'Automation', 'Chatbot', 'Recommendation', 'Project'].includes(k));
  }

  private isGreetingQuery(keywords: string[], intent: string): boolean {
    const greetingKeywords = ['hi', 'hello', 'hey', 'good', 'morning', 'afternoon', 'evening', 'night'];
    const intentLower = intent.toLowerCase();
    
    // Only return true for pure greetings, not questions about work
    const hasWorkContext = keywords.some(k => 
      ['role', 'experience', 'work', 'job', 'paytm', 'talentgum', 'project', 'skill'].includes(k.toLowerCase())
    );
    
    if (hasWorkContext) return false;
    
    return greetingKeywords.some(greeting => 
      keywords.some(keyword => keyword.toLowerCase() === greeting)
    ) || intentLower.includes('greeting');
  }

  private isSalaryOrSchedulingQuery(keywords: string[], intent: string): boolean {
    const salaryKeywords = ['salary', 'compensation', 'package', 'ctc', 'pay', 'money', 'lpa', 'lakhs'];
    const schedulingKeywords = ['interview', 'schedule', 'meeting', 'availability', 'call', 'time', 'appointment'];
    
    // Only return true if it's PRIMARILY about salary/scheduling, not work experience
    const hasWorkContext = keywords.some(k => 
      ['role', 'experience', 'work', 'job', 'paytm', 'talentgum', 'project', 'skill', 'position'].includes(k.toLowerCase())
    );
    
    if (hasWorkContext) return false;
    
    const intentLower = intent.toLowerCase();
    
    return salaryKeywords.some(keyword => 
      keywords.some(k => k.toLowerCase().includes(keyword)) ||
      intentLower.includes(keyword)
    ) || schedulingKeywords.some(keyword => 
      keywords.some(k => k.toLowerCase().includes(keyword)) ||
      intentLower.includes(keyword)
    );
  }

  private findGreetingEntries(): KnowledgeEntry[] {
    return this.knowledgeBase.filter(entry => 
      entry.keywords.some(keyword => 
        ['Hi', 'Hello', 'Hey', 'Good morning', 'Good afternoon', 'Good evening', 'Greeting'].includes(keyword)
      )
    );
  }

  private findSalaryOrSchedulingEntries(keywords: string[]): KnowledgeEntry[] {
    const salaryKeywords = ['salary', 'compensation', 'package', 'ctc'];
    const schedulingKeywords = ['interview', 'schedule', 'meeting', 'call'];
    
    const isSalaryQuery = keywords.some(k => 
      salaryKeywords.some(sk => k.toLowerCase().includes(sk))
    );
    
    const isSchedulingQuery = keywords.some(k => 
      schedulingKeywords.some(sk => k.toLowerCase().includes(sk))
    );
    
    return this.knowledgeBase.filter(entry => {
      if (isSalaryQuery) {
        return entry.keywords.some(keyword => 
          ['Salary', 'Compensation', 'Package', 'CTC'].includes(keyword)
        );
      }
      if (isSchedulingQuery) {
        return entry.keywords.some(keyword => 
          ['Interview', 'Schedule', 'Meeting', 'Call', 'Appointment'].includes(keyword)
        );
      }
      return entry.keywords.some(keyword => 
        ['Contact', 'Connect', 'Reach out'].includes(keyword)
      );
    });
  }

  getAllRelevantEntries(keywords: string[]): KnowledgeEntry[] {
    return this.knowledgeBase.filter(entry => {
      return keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return keywordLower.length > 3 && (
          entry.question.toLowerCase().includes(keywordLower) ||
          entry.keywords.some(k => k.toLowerCase().includes(keywordLower)) ||
          (entry.relevance && entry.relevance.toLowerCase().includes(keywordLower)) ||
          (entry.organization && entry.organization.toLowerCase().includes(keywordLower))
        );
      });
    });
  }
}