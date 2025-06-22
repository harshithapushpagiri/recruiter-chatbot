/*
  # Create embeddings table for semantic search

  1. New Tables
    - `knowledge_embeddings`
      - `id` (uuid, primary key)
      - `knowledge_id` (text, references knowledge base entry)
      - `content` (text, the text that was embedded)
      - `embedding` (vector, the embedding vector)
      - `metadata` (jsonb, additional metadata)
      - `created_at` (timestamp)

  2. Extensions
    - Enable pgvector extension for vector operations

  3. Indexes
    - Create HNSW index for fast similarity search
    - Create index on knowledge_id for lookups

  4. Security
    - Enable RLS on embeddings table
    - Add policy for public read access (since this is a demo)
*/

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the knowledge embeddings table
CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id text NOT NULL,
  content text NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 produces 1536-dimensional embeddings
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_knowledge_id 
  ON knowledge_embeddings(knowledge_id);

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_embedding 
  ON knowledge_embeddings USING hnsw (embedding vector_cosine_ops);

-- Enable RLS
ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (demo purposes)
CREATE POLICY "Allow public access to knowledge embeddings"
  ON knowledge_embeddings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);