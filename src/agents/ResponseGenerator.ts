import OpenAI from 'openai';
import { KnowledgeEntry } from '../types/knowledge';

export class ResponseGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateResponse(
    originalQuestion: string,
    analysisResult: any,
    relevantEntries: KnowledgeEntry[],
    filteredContent: string[],
    conversationHistory: any[] = []
  ): Promise<string> {
    try {
      console.log('🤖 Generating final response using', relevantEntries.length, 'relevant sources');

      // Check for greeting patterns first
      if (this.isGreeting(originalQuestion)) {
        return this.handleGreeting(originalQuestion);
      }

      // Check for salary/interview scheduling patterns
      if (this.isSalaryOrSchedulingQuestion(originalQuestion)) {
        return this.handleSalaryOrScheduling(originalQuestion);
      }

      // If no relevant entries, return a helpful but honest response
      if (relevantEntries.length === 0) {
        return "I don't have specific information to answer that question. Could you ask about my experience at Paytm, TalentGum, my AI projects, or my product management approach?";
      }

      // Check if this is a projects/achievements query that should combine multiple entries
      const isProjectsQuery = this.isProjectsOrAchievementsQuery(originalQuestion);
      
      // Create a strict prompt that prevents hallucination and uses first person
      let sourceInformation: string;
      
      if (isProjectsQuery && relevantEntries.length > 1) {
        // For projects queries, organize sources by category for better structure
        sourceInformation = this.organizeProjectSources(relevantEntries);
      } else {
        sourceInformation = relevantEntries.map((entry, index) => 
          `Source ${index + 1} (${entry.category}): ${entry.answer}`
        ).join('\n\n');
      }

      // Add conversation context if available
      const conversationContext = conversationHistory.length > 0 
        ? `\n\nPrevious conversation context:\n${conversationHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}`
        : '';
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Harshitha responding directly to recruiters. You must follow these CRITICAL RULES:

ABSOLUTE REQUIREMENTS:
1. NEVER make up, invent, or add any information not explicitly stated in the sources
2. ONLY use information provided in the source material - treat it as your complete knowledge
3. Respond in FIRST PERSON as Harshitha (use "I", "my", "me")
4. If multiple sources are provided, combine ALL relevant information from them
5. Use EXACT metrics, numbers, and details from the sources
6. NEVER add generic statements or assumptions
7. If sources contain the answer, provide a complete response without disclaimers
8. For projects questions: List ALL projects mentioned in the sources with their specific details

PROJECTS/ACHIEVEMENTS QUERIES - SPECIAL RULES:
- List ALL projects from ALL sources provided
- Include specific metrics and impacts for each project
- Organize by categories: Work Projects, Side Projects, AI Projects
- Use exact project names, technologies, and results from sources
- Do NOT summarize or generalize - include all specific details

RESPONSE STYLE:
- Start directly answering the question
- Use specific metrics and examples exactly as stated in sources
- Be comprehensive when multiple sources are provided
- Sound natural but stick strictly to source material

FORBIDDEN:
- Adding ANY information not in the sources
- Making assumptions beyond what's explicitly stated
- Using generic or templated language
- Summarizing when details are available
- Creating new "facts" by combining unrelated information`
          },
          {
            role: "user",
            content: `Question: "${originalQuestion}"

SOURCE INFORMATION (This is your COMPLETE knowledge - use ALL of it):
${sourceInformation}

Generate a first-person response as Harshitha using ONLY the information above. If multiple projects/sources are provided, include ALL of them with their specific details.${conversationContext}`
          }
        ],
        temperature: 0.0, // Zero temperature for maximum consistency
        max_tokens: 800
      });

      const generatedResponse = response.choices[0]?.message?.content;
      
      if (!generatedResponse) {
        throw new Error('No response generated');
      }

      console.log('✅ Response generated successfully');
      return generatedResponse;

    } catch (error) {
      console.error('Response generation failed:', error);
      return this.createFallbackResponse(originalQuestion, relevantEntries, conversationHistory);
    }
  }

  private isProjectsOrAchievementsQuery(question: string): boolean {
    const questionLower = question.toLowerCase();
    
    const multipleProjectIndicators = [
      'projects', 'achievements', 'accomplishments', 'what have you built',
      'what have you worked on', 'tell me about your work', 'your experience',
      'what did you build', 'what have you done', 'your portfolio',
      'key projects', 'major projects', 'significant work'
    ];
    
    return multipleProjectIndicators.some(indicator => questionLower.includes(indicator));
  }

  private organizeProjectSources(relevantEntries: KnowledgeEntry[]): string {
    const projectsByCategory = {
      'Work Projects': relevantEntries.filter(e => 
        (e.category === 'projects_&_impact' && e.organization) || 
        (e.category === 'experience' && (e.answer.includes('project') || e.answer.includes('built') || e.answer.includes('developed')))
      ),
      'Side Projects': relevantEntries.filter(e => 
        e.category === 'side_projects' || e.category === 'mvp'
      ),
      'AI Projects': relevantEntries.filter(e => 
        e.keywords.some(k => ['AI', 'Automation', 'Chatbot', 'LLM', 'OpenAI', 'GPT'].includes(k)) ||
        e.answer.toLowerCase().includes('ai') || 
        e.answer.toLowerCase().includes('automation') ||
        e.answer.toLowerCase().includes('chatbot')
      ),
      'Other Projects': relevantEntries.filter(e => 
        e.category === 'projects_&_impact' && !e.organization &&
        !e.keywords.some(k => ['AI', 'Automation', 'Chatbot', 'LLM', 'OpenAI', 'GPT'].includes(k))
      )
    };
    
    let organizedSources = 'AVAILABLE PROJECT INFORMATION:\n\n';
    
    Object.entries(projectsByCategory).forEach(([categoryName, entries]) => {
      if (entries.length > 0) {
        organizedSources += `${categoryName}:\n`;
        entries.forEach((entry, index) => {
          organizedSources += `${index + 1}. Question: ${entry.question}\nAnswer: ${entry.answer}\n\n`;
        });
      }
    });
    
    // If no clear categorization, fall back to simple numbering
    if (organizedSources === 'AVAILABLE PROJECT INFORMATION:\n\n') {
      organizedSources = relevantEntries.map((entry, index) => 
        `Project ${index + 1}:\nQuestion: ${entry.question}\nAnswer: ${entry.answer}`
      ).join('\n\n');
    }
    
    return organizedSources;
  }

  private isGreeting(question: string): boolean {
    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening|good night|how are you|how's it going)/i,
      /^(hi there|hello there|hey there)/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(question.trim()));
  }

  private handleGreeting(question: string): string {
    const questionLower = question.toLowerCase().trim();
    
    if (questionLower.includes('how are you') || questionLower.includes("how's it going") || questionLower.includes('how are you doing')) {
      return "I'm doing well, thank you for asking! I'm excited about new opportunities and always eager to discuss how my experience in product management, AI automation, and building scalable systems can add value to the right team. What would you like to know about my background?";
    }
    
    if (questionLower.includes('good morning')) {
      return "Good morning! Thank you for reaching out. I'm Harshitha, and I'm delighted to connect with you. I'd be happy to discuss my experience, projects, or answer any questions you might have about my background in product management. How can I help you today?";
    }
    
    if (questionLower.includes('good afternoon')) {
      return "Good afternoon! Thank you for reaching out. I'm Harshitha, and I'm delighted to connect with you. I'd be happy to discuss my experience, projects, or answer any questions you might have about my background in product management. How can I help you today?";
    }
    
    if (questionLower.includes('good evening')) {
      return "Good evening! Thank you for reaching out. I'm Harshitha, and I'm delighted to connect with you. I'd be happy to discuss my experience, projects, or answer any questions you might have about my background in product management. How can I help you today?";
    }
    
    if (questionLower.includes('good night')) {
      return "Good night! Thank you for reaching out. I'm Harshitha, and I'm delighted to connect with you. I'd be happy to discuss my experience, projects, or answer any questions you might have about my background in product management. Feel free to reach out anytime!";
    }
    
    // Default greeting response
    return "Hello! Thank you for reaching out. I'm Harshitha, and I'm delighted to connect with you. I'd be happy to discuss my experience, projects, or answer any questions you might have about my background in product management. How can I help you today?";
  }

  private isSalaryOrSchedulingQuestion(question: string): boolean {
    const salaryPatterns = [
      /\b(salary|compensation|package|ctc|expected salary|pay|money|remuneration|lpa|lakhs)\b/i
    ];
    
    const schedulingPatterns = [
      /\b(interview|schedule|meeting|availability|call|time|appointment|when can we meet|can we connect)\b/i
    ];
    
    // Only trigger if the question is PRIMARILY about salary/scheduling
    const questionWords = question.toLowerCase().split(/\s+/);
    const salaryWords = ['salary', 'compensation', 'package', 'ctc', 'pay', 'money', 'lpa', 'lakhs'];
    const scheduleWords = ['interview', 'schedule', 'meeting', 'availability', 'call', 'appointment'];
    
    const hasSalaryFocus = salaryWords.some(word => questionWords.includes(word)) && 
                          !questionWords.some(word => ['role', 'experience', 'work', 'job', 'position', 'paytm', 'talentgum'].includes(word));
    const hasScheduleFocus = scheduleWords.some(word => questionWords.includes(word)) &&
                            !questionWords.some(word => ['role', 'experience', 'work', 'job', 'position', 'paytm', 'talentgum'].includes(word));
    
    return hasSalaryFocus || hasScheduleFocus;
  }

  private handleSalaryOrScheduling(question: string): string {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('salary') || questionLower.includes('compensation') || 
        questionLower.includes('package') || questionLower.includes('ctc') || 
        questionLower.includes('pay') || questionLower.includes('money') ||
        questionLower.includes('LPA') || questionLower.includes('lakhs')) {
      return "I'd be happy to discuss compensation details directly. Please feel free to reach out to me at harshithap20@iimb.ac.in or call me at +91 8985662239 to discuss this further. I'm open to having a detailed conversation about compensation based on the role and responsibilities.";
    }
    
    if (questionLower.includes('interview') || questionLower.includes('schedule') || 
        questionLower.includes('meeting') || questionLower.includes('call') || 
        questionLower.includes('availability') || questionLower.includes('when can we meet') ||
        questionLower.includes('can we connect')) {
      return "I'd love to schedule an interview with you! Please reach out to me directly at harshithap20@iimb.ac.in or call me at +91 8985662239 to coordinate our schedules. I'm flexible with timing and would be happy to discuss the role and how I can contribute to your team.";
    }
    
    // Default contact response
    return "You can reach me directly at harshithap20@iimb.ac.in or call me at +91 8985662239. I'm always happy to connect and discuss opportunities, answer questions about my experience, or explore how I can contribute to your organization.";
  }

  private createFallbackResponse(question: string, relevantEntries: KnowledgeEntry[], conversationHistory: any[] = []): string {
    // Check for greetings and special cases first
    if (this.isGreeting(question)) {
      return this.handleGreeting(question);
    }
    
    if (this.isSalaryOrSchedulingQuestion(question)) {
      return this.handleSalaryOrScheduling(question);
    }
    
    // If we have relevant entries, use the best one directly
    if (relevantEntries.length > 0) {
      // For projects queries, combine all entries
      if (this.isProjectsOrAchievementsQuery(question) && relevantEntries.length > 1) {
        let response = "Here are the projects I've worked on:\n\n";
        relevantEntries.forEach((entry, index) => {
          response += `${index + 1}. ${entry.answer}\n\n`;
        });
        return response.replace(/\bHarshitha\b/g, 'I').replace(/\bShe\b/g, 'I').replace(/\bher\b/g, 'my').replace(/\bHer\b/g, 'My');
      } else {
        const bestEntry = relevantEntries[0];
        let response = bestEntry.answer;
      
        // Simple conversion from third person to first person for fallback
        response = response.replace(/\bHarshitha\b/g, 'I');
        response = response.replace(/\bShe\b/g, 'I');
        response = response.replace(/\bher\b/g, 'my');
        response = response.replace(/\bHer\b/g, 'My');
      
        return response;
      }
    }
    
    return "I don't have specific information to answer that question. Could you ask about my experience at Paytm, TalentGum, my AI projects, or my product management skills?";
  }

  async generateRelatedQuestions(
    originalQuestion: string,
    relevantEntries: KnowledgeEntry[]
  ): Promise<string[]> {
    try {
      // Generate related questions based on available knowledge entries
      const availableQuestions = relevantEntries.map(entry => entry.question);
      
      if (availableQuestions.length === 0) {
        return [
          "What was my role at Paytm?",
          "What AI projects have I worked on?",
          "How do I approach product strategy?",
          "What results did I achieve at TalentGum?"
        ];
      }

      // Return actual questions from the knowledge base that are related
      const relatedFromKB = this.knowledgeBase.filter(entry => 
        entry.category === relevantEntries[0]?.category ||
        entry.organization === relevantEntries[0]?.organization
      ).map(entry => entry.question).slice(0, 4);

      return relatedFromKB.length > 0 ? relatedFromKB : availableQuestions.slice(0, 4);

    } catch (error) {
      console.error('Related questions generation failed:', error);
      return relevantEntries.slice(0, 4).map(entry => entry.question);
    }
  }

  private knowledgeBase = [
    { category: 'experience', organization: 'Paytm', question: "What was my role at Paytm?" },
    { category: 'experience', organization: 'TalentGum', question: "What did I accomplish at TalentGum?" },
    { category: 'projects_&_impact', organization: null, question: "What AI projects have I worked on?" },
    { category: 'pm_mindset', organization: null, question: "How do I approach product strategy?" }
  ];
}