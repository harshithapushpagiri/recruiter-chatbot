import React, { useState, useEffect, useRef } from 'react';
import { User, Bot, Download, ExternalLink, Sparkles, Briefcase, Key, AlertCircle, Database, MessageSquare, Menu, X, Home, FileText, Folder, Settings, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import { AIAgentOrchestrator } from './services/AIAgentOrchestrator';
import { databaseService } from './services/DatabaseService';
import { ChatInterface } from './components/ChatInterface';
import { resumeData } from './data/knowledgeBase';
import { v4 as uuidv4 } from 'uuid';

type ActiveTab = 'chat' | 'profile' | 'projects' | 'experience';

function App() {
  const [aiOrchestrator, setAiOrchestrator] = useState<AIAgentOrchestrator | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [sessionId] = useState(() => uuidv4());
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Initialize AI orchestrator and database
  useEffect(() => {
    const initializeServices = async () => {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        setApiKeyError('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
        return;
      }

      if (!apiKey.startsWith('sk-')) {
        setApiKeyError('Invalid OpenAI API key format. API key should start with "sk-".');
        return;
      }

      try {
        const orchestrator = new AIAgentOrchestrator(apiKey);
        setAiOrchestrator(orchestrator);
        setApiKeyError(null);
        
        // Initialize chat session in database
        await databaseService.createChatSession(sessionId);
        
        // Check semantic search status periodically
        const checkSemanticSearch = () => {
          if (orchestrator) {
            setSemanticSearchEnabled(orchestrator.isSemanticSearchEnabled());
          }
        };
        
        checkSemanticSearch();
        const interval = setInterval(checkSemanticSearch, 2000);
        
        console.log('✅ Services initialized successfully');
        
        return () => clearInterval(interval);
      } catch (error) {
        setApiKeyError('Failed to initialize AI system. Please check your API key.');
      }
    };

    initializeServices();
  }, [sessionId]);

  // Check if scroll buttons should be shown
  useEffect(() => {
    const checkScrollButtons = () => {
      const container = contentContainerRef.current;
      if (container && (activeTab === 'experience' || activeTab === 'projects' || activeTab === 'profile')) {
        const { scrollHeight, clientHeight } = container;
        setShowScrollButtons(scrollHeight > clientHeight + 50); // Add some buffer
      } else {
        setShowScrollButtons(false);
      }
    };

    checkScrollButtons();
    
    const container = contentContainerRef.current;
    if (container) {
      const handleScroll = () => checkScrollButtons();
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', checkScrollButtons);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [activeTab]);

  const scrollToTop = () => {
    contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const container = contentContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  const scrollUp = () => {
    const container = contentContainerRef.current;
    if (container) {
      container.scrollBy({ top: -400, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    const container = contentContainerRef.current;
    if (container) {
      container.scrollBy({ top: 400, behavior: 'smooth' });
    }
  };

  // API Key Error Display
  if (apiKeyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-red-500/30 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">API Configuration Required</h2>
            <p className="text-red-300 mb-4">{apiKeyError}</p>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
            <h3 className="text-white font-semibold mb-3">Setup Instructions:</h3>
            <ol className="text-slate-300 space-y-2 text-sm">
              <li>1. Open the <code className="bg-slate-700 px-2 py-1 rounded">.env</code> file in your project root</li>
              <li>2. Replace <code className="bg-slate-700 px-2 py-1 rounded">your_openai_api_key_here</code> with your actual OpenAI API key</li>
              <li>3. Your API key should start with <code className="bg-slate-700 px-2 py-1 rounded">sk-</code></li>
              <li>4. Save the file and refresh this page</li>
            </ol>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Need an API key?</strong> Get one from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'chat' as ActiveTab, label: 'AI Chat', icon: MessageSquare },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User },
    { id: 'projects' as ActiveTab, label: 'AI Side Projects', icon: Folder },
    { id: 'experience' as ActiveTab, label: 'Experience', icon: Briefcase },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return aiOrchestrator ? (
          <ChatInterface 
            aiOrchestrator={aiOrchestrator} 
            sessionId={sessionId}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-white">Initializing AI system...</p>
              <p className="text-slate-400 text-sm mt-2">Setting up semantic search capabilities...</p>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div 
            ref={contentContainerRef}
            className="h-full overflow-y-auto p-4 lg:p-8"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 mb-6 lg:mb-8">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{resumeData.personalInfo.name}</h1>
                    <p className="text-lg lg:text-xl text-blue-300 mb-1 lg:mb-2">{resumeData.personalInfo.title}</p>
                    <p className="text-sm lg:text-base text-slate-300">{resumeData.personalInfo.yearsExperience}+ years experience • {resumeData.personalInfo.location}</p>
                  </div>
                </div>
                
                <div className="mb-6 lg:mb-8">
                  <h2 className="text-lg lg:text-xl font-bold text-white mb-3 lg:mb-4">About</h2>
                  <p className="text-sm lg:text-base text-slate-300 leading-relaxed">{resumeData.personalInfo.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-sm lg:text-base text-white font-semibold mb-3">Technical Skills</h3>
                    <div className="space-y-2">
                      {resumeData.skills.technical.slice(0, 5).map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-slate-300 text-xs lg:text-sm">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-sm lg:text-base text-white font-semibold mb-3">Product Skills</h3>
                    <div className="space-y-2">
                      {resumeData.skills.product.slice(0, 5).map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          <span className="text-slate-300 text-xs lg:text-sm">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-sm lg:text-base text-white font-semibold mb-3">Leadership</h3>
                    <div className="space-y-2">
                      {resumeData.skills.leadership.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-slate-300 text-xs lg:text-sm">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
                  <button 
                    onClick={() => {
                      // Open Google Drive file in new tab for download
                      const driveFileId = '1INODND2fKNap4KRShZb7JGKugUxoOpCZ';
                      const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
                      window.open(downloadUrl, '_blank');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </button>
                  <button 
                    onClick={() => {
                      window.open('https://selective-quark-99a.notion.site/Harshitha-s-Portfolio-1e6e8e19903d80b1b3eec23b9a081e80', '_blank');
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Portfolio
                  </button>
                </div>
                
                {/* Contact Information */}
                <div className="pt-6 lg:pt-8 border-t border-white/20">
                  <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-sm lg:text-base text-white font-semibold mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📞</span>
                        </div>
                        Phone
                      </h3>
                      <a 
                        href="tel:+918985662239" 
                        className="text-green-300 hover:text-green-200 transition-colors duration-200 text-sm lg:text-base"
                      >
                        +91 8985662239
                      </a>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-sm lg:text-base text-white font-semibold mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✉️</span>
                        </div>
                        Email
                      </h3>
                      <a 
                        href="mailto:harshithap20@iimb.ac.in" 
                        className="text-blue-300 hover:text-blue-200 transition-colors duration-200 text-sm lg:text-base break-all"
                      >
                        harshithap20@iimb.ac.in
                      </a>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-sm lg:text-base text-white font-semibold mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">💼</span>
                        </div>
                        LinkedIn
                      </h3>
                      <a 
                        href="https://www.linkedin.com/in/harshitha-p-991776149/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200 transition-colors duration-200 flex items-center gap-1 text-sm lg:text-base"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div 
            ref={contentContainerRef}
            className="h-full overflow-y-auto p-4 lg:p-8"
          >
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3 lg:mb-4">AI Projects & Impact</h1>
                <p className="text-sm lg:text-base text-slate-300">AI-powered projects and automation solutions across different domains</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 lg:p-6 shadow-2xl">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Folder className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg lg:text-xl font-bold text-white mb-2">{project.name}</h3>
                        <p className="text-sm lg:text-base text-slate-300 mb-4">{project.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm lg:text-base text-white font-semibold mb-2">Impact</h4>
                      <p className="text-sm lg:text-base text-green-300">{project.impact}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm lg:text-base text-white font-semibold mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="bg-blue-600/20 text-blue-300 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Deployment Link */}
                    {project.deploymentLink && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <button
                          onClick={() => window.open(project.deploymentLink, '_blank')}
                          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base w-full sm:w-auto"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Live Demo
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'experience':
        return (
          <div 
            ref={contentContainerRef}
            className="h-full overflow-y-auto p-4 lg:p-8"
          >
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3 lg:mb-4">Professional Experience</h1>
                <p className="text-sm lg:text-base text-slate-300">Career journey across different companies and roles</p>
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 lg:p-6 shadow-2xl">
                    <div className="flex items-start gap-4 mb-4 lg:mb-6">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg lg:text-xl font-bold text-white mb-1">{exp.role}</h3>
                        <p className="text-sm lg:text-base text-blue-300 font-semibold mb-1">{exp.company}</p>
                        <p className="text-xs lg:text-sm text-slate-400">{exp.duration}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4 lg:mb-6">
                      <h4 className="text-sm lg:text-base text-white font-semibold mb-3">Key Achievements</h4>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-xs lg:text-sm text-slate-300">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm lg:text-base text-white font-semibold mb-2">Technologies & Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="bg-teal-600/20 text-teal-300 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10"></div>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 lg:block">
          <div className="px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Brand */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg lg:text-xl font-bold text-white">Chat with {resumeData.personalInfo.name.split(' ')[0]}</h1>
                  <p className="text-xs text-slate-400 hidden lg:block">AI-Powered Assistant</p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="hidden lg:flex items-center gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* System Status */}
              <div className="hidden xl:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">AI System Active</span>
                </div>
                <div className="flex items-center gap-2">
                  {semanticSearchEnabled ? (
                    <>
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm">Semantic Search</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm">Keyword Search</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm">
                    {databaseService.isSupabaseConfigured() ? 'Cloud DB' : 'Local Storage'}
                  </span>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
              >
                {sidebarOpen ? <X className="w-4 h-4 lg:w-5 lg:h-5" /> : <Menu className="w-4 h-4 lg:w-5 lg:h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden bg-white/10 backdrop-blur-lg border-b border-white/20">
            <div className="px-4 lg:px-6 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1">
            {renderContent()}
          </div>

          {/* Scroll Navigation Sidebar - Only show for content sections */}
          {showScrollButtons && activeTab !== 'chat' && (
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
                <p className="text-slate-500 text-xs capitalize">{activeTab}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;