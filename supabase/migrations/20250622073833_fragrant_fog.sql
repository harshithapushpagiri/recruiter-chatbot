/*
  # Complete Chat System Database Schema

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `start_time` (timestamptz, default now())
      - `message_count` (integer, default 0)
      - `user_info` (jsonb)
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to chat_sessions)
      - `type` (text, not null)
      - `content` (text, not null)
      - `timestamp` (timestamptz, default now())
      - `agent_processing` (jsonb)
    - `agent_processing_logs`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `session_id` (uuid, foreign key to chat_sessions)
      - `message_id` (uuid, foreign key to chat_messages)
      - `question_analysis` (jsonb)
      - `database_search` (jsonb)
      - `relevance_filter` (jsonb)
      - `response_generation` (jsonb)
      - `processing_time` (integer)
      - `timestamp` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to all tables
    - Create performance indexes

  3. Changes
    - Handle existing policies by dropping and recreating them
    - Ensure all foreign key constraints are properly set
    - Add comprehensive indexing for query performance
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY,
  start_time timestamptz DEFAULT now(),
  message_count integer DEFAULT 0,
  user_info jsonb
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  type text NOT NULL,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  agent_processing jsonb
);

-- Create agent_processing_logs table
CREATE TABLE IF NOT EXISTS agent_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  question_analysis jsonb,
  database_search jsonb,
  relevance_filter jsonb,
  response_generation jsonb,
  processing_time integer,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_processing_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public access to chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Allow public access to chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow public access to agent_processing_logs" ON agent_processing_logs;

-- Create RLS policies for public access
CREATE POLICY "Allow public access to chat_sessions"
  ON chat_sessions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to chat_messages"
  ON chat_messages
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to agent_processing_logs"
  ON agent_processing_logs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_processing_logs_session_id ON agent_processing_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_processing_logs_message_id ON agent_processing_logs(message_id);