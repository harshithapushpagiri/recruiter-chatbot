import OpenAI from 'openai';
import { KnowledgeEntry } from '../types/knowledge';

export class RelevanceFilter {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async filterRelevantInfo(
    question: string,
    searchResults: KnowledgeEntry[],
    analysisResult: any
  ): Promise<{
    relevantEntries: KnowledgeEntry[];
    relevanceScores: number[];
    filteredContent: string[];
  }> {
    try {
      console.log('🎯 Filtering relevance for', searchResults.length, 'entries');

      // If we have very few results, use them all to avoid over-filtering
      if (searchResults.length <= 2) {
        return {
          relevantEntries: searchResults,
          relevanceScores: searchResults.map(() => 8),
          filteredContent: searchResults.map(entry => entry.answer)
        };
      }

      // Check if this is a projects/achievements query that should return multiple results
      const isProjectsQuery = this.isProjectsOrAchievementsQuery(question, analysisResult);
      
      // Create a more focused prompt for relevance filtering
      const entriesWithSummary = searchResults.map((entry, index) => ({
        index,
        entry,
        summary: `${index}. Q: "${entry.question}"\nCategory: ${entry.category}\nOrganization: ${entry.organization || 'N/A'}\nAnswer: ${entry.answer.substring(0, 200)}...`
      }));

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a strict relevance filter. Your job is to identify which knowledge base entries DIRECTLY answer the recruiter's question.

CRITICAL RULES:
1. Only select entries that DIRECTLY relate to the question asked
2. For AI/project questions: ALWAYS include entries from 'projects_&_impact', 'side_projects', or 'mvp' categories that mention AI, automation, chatbot, or technical projects
3. For experience questions: prioritize entries from 'experience' category matching the company/role mentioned
4. If the question asks about a specific company, only include entries from that company
5. If the question asks about specific projects/achievements, only include those specific items
6. Rate relevance from 0-10 where 10 = perfect match, 7-9 = good match, 4-6 = partial match, 0-3 = poor match
7. For AI/project/achievements queries: Consider score >= 5 as relevant (more lenient threshold)
8. For other queries: Consider score >= 7 as relevant
9. If the question asks about multiple projects or achievements, include ALL relevant project entries
10. If very few entries meet the high threshold, include slightly lower-scored but contextually strong matches
11. NEVER select greeting, salary, or scheduling entries unless the question is SPECIFICALLY about those topics
12. For role/experience questions about specific companies, ONLY select entries from that exact company

Return JSON with:
{
  "relevantIndices": [array of indices of relevant entries],
  "relevanceScores": [array of scores 0-10 for each entry in order],
  "reasoning": [brief explanation for each selected entry]
}`
          },
          {
            role: "user",
            content: `Question: "${question}"
            Question Category: ${analysisResult.category}
            Question Intent: ${analysisResult.intent}
            
            Available Knowledge Base Entries:
            ${entriesWithSummary.map(item => item.summary).join('\n\n')}
            
            Select entries that DIRECTLY answer this specific question. For AI/project questions, be more inclusive of technical project entries.`
          }
        ],
        temperature: 0.1, // Very low temperature for consistency
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const filterResult = JSON.parse(content);
      
      // Validate the results
      const validIndices = filterResult.relevantIndices.filter((index: number) => 
        index >= 0 && index < searchResults.length
      );

      // Determine threshold based on question type
      const isAIProjectQuery = analysisResult.intent.toLowerCase().includes('ai') || 
                              analysisResult.intent.toLowerCase().includes('project') ||
                              analysisResult.intent.toLowerCase().includes('achievement') ||
                              analysisResult.category === 'projects_&_impact' ||
                              analysisResult.category === 'side_projects' ||
                              analysisResult.category === 'mvp' ||
                              analysisResult.category === 'achievements';
      
      const minScore = isAIProjectQuery || isProjectsQuery ? 5 : 7;
      
      // Filter by relevance scores
      const scoredIndices = validIndices.filter((index: number, i: number) => {
        const score = filterResult.relevanceScores[i];
        return score >= minScore;
      });

      // For projects queries, ensure we return at least 3 relevant entries if available
      if (isProjectsQuery && scoredIndices.length < 3 && searchResults.length >= 3) {
        console.log('🔍 Projects query detected - ensuring comprehensive results');
        
        // For projects queries, be more inclusive and get all project-related entries
        const projectEntries = searchResults.filter(entry => 
          entry.category === 'projects_&_impact' || 
          entry.category === 'side_projects' || 
          entry.category === 'mvp' ||
          entry.keywords.some(k => ['AI', 'Automation', 'Project', 'Built', 'Developed', 'Chatbot'].includes(k)) ||
          entry.answer.toLowerCase().includes('project') ||
          entry.answer.toLowerCase().includes('built') ||
          entry.answer.toLowerCase().includes('developed')
        );
        
        if (projectEntries.length >= 3) {
          console.log('✅ Found', projectEntries.length, 'project entries for comprehensive response');
          return {
            relevantEntries: projectEntries.slice(0, 8), // Return up to 8 project entries
            relevanceScores: projectEntries.slice(0, 8).map(() => 7),
            filteredContent: projectEntries.slice(0, 8).map(entry => entry.answer)
          };
        }
        
        // Fallback: get top scoring entries even if they don't meet the threshold
        const allScored = validIndices.map((index: number, i: number) => ({
          index,
          score: filterResult.relevanceScores[i] || 0
        })).sort((a, b) => b.score - a.score);
        
        const topIndices = allScored.slice(0, Math.min(6, searchResults.length)).map(item => item.index);
        const relevantEntries = topIndices.map((index: number) => searchResults[index]);
        const relevanceScores = topIndices.map((index: number, i: number) => allScored[i].score);
        const filteredContent = relevantEntries.map(entry => entry.answer);

        console.log('✅ Relevance Filter - Found', relevantEntries.length, 'entries (relaxed threshold for projects)');

        return {
          relevantEntries,
          relevanceScores,
          filteredContent
        };
      }
      
      if (scoredIndices.length === 0) {
        // More lenient fallback: use top 2 search results if no high-scoring matches
        console.log('⚠️ No high-scoring relevant entries found, using top search results');
        return {
          relevantEntries: searchResults.slice(0, 2),
          relevanceScores: [6, 5],
          filteredContent: searchResults.slice(0, 2).map(entry => entry.answer)
        };
      }

      const relevantEntries = scoredIndices.map((index: number) => searchResults[index]);
      const relevanceScores = scoredIndices.map((index: number, i: number) => filterResult.relevanceScores[i]);
      const filteredContent = relevantEntries.map(entry => entry.answer);

      console.log('✅ Relevance Filter - Found', relevantEntries.length, 'highly relevant entries');

      return {
        relevantEntries,
        relevanceScores,
        filteredContent
      };

    } catch (error) {
      console.error('Relevance filtering failed:', error);
      
      // Conservative fallback: return top 2 entries from search
      const fallbackEntries = searchResults.slice(0, 2);
      return {
        relevantEntries: fallbackEntries,
        relevanceScores: [7, 6],
        filteredContent: fallbackEntries.map(entry => entry.answer)
      };
    }
  }

  private isProjectsOrAchievementsQuery(question: string, analysisResult: any): boolean {
    const questionLower = question.toLowerCase();
    const intentLower = analysisResult.intent.toLowerCase();
    
    // Check for plural forms and multiple indicators
    const multipleProjectIndicators = [
      'projects', 'achievements', 'accomplishments', 'what have you built',
      'what have you worked on', 'tell me about your work', 'your experience',
      'what did you build', 'what have you done', 'your portfolio',
      'key projects', 'major projects', 'significant work'
    ];
    
    return multipleProjectIndicators.some(indicator => 
      questionLower.includes(indicator) || intentLower.includes(indicator)
    ) || analysisResult.category === 'projects_&_impact' ||
       analysisResult.category === 'achievements';
  }
}