import { KnowledgeEntry, knowledgeBase } from '../data/knowledgeBase';

export class KnowledgeSearchEngine {
  private knowledgeBase: KnowledgeEntry[];

  constructor(kb: KnowledgeEntry[] = knowledgeBase) {
    this.knowledgeBase = kb;
  }

  // Enhanced semantic search with better scoring
  search(query: string, maxResults: number = 5): KnowledgeEntry[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    const scoredResults = this.knowledgeBase.map(entry => {
      let score = 0;
      
      // Direct question similarity (highest weight)
      const questionLower = entry.question.toLowerCase();
      queryWords.forEach(word => {
        if (questionLower.includes(word)) {
          score += 5;
        }
      });

      // Keyword matching (high weight)
      entry.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        queryWords.forEach(word => {
          if (keywordLower.includes(word) || word.includes(keywordLower)) {
            score += 3;
          }
        });
      });

      // Answer content matching (medium weight)
      const answerLower = entry.answer.toLowerCase();
      queryWords.forEach(word => {
        if (answerLower.includes(word)) {
          score += 2;
        }
      });

      // Relevance field matching (high weight)
      if (entry.relevance) {
        const relevanceLower = entry.relevance.toLowerCase();
        queryWords.forEach(word => {
          if (relevanceLower.includes(word)) {
            score += 4;
          }
        });
      }

      // Organization/company matching
      if (entry.organization) {
        const orgLower = entry.organization.toLowerCase();
        queryWords.forEach(word => {
          if (orgLower.includes(word)) {
            score += 3;
          }
        });
      }

      // Category matching
      queryWords.forEach(word => {
        if (entry.category.includes(word)) {
          score += 2;
        }
      });

      return { entry, score };
    });

    // Sort by score and return top results
    return scoredResults
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(result => result.entry);
  }

  // Intelligent answer generation combining multiple sources
  getBestAnswer(query: string): string {
    const results = this.search(query, 5);
    
    if (results.length === 0) {
      return this.getFallbackResponse(query);
    }

    // If we have a single high-confidence match, use it directly
    if (results.length === 1) {
      return results[0].answer;
    }

    // Combine multiple relevant results into a comprehensive answer
    return this.combineAnswers(query, results);
  }

  private combineAnswers(query: string, results: KnowledgeEntry[]): string {
    const queryLower = query.toLowerCase();
    
    // Categorize results by type
    const experienceResults = results.filter(r => r.category === 'experience');
    const projectResults = results.filter(r => r.category === 'projects_&_impact' || r.category === 'side_projects' || r.category === 'mvp');
    const skillResults = results.filter(r => r.category === 'skills');
    const generalResults = results.filter(r => r.category === 'general_questions');
    const mindsetResults = results.filter(r => r.category === 'pm_mindset');

    let combinedAnswer = '';

    // Handle specific question types
    if (queryLower.includes('experience') || queryLower.includes('role') || queryLower.includes('work')) {
      if (experienceResults.length > 0) {
        combinedAnswer = experienceResults[0].answer;
        if (projectResults.length > 0) {
          combinedAnswer += `\n\nSome key projects from this experience include: ${projectResults[0].answer}`;
        }
      }
    }
    else if (queryLower.includes('project') || queryLower.includes('built') || queryLower.includes('developed')) {
      if (projectResults.length > 0) {
        combinedAnswer = projectResults[0].answer;
        if (projectResults.length > 1) {
          combinedAnswer += `\n\nAnother relevant project: ${projectResults[1].answer}`;
        }
      }
    }
    else if (queryLower.includes('skill') || queryLower.includes('technology') || queryLower.includes('tech')) {
      if (skillResults.length > 0) {
        combinedAnswer = skillResults[0].answer;
      } else if (experienceResults.length > 0) {
        combinedAnswer = `Based on her experience: ${experienceResults[0].answer}`;
      }
    }
    else if (queryLower.includes('approach') || queryLower.includes('methodology') || queryLower.includes('process')) {
      if (mindsetResults.length > 0) {
        combinedAnswer = mindsetResults[0].answer;
      }
    }
    else {
      // General query - use the best match and supplement with context
      combinedAnswer = results[0].answer;
      
      // Add relevant context from other results
      if (results.length > 1) {
        const contextualInfo = results.slice(1, 3).map(r => {
          // Extract key points from additional results
          const sentences = r.answer.split('.').filter(s => s.trim().length > 20);
          return sentences[0] + '.';
        }).join(' ');
        
        if (contextualInfo.trim()) {
          combinedAnswer += `\n\nAdditional context: ${contextualInfo}`;
        }
      }
    }

    return combinedAnswer || results[0].answer;
  }

  private getFallbackResponse(query: string): string {
    const queryLower = query.toLowerCase();
    
    // Provide contextual fallback based on query type
    if (queryLower.includes('experience') || queryLower.includes('background')) {
      return `Harshitha has ~7 years of experience across FinTech, EdTech, and SaaS, with 3+ years specifically in product management. She's worked at companies like Paytm, TalentGum, Mercedes Benz, and TCS, focusing on AI-powered automation, user experience optimization, and building scalable systems that deliver measurable business impact.`;
    }
    
    if (queryLower.includes('skill') || queryLower.includes('technology')) {
      return `Harshitha's technical skills include LangChain, OpenAI API, Prompt Engineering, Pinecone, Supabase, and SQL. Her product skills cover Product Strategy, CX Automation, User Research, A/B Testing, and Data Analysis. She also has strong leadership capabilities in stakeholder management and cross-functional team coordination.`;
    }
    
    if (queryLower.includes('project') || queryLower.includes('achievement')) {
      return `Some of Harshitha's key projects include building a BiasHunter AI for media analysis, creating a Recruiter Chatbot using GPT and embeddings, developing a Batch Recommendation Engine that improved utilization by 38%, and launching GenAI storytelling platform 'Stories of Life'. At Paytm, she achieved 4X increase in sign-ups and 70% lift in report pulls through her product initiatives.`;
    }

    return `I'd be happy to help you learn more about Harshitha's background. She's a Product Manager with ~7 years of experience specializing in AI-powered automation, user experience optimization, and building scalable systems across FinTech, EdTech, and SaaS. Could you ask a more specific question about her experience, skills, or projects?`;
  }

  // Get related questions based on search context
  getRelatedQuestions(query: string, maxResults: number = 4): string[] {
    const results = this.search(query, 10);
    const queryLower = query.toLowerCase();
    
    // Get questions from similar context
    const relatedQuestions = results
      .map(entry => entry.question)
      .filter(question => question.toLowerCase() !== queryLower)
      .slice(0, maxResults);

    // If we don't have enough related questions, add some contextual ones
    if (relatedQuestions.length < maxResults) {
      const contextualQuestions = this.getContextualQuestions(query);
      relatedQuestions.push(...contextualQuestions.slice(0, maxResults - relatedQuestions.length));
    }

    return relatedQuestions;
  }

  private getContextualQuestions(query: string): string[] {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('paytm')) {
      return [
        "What was her role at Paytm?",
        "What results did she achieve at Paytm?",
        "Tell me about the CIR Report Revamp project",
        "How did she improve lending products at Paytm?"
      ];
    }
    
    if (queryLower.includes('talentgum')) {
      return [
        "What did she accomplish at TalentGum?",
        "Tell me about the Parent Support Chatbot",
        "How did she improve batch utilization?",
        "What EdTech problems did she solve?"
      ];
    }
    
    if (queryLower.includes('ai') || queryLower.includes('automation')) {
      return [
        "What AI projects has she worked on?",
        "Tell me about her automation experience",
        "How does she use LangChain and OpenAI?",
        "What's her experience with chatbots?"
      ];
    }

    return [
      "What sets her apart as a PM?",
      "How does she approach product strategy?",
      "What's her leadership style?",
      "What are her biggest achievements?"
    ];
  }
}

export const knowledgeSearchEngine = new KnowledgeSearchEngine();