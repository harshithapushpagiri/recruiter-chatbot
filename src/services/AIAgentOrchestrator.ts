import { SemanticDatabaseSearcher } from '../agents/SemanticDatabaseSearcher';
import { RelevanceFilter } from '../agents/RelevanceFilter';
import { ResponseGenerator } from '../agents/ResponseGenerator';
import { EmbeddingService } from './EmbeddingService';
import { databaseService } from './DatabaseService';
import { knowledgeBase } from '../data/knowledgeBase';
import { AgentProcessingData, ChatMessage } from '../types/chat';

export class AIAgentOrchestrator {
  private semanticDatabaseSearcher: SemanticDatabaseSearcher;
  private relevanceFilter: RelevanceFilter;
  private responseGenerator: ResponseGenerator;
  private embeddingService: EmbeddingService;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(openaiApiKey: string) {
    this.relevanceFilter = new RelevanceFilter(openaiApiKey);
    this.responseGenerator = new ResponseGenerator(openaiApiKey);
    this.embeddingService = new EmbeddingService(openaiApiKey);
    this.semanticDatabaseSearcher = new SemanticDatabaseSearcher(knowledgeBase, this.embeddingService);
    
    // Initialize embeddings asynchronously
    this.initializationPromise = this.initializeEmbeddings();
  }

  private async initializeEmbeddings(): Promise<void> {
    try {
      console.log('🚀 Initializing AI Agent Orchestrator with semantic search...');
      console.log(`📊 Knowledge base contains ${knowledgeBase.length} entries`);
      
      // Force generation of embeddings for all entries
      await this.embeddingService.initializeEmbeddings(knowledgeBase);
      
      this.isInitialized = true;
      console.log('✅ AI Agent Orchestrator initialized with semantic search capabilities');
      
      // Log final status
      const embeddingCount = await this.getEmbeddingCount();
      console.log(`📊 Semantic search ready with ${embeddingCount} embeddings`);
      
    } catch (error) {
      console.error('❌ Failed to initialize embeddings:', error);
      console.log('⚠️ Continuing with traditional keyword search as fallback');
      this.isInitialized = false;
    }
  }

  private async getEmbeddingCount(): Promise<number> {
    try {
      if (this.embeddingService.isConfigured()) {
        // Get count from Supabase
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const { count, error } = await supabase
            .from('knowledge_embeddings')
            .select('*', { count: 'exact', head: true });
          
          if (!error) return count || 0;
        }
      }
      
      // Fallback to local storage count
      const localData = localStorage.getItem('knowledge_embeddings');
      return localData ? JSON.parse(localData).length : 0;
    } catch (error) {
      console.error('Error getting embedding count:', error);
      return 0;
    }
  }

  async processQuestion(question: string, sessionId: string): Promise<{
    answer: string;
    relatedQuestions: string[];
    processingData: AgentProcessingData;
  }> {
    const startTime = Date.now();
    
    // Wait for initialization to complete if still in progress
    if (this.initializationPromise) {
      await this.initializationPromise;
      this.initializationPromise = null;
    }
    
    try {
      console.log('🚀 Starting AI Agent Processing for:', question);
      console.log('🔧 Semantic search enabled:', this.isInitialized);

      // Step 1: Get conversation history for context
      console.log('📚 Step 1: Getting conversation history...');
      const conversationHistory = await this.getConversationHistory(sessionId);
      console.log('✅ Retrieved', conversationHistory.length, 'previous messages');

      // Step 2: Create contextual query with history
      console.log('🔗 Step 2: Creating contextual query...');
      const contextualQuery = this.createContextualQuery(question, conversationHistory);
      console.log('✅ Contextual query created:', contextualQuery.substring(0, 100) + '...');

      // Step 3: Search database using question embedding
      console.log('🔍 Step 3: Searching database with question embedding...');
      const searchResults = await this.semanticDatabaseSearcher.searchDatabase(
        this.extractKeywords(contextualQuery), // Extract keywords for fallback
        this.categorizeQuestion(question), // Determine category from question
        'information_request', // Default intent
        contextualQuery // Use contextual query for embedding
      );
      console.log('✅ Semantic Database Search: Found', searchResults.length, 'potential matches');

      // Step 4: Filter relevant information
      console.log('🎯 Step 4: Filtering relevant information...');
      const { relevantEntries, relevanceScores, filteredContent } = await this.relevanceFilter.filterRelevantInfo(
        question,
        searchResults,
        {
          intent: 'information_request',
          category: this.categorizeQuestion(question),
          keywords: this.extractKeywords(question),
          context: conversationHistory.length > 0 ? 'follow_up_question' : 'initial_question',
          specificity: 'general'
        }
      );
      console.log('✅ Relevance Filter: Identified', relevantEntries.length, 'highly relevant entries');

      // Step 5: Generate final response with conversation context
      console.log('🤖 Step 5: Generating response with context...');
      const finalAnswer = await this.responseGenerator.generateResponse(
        question,
        {
          intent: 'information_request',
          category: this.categorizeQuestion(question),
          keywords: this.extractKeywords(question),
          context: conversationHistory.length > 0 ? 'follow_up_question' : 'initial_question',
          specificity: 'general'
        },
        relevantEntries,
        filteredContent,
        conversationHistory
      );

      // Generate related questions
      const relatedQuestions = await this.responseGenerator.generateRelatedQuestions(
        question,
        relevantEntries
      );

      const processingTime = Date.now() - startTime;

      // Create processing data for database storage
      const processingData: AgentProcessingData = {
        sessionId,
        questionAnalysis: {
          intent: 'information_request',
          category: this.categorizeQuestion(question),
          keywords: this.extractKeywords(question),
          context: conversationHistory.length > 0 ? 'follow_up_question' : 'initial_question',
          specificity: 'general'
        },
        databaseSearch: {
          searchResults: searchResults.map(r => ({ 
            id: r.id, 
            question: r.question, 
            category: r.category,
            searchType: this.isInitialized ? 'question_embedding' : 'keyword'
          })),
          searchKeywords: this.extractKeywords(question),
          resultsCount: searchResults.length
        },
        relevanceFilter: {
          relevantEntries: relevantEntries.map(r => ({ id: r.id, question: r.question })),
          relevanceScores,
          filteredContent
        },
        responseGeneration: {
          finalAnswer,
          relatedQuestions,
          processingTime
        }
      };

      console.log('🎉 AI Agent Processing Complete with question embedding and conversation history!');

      return {
        answer: finalAnswer,
        relatedQuestions,
        processingData
      };

    } catch (error) {
      console.error('AI Agent processing failed:', error);
      
      // Fallback to simple search
      const fallbackResults = knowledgeBase.filter(entry => {
        const questionLower = question.toLowerCase();
        return entry.question.toLowerCase().includes(questionLower) ||
               entry.keywords.some(k => questionLower.includes(k.toLowerCase())) ||
               entry.answer.toLowerCase().includes(questionLower);
      }).slice(0, 3);

      const processingData: AgentProcessingData = {
        sessionId,
        questionAnalysis: {
          intent: 'fallback',
          category: 'general',
          keywords: question.toLowerCase().split(' '),
          context: 'error fallback',
          specificity: 'general'
        },
        databaseSearch: {
          searchResults: fallbackResults.map(r => ({ id: r.id, question: r.question, category: r.category })),
          searchKeywords: [],
          resultsCount: fallbackResults.length
        },
        relevanceFilter: {
          relevantEntries: [],
          relevanceScores: [],
          filteredContent: []
        },
        responseGeneration: {
          finalAnswer: fallbackResults.length > 0 ? fallbackResults[0].answer : "I'd be happy to help you learn more about Harshitha.",
          relatedQuestions: [],
          processingTime: Date.now() - startTime
        }
      };

      return {
        answer: fallbackResults.length > 0 
          ? fallbackResults[0].answer 
          : "I'd be happy to help you learn more about Harshitha. Could you please ask a specific question about her experience, skills, or projects?",
        relatedQuestions: fallbackResults.slice(0, 4).map(entry => entry.question),
        processingData
      };
    }
  }

  isSemanticSearchEnabled(): boolean {
    return this.isInitialized;
  }

  async regenerateEmbeddings(): Promise<void> {
    console.log('🔄 Regenerating embeddings...');
    await this.embeddingService.forceRegenerateAllEmbeddings(knowledgeBase);
    this.isInitialized = true;
    console.log('✅ Embeddings regenerated successfully');
  }

  async getEmbeddingStatus(): Promise<{
    total: number;
    generated: number;
    missing: number;
    isComplete: boolean;
  }> {
    const total = knowledgeBase.length;
    const generated = await this.getEmbeddingCount();
    const missing = total - generated;
    
    return {
      total,
      generated,
      missing,
      isComplete: missing === 0
    };
  }

  private async getConversationHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const history = await databaseService.getChatHistory(sessionId);
      // Return last 3 messages (excluding the current one being processed)
      return history.slice(-6).filter(msg => msg.type === 'user').slice(-3);
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }

  private createContextualQuery(currentQuestion: string, history: ChatMessage[]): string {
    if (history.length === 0) {
      return currentQuestion;
    }

    // Create context from previous questions
    const previousQuestions = history.map(msg => msg.content).join(' ');
    
    // Combine current question with context
    return `Previous context: ${previousQuestions}\n\nCurrent question: ${currentQuestion}`;
  }

  private extractKeywords(question: string): string[] {
    // Simple keyword extraction
    const stopWords = ['what', 'how', 'when', 'where', 'why', 'who', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'tell', 'me', 'can', 'you', 'did', 'do', 'does'];
    
    return question
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10); // Limit to 10 keywords
  }

  private categorizeQuestion(question: string): string {
    const questionLower = question.toLowerCase();
    
    // Company/Experience questions
    if (questionLower.includes('paytm') || questionLower.includes('talentgum') || 
        questionLower.includes('mercedes') || questionLower.includes('tcs') || 
        questionLower.includes('philips') || questionLower.includes('experience') ||
        questionLower.includes('role') || questionLower.includes('work') ||
        questionLower.includes('job') || questionLower.includes('position')) {
      return 'experience';
    }
    
    // Projects questions
    if (questionLower.includes('project') || questionLower.includes('built') || 
        questionLower.includes('developed') || questionLower.includes('created') ||
        questionLower.includes('ai') || questionLower.includes('automation') ||
        questionLower.includes('chatbot') || questionLower.includes('achievement')) {
      return 'projects_&_impact';
    }
    
    // Skills questions
    if (questionLower.includes('skill') || questionLower.includes('technology') ||
        questionLower.includes('tech') || questionLower.includes('programming')) {
      return 'skills';
    }
    
    // PM mindset questions
    if (questionLower.includes('approach') || questionLower.includes('strategy') ||
        questionLower.includes('methodology') || questionLower.includes('process')) {
      return 'pm_mindset';
    }
    
    return 'general_questions';
  }
}