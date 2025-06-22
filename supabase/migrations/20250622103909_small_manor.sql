/*
  # Create similarity search function

  1. Functions
    - `match_knowledge_embeddings` - performs similarity search using cosine distance
    
  This function enables fast semantic search using the pgvector extension.
*/

-- Create the similarity search function
CREATE OR REPLACE FUNCTION match_knowledge_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  knowledge_id text,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT
    knowledge_embeddings.knowledge_id,
    knowledge_embeddings.content,
    1 - (knowledge_embeddings.embedding <=> query_embedding) AS similarity,
    knowledge_embeddings.metadata
  FROM knowledge_embeddings
  WHERE 1 - (knowledge_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;