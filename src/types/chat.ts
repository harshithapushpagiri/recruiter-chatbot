export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentProcessing?: AgentProcessingData;
}

export interface AgentProcessingData {
  sessionId: string;
  questionAnalysis: {
    intent: string;
    category: string;
    keywords: string[];
    context: string;
    specificity: string;
  };
  databaseSearch: {
    searchResults: any[];
    searchKeywords: string[];
    resultsCount: number;
  };
  relevanceFilter: {
    relevantEntries: any[];
    relevanceScores: number[];
    filteredContent: string[];
  };
  responseGeneration: {
    finalAnswer: string;
    relatedQuestions: string[];
    processingTime: number;
  };
}

export interface ChatSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  userInfo?: {
    userAgent: string;
    timestamp: Date;
  };
}