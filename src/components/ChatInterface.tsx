import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageSquare, Database, Clock, Sparkles, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Zap, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { AIAgentOrchestrator } from '../services/AIAgentOrchestrator';
import { databaseService } from '../services/DatabaseService';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  aiOrchestrator: AIAgentOrchestrator;
  sessionId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ aiOrchestrator, sessionId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState({ total: 0, generated: 0, missing: 0, isComplete: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history when component mounts
    loadChatHistory();
    
    // Check semantic search status and embedding status
    const checkStatus = async () => {
      setSemanticSearchEnabled(aiOrchestrator.isSemanticSearchEnabled());
      
      try {
        const status = await aiOrchestrator.getEmbeddingStatus();
        setEmbeddingStatus(status);
      } catch (error) {
        console.error('Failed to get embedding status:', error);
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 3000); // Check every 3 seconds
    
    return () => clearInterval(interval);
  }, [sessionId, aiOrchestrator]);

  useEffect(() => {
    scrollToBottom();
    checkScrollButtons();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const handleScroll = () => checkScrollButtons();
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await databaseService.getChatHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const checkScrollButtons = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButtons(scrollHeight > clientHeight);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollUp = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollBy({ top: -300, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollBy({ top: 300, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    const userMessageId = uuidv4();
    const assistantMessageId = uuidv4();
    const question = currentMessage.trim();

    // Add user message
    const userMessage: ChatMessage = {
      id: userMessageId,
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // Save user message to database
    await databaseService.saveChatMessage(sessionId, userMessage);

    try {
      // Process with AI agents
      const result = await aiOrchestrator.processQuestion(question, sessionId);
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: result.answer,
        timestamp: new Date(),
        agentProcessing: result.processingData
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

      // Save assistant message and processing data to database
      await databaseService.saveChatMessage(sessionId, assistantMessage);
      await databaseService.saveAgentProcessing(sessionId, assistantMessageId, result.processingData);
      
      // Update session message count
      await databaseService.updateSessionMessageCount(sessionId, messages.length + 2);

    } catch (error) {
      console.error('Error processing message:', error);
      setIsLoading(false);
      
      const errorMessage: ChatMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: "I'm having trouble processing your question right now. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await databaseService.saveChatMessage(sessionId, errorMessage);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question);
  };

  const sampleQuestions = [
    "What was her role at Paytm?",
    "What AI projects has she worked on?",
    "How does she approach product strategy?",
    "What results did she achieve at TalentGum?",
    "What sets her apart as a PM?",
    "Tell me about her automation experience"
  ];

  return (
    <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base lg:text-lg">Ask me anything</h3>
                <p className="text-slate-400 text-xs lg:text-sm">
                  AI assistant ready to help
                </p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-xs font-medium">Active</span>
              </div>
            </div>
            
            {/* Mobile status indicator */}
            <div className="lg:hidden">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 relative"
        >
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-4 lg:py-8">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 lg:px-6 py-2 mb-4 lg:mb-6">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-xs lg:text-sm font-medium">
                  {semanticSearchEnabled ? 'Semantic search ready' : `Setting up semantic search... (${embeddingStatus.generated}/${embeddingStatus.total})`}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-3 lg:mb-4 flex items-center justify-center gap-2 text-sm lg:text-base">
                <MessageSquare className="w-4 h-4" />
                Try asking about:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3 max-w-2xl mx-auto">
                {sampleQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-left p-2 lg:p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-slate-300 hover:text-white transition-all duration-200 text-xs lg:text-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-r from-blue-500 to-teal-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 lg:p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 border border-white/20 text-slate-200'
                    }`}>
                      <div className="whitespace-pre-line leading-relaxed text-sm lg:text-base">
                        {message.content}
                      </div>
                    </div>
                    
                    <div className={`text-xs text-slate-400 mt-1 lg:mt-2 flex items-center gap-1 lg:gap-2 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <Clock className="w-2 h-2 lg:w-3 lg:h-3" />
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] lg:max-w-3xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-3 lg:p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-slate-400 text-sm">Thinking...</span>
                    </div>
                    {/* <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-slate-400 text-sm">Step 1: Getting conversation history...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        <span className="text-slate-400 text-sm">
                          Step 2: {semanticSearchEnabled ? 'Embedding question for search...' : 'Searching knowledge database...'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        <span className="text-slate-400 text-sm">Step 3: Filtering relevant information...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                        <span className="text-slate-400 text-sm">Step 4: Generating contextual response...</span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-white/10 p-4 lg:p-6">
          <form onSubmit={handleSubmit} className="flex gap-2 lg:gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me anything about Harshitha's experience, skills, or projects..."
                className="w-full px-4 lg:px-6 py-3 lg:py-4 pr-12 lg:pr-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-lg transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !currentMessage.trim()}
                className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <Send className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </button>
            </div>
          </form>
          
          <div className="mt-2 lg:mt-4 hidden lg:block">
            <p className="text-slate-400 text-xs text-center">
              {semanticSearchEnabled ? (
                <>
                  <Zap className="w-3 h-3 inline mr-1" />
                  Enhanced search active for better responses
                </>
              ) : (
                <>
                  <Database className="w-3 h-3 inline mr-1" />
                  Setting up enhanced search...
                </>
              )}
              {databaseService.isSupabaseConfigured() && (
                <> • Conversations saved</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Navigation Sidebar */}
      {showScrollButtons && (
        <div className="hidden lg:flex w-16 bg-white/5 backdrop-blur-sm border-l border-white/10 flex-col items-center justify-center gap-4 p-4">
          <div className="text-center mb-4">
            <p className="text-slate-400 text-xs font-medium mb-2">Navigate</p>
            <div className="w-8 h-px bg-white/20"></div>
          </div>
          
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-all duration-200 group"
            title="Go to top"
          >
            <ArrowUp className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </button>
          
          <button
            onClick={scrollUp}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-all duration-200 group"
            title="Scroll up"
          >
            <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </button>
          
          <button
            onClick={scrollDown}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-all duration-200 group"
            title="Scroll down"
          >
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </button>
          
          <button
            onClick={scrollToBottom}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center transition-all duration-200 group"
            title="Go to bottom"
          >
            <ArrowDown className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </button>
          
          <div className="mt-4 text-center">
            <div className="w-8 h-px bg-white/20 mb-2"></div>
            <p className="text-slate-500 text-xs">{messages.length}</p>
            <p className="text-slate-500 text-xs">msgs</p>
          </div>
        </div>
      )}
    </div>
  );
};