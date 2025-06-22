import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { KnowledgeEntry } from '../types/knowledge';

export interface EmbeddingData {
  id: string;
  knowledge_id: string;
  content: string;
  embedding: number[];
  metadata: {
    category: string;
    organization?: string;
    timePeriod?: string;
    keywords: string[];
  };
}

export class EmbeddingService {
  private openai: OpenAI;
  private supabase;
  private _isConfigured: boolean = false;

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url' && supabaseKey !== 'your_supabase_anon_key') {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this._isConfigured = true;
      console.log('✅ Embedding Service: Supabase configured');
    } else {
      console.log('⚠️ Embedding Service: Supabase not configured, embeddings will be stored locally');
      this._isConfigured = false;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  async generateKnowledgeBaseEmbeddings(knowledgeBase: KnowledgeEntry[], forceRegenerate: boolean = false): Promise<void> {
    console.log('🔄 Generating embeddings for knowledge base...');
    console.log(`📊 Total entries to process: ${knowledgeBase.length}`);
    
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const entry of knowledgeBase) {
      try {
        // Check if embedding already exists (unless forcing regeneration)
        if (!forceRegenerate) {
          const exists = await this.embeddingExists(entry.id);
          if (exists) {
            console.log(`⏭️ Embedding already exists for entry: ${entry.id} - "${entry.question.substring(0, 50)}..."`);
            skippedCount++;
            continue;
          }
        } else {
          // If forcing regeneration, delete existing embedding first
          await this.deleteExistingEmbedding(entry.id);
        }

        // Create content string for embedding
        const content = this.createEmbeddingContent(entry);
        
        console.log(`🔄 Generating embedding for: "${entry.question.substring(0, 50)}..."`);
        
        // Generate embedding
        const embedding = await this.generateEmbedding(content);
        
        // Store embedding
        await this.storeEmbedding({
          id: crypto.randomUUID(),
          knowledge_id: entry.id,
          content,
          embedding,
          metadata: {
            category: entry.category,
            organization: entry.organization || undefined,
            timePeriod: entry.timePeriod || undefined,
            keywords: entry.keywords
          }
        });

        console.log(`✅ Generated embedding for: "${entry.question.substring(0, 50)}..."`);
        processedCount++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Failed to generate embedding for entry ${entry.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('🎉 Knowledge base embedding generation complete!');
    console.log(`📊 Summary: ${processedCount} processed, ${skippedCount} skipped, ${errorCount} errors`);
    console.log(`📊 Total embeddings should be: ${processedCount + skippedCount}`);
  }

  private createEmbeddingContent(entry: KnowledgeEntry): string {
    // Combine relevant fields for embedding with enhanced content
    const parts = [
      `Question: ${entry.question}`,
      `Answer: ${entry.answer}`,
      `Category: ${entry.category}`,
      `Keywords: ${entry.keywords.join(', ')}`
    ];

    if (entry.organization) {
      parts.push(`Organization: ${entry.organization}`);
    }

    if (entry.timePeriod) {
      parts.push(`Time Period: ${entry.timePeriod}`);
    }

    if (entry.relevance) {
      parts.push(`Relevance: ${entry.relevance}`);
    }

    return parts.join('\n');
  }

  private async embeddingExists(knowledgeId: string): Promise<boolean> {
    if (!this._isConfigured) {
      const localEmbeddings = this.getLocalEmbeddings();
      return localEmbeddings.some(e => e.knowledge_id === knowledgeId);
    }

    try {
      const { data, error } = await this.supabase
        .from('knowledge_embeddings')
        .select('id')
        .eq('knowledge_id', knowledgeId)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking embedding existence:', error);
      return false;
    }
  }

  private async deleteExistingEmbedding(knowledgeId: string): Promise<void> {
    if (!this._isConfigured) {
      const localEmbeddings = this.getLocalEmbeddings();
      const filtered = localEmbeddings.filter(e => e.knowledge_id !== knowledgeId);
      localStorage.setItem('knowledge_embeddings', JSON.stringify(filtered));
      return;
    }

    try {
      const { error } = await this.supabase
        .from('knowledge_embeddings')
        .delete()
        .eq('knowledge_id', knowledgeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting existing embedding:', error);
    }
  }

  private async storeEmbedding(embeddingData: EmbeddingData): Promise<void> {
    if (!this._isConfigured) {
      // Store locally as fallback
      const localEmbeddings = this.getLocalEmbeddings();
      localEmbeddings.push(embeddingData);
      localStorage.setItem('knowledge_embeddings', JSON.stringify(localEmbeddings));
      return;
    }

    try {
      const { error } = await this.supabase
        .from('knowledge_embeddings')
        .insert([{
          id: embeddingData.id,
          knowledge_id: embeddingData.knowledge_id,
          content: embeddingData.content,
          embedding: embeddingData.embedding,
          metadata: embeddingData.metadata,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store embedding:', error);
      throw error;
    }
  }

  async semanticSearch(query: string, limit: number = 10, threshold: number = 0.7): Promise<{
    knowledgeIds: string[];
    similarities: number[];
    metadata: any[];
  }> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      if (!this._isConfigured) {
        return this.localSemanticSearch(queryEmbedding, limit, threshold);
      }

      // Perform similarity search using Supabase
      const { data, error } = await this.supabase.rpc('match_knowledge_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit
      });

      if (error) {
        console.error('Semantic search error:', error);
        // Fallback to local search
        return this.localSemanticSearch(queryEmbedding, limit, threshold);
      }

      return {
        knowledgeIds: data.map((item: any) => item.knowledge_id),
        similarities: data.map((item: any) => item.similarity),
        metadata: data.map((item: any) => item.metadata)
      };

    } catch (error) {
      console.error('Semantic search failed:', error);
      return { knowledgeIds: [], similarities: [], metadata: [] };
    }
  }

  private localSemanticSearch(queryEmbedding: number[], limit: number, threshold: number): {
    knowledgeIds: string[];
    similarities: number[];
    metadata: any[];
  } {
    const localEmbeddings = this.getLocalEmbeddings();
    
    const similarities = localEmbeddings.map(embedding => ({
      knowledge_id: embedding.knowledge_id,
      similarity: this.cosineSimilarity(queryEmbedding, embedding.embedding),
      metadata: embedding.metadata
    }));

    const filtered = similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return {
      knowledgeIds: filtered.map(item => item.knowledge_id),
      similarities: filtered.map(item => item.similarity),
      metadata: filtered.map(item => item.metadata)
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private getLocalEmbeddings(): EmbeddingData[] {
    const data = localStorage.getItem('knowledge_embeddings');
    return data ? JSON.parse(data) : [];
  }

  isConfigured = (): boolean => {
    return this._isConfigured;
  };

  async initializeEmbeddings(knowledgeBase: KnowledgeEntry[]): Promise<void> {
    console.log('🚀 Initializing embeddings...');
    
    // Always generate embeddings to ensure we have all entries
    console.log('📝 Generating embeddings for all knowledge base entries...');
    await this.generateKnowledgeBaseEmbeddings(knowledgeBase, false); // Don't force regenerate existing ones
    
    // Verify we have embeddings for all entries
    await this.verifyAllEmbeddingsExist(knowledgeBase);
  }

  private async verifyAllEmbeddingsExist(knowledgeBase: KnowledgeEntry[]): Promise<void> {
    console.log('🔍 Verifying all embeddings exist...');
    
    const missingEmbeddings: KnowledgeEntry[] = [];
    
    for (const entry of knowledgeBase) {
      const exists = await this.embeddingExists(entry.id);
      if (!exists) {
        missingEmbeddings.push(entry);
      }
    }
    
    if (missingEmbeddings.length > 0) {
      console.log(`⚠️ Found ${missingEmbeddings.length} missing embeddings, generating them now...`);
      
      for (const entry of missingEmbeddings) {
        try {
          const content = this.createEmbeddingContent(entry);
          const embedding = await this.generateEmbedding(content);
          
          await this.storeEmbedding({
            id: crypto.randomUUID(),
            knowledge_id: entry.id,
            content,
            embedding,
            metadata: {
              category: entry.category,
              organization: entry.organization || undefined,
              timePeriod: entry.timePeriod || undefined,
              keywords: entry.keywords
            }
          });
          
          console.log(`✅ Generated missing embedding for: "${entry.question.substring(0, 50)}..."`);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`❌ Failed to generate missing embedding for ${entry.id}:`, error);
        }
      }
    }
    
    // Final count
    const finalCount = await this.getEmbeddingCount();
    console.log(`📊 Final embedding count: ${finalCount} / ${knowledgeBase.length} entries`);
    
    if (finalCount === knowledgeBase.length) {
      console.log('🎉 All embeddings successfully generated!');
    } else {
      console.log(`⚠️ Missing ${knowledgeBase.length - finalCount} embeddings`);
    }
  }

  private async getEmbeddingCount(): Promise<number> {
    if (!this._isConfigured) {
      const localEmbeddings = this.getLocalEmbeddings();
      return localEmbeddings.length;
    }

    try {
      const { count, error } = await this.supabase
        .from('knowledge_embeddings')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting embedding count:', error);
      return 0;
    }
  }

  async forceRegenerateAllEmbeddings(knowledgeBase: KnowledgeEntry[]): Promise<void> {
    console.log('🔄 Force regenerating ALL embeddings...');
    
    // Clear all existing embeddings first
    await this.clearAllEmbeddings();
    
    // Generate fresh embeddings for all entries
    await this.generateKnowledgeBaseEmbeddings(knowledgeBase, true);
    
    console.log('🎉 All embeddings force regenerated!');
  }

  private async clearAllEmbeddings(): Promise<void> {
    if (!this._isConfigured) {
      localStorage.removeItem('knowledge_embeddings');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('knowledge_embeddings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) throw error;
      console.log('🗑️ Cleared all existing embeddings');
    } catch (error) {
      console.error('Error clearing embeddings:', error);
    }
  }

  private async hasExistingEmbeddings(): Promise<boolean> {
    const count = await this.getEmbeddingCount();
    return count > 0;
  }
}