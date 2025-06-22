import { createClient } from '@supabase/supabase-js';
import { ChatMessage, ChatSession, AgentProcessingData } from '../types/chat';

export class DatabaseService {
  private supabase;
  private isConfigured: boolean = false;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url' && supabaseKey !== 'your_supabase_anon_key') {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.isConfigured = true;
      console.log('✅ Database Service: Supabase configured');
    } else {
      console.log('⚠️ Database Service: Supabase not configured, using local storage fallback');
      this.isConfigured = false;
    }
  }

  async createChatSession(sessionId: string): Promise<void> {
    if (!this.isConfigured) {
      // Store in localStorage as fallback
      const session: ChatSession = {
        id: sessionId,
        startTime: new Date(),
        messageCount: 0,
        userInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date()
        }
      };
      localStorage.setItem(`chat_session_${sessionId}`, JSON.stringify(session));
      return;
    }

    try {
      // First check if session already exists
      const { data: existingSession, error: checkError } = await this.supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected for new sessions
        throw checkError;
      }

      if (existingSession) {
        console.log('⚠️ Chat session already exists:', sessionId);
        return;
      }

      // Create new session if it doesn't exist
      const { error } = await this.supabase
        .from('chat_sessions')
        .insert([
          {
            id: sessionId,
            start_time: new Date().toISOString(),
            message_count: 0,
            user_info: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          }
        ])
        .select();

      if (error) {
        throw error;
      }
      
      console.log('✅ Chat session created:', sessionId);
    } catch (error: any) {
      if (error?.code === '23505') {
        console.log('⚠️ Chat session already exists (duplicate key):', sessionId);
        return;
      }
      console.error('❌ Failed to create chat session:', error);
    }
  }

  async saveChatMessage(sessionId: string, message: ChatMessage): Promise<void> {
    if (!this.isConfigured) {
      // Store in localStorage as fallback
      const messages = this.getLocalMessages(sessionId);
      messages.push(message);
      localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
      return;
    }

    try {
      const { error } = await this.supabase
        .from('chat_messages')
        .insert([
          {
            id: message.id,
            session_id: sessionId,
            type: message.type,
            content: message.content,
            timestamp: message.timestamp.toISOString(),
            agent_processing: message.agentProcessing || null
          }
        ]);

      if (error) throw error;
      console.log('✅ Chat message saved:', message.id);
    } catch (error) {
      console.error('❌ Failed to save chat message:', error);
    }
  }

  async saveAgentProcessing(sessionId: string, messageId: string, processingData: AgentProcessingData): Promise<void> {
    if (!this.isConfigured) {
      // Update localStorage
      const messages = this.getLocalMessages(sessionId);
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        messages[messageIndex].agentProcessing = processingData;
        localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
      }
      return;
    }

    try {
      const { error } = await this.supabase
        .from('agent_processing_logs')
        .insert([
          {
            session_id: sessionId,
            message_id: messageId,
            question_analysis: processingData.questionAnalysis,
            database_search: processingData.databaseSearch,
            relevance_filter: processingData.relevanceFilter,
            response_generation: processingData.responseGeneration,
            processing_time: processingData.responseGeneration.processingTime,
            timestamp: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      console.log('✅ Agent processing data saved for message:', messageId);
    } catch (error) {
      console.error('❌ Failed to save agent processing data:', error);
    }
  }

  async updateSessionMessageCount(sessionId: string, count: number): Promise<void> {
    if (!this.isConfigured) {
      const sessionData = localStorage.getItem(`chat_session_${sessionId}`);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.messageCount = count;
        localStorage.setItem(`chat_session_${sessionId}`, JSON.stringify(session));
      }
      return;
    }

    try {
      const { error } = await this.supabase
        .from('chat_sessions')
        .update({ message_count: count })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Failed to update session message count:', error);
    }
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    if (!this.isConfigured) {
      return this.getLocalMessages(sessionId);
    }

    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        type: row.type,
        content: row.content,
        timestamp: new Date(row.timestamp),
        agentProcessing: row.agent_processing
      }));
    } catch (error) {
      console.error('❌ Failed to get chat history:', error);
      return [];
    }
  }

  private getLocalMessages(sessionId: string): ChatMessage[] {
    const messagesData = localStorage.getItem(`chat_messages_${sessionId}`);
    if (!messagesData) return [];
    
    try {
      return JSON.parse(messagesData).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch {
      return [];
    }
  }

  isSupabaseConfigured(): boolean {
    return this.isConfigured;
  }
}

export const databaseService = new DatabaseService();