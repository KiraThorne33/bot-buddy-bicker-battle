import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Square, Settings, Download, Zap, Brain, Key, ArrowRight } from 'lucide-react';
import { ConversationMessage } from './ConversationMessage';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'ai-x' | 'ai-gpt' | 'user';
  timestamp: Date;
  isTyping?: boolean;
}

interface AIConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface ConversationSettings {
  starter: 'topic' | 'freestyle' | 'roleplay' | 'story' | 'questions' | 'thinktank';
  stopCondition: 'manual' | 'messages' | 'time' | 'sentiment';
  messageLimit: number;
  timeLimit: number;
  topic?: string;
  firstSpeaker: 'ai-x' | 'ai-gpt';
  useRealAI: boolean;
}

interface APIKeys {
  openaiKey: string;
  xApiKey: string;
}

const PRESET_TOPICS = [
  "Is pineapple on pizza acceptable?",
  "Should AI have rights?",
  "Is remote work better than office work?",
  "Are electric cars truly better for the environment?",
  "Should social media be regulated?",
  "Is cryptocurrency the future of money?",
  "Should we colonize Mars?",
  "Is artificial intelligence dangerous?",
  "Should video games be considered art?",
  "Is traditional education obsolete?"
];

const ROLEPLAY_SCENARIOS = [
  "Philosopher vs Comedian",
  "Scientist vs Artist", 
  "Optimist vs Pessimist",
  "Time Traveler from Past vs Future",
  "Detective vs Criminal Mastermind",
  "Teacher vs Student",
  "Alien vs Human",
  "Robot vs Environmentalist"
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [settings, setSettings] = useState<ConversationSettings>({
    starter: 'topic',
    stopCondition: 'manual',
    messageLimit: 20,
    timeLimit: 10,
    topic: PRESET_TOPICS[0],
    firstSpeaker: 'ai-x',
    useRealAI: false
  });
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openaiKey: '',
    xApiKey: ''
  });
  const [aiXConfig, setAiXConfig] = useState<AIConfig>({
    model: 'gpt-4o-mini',
    systemPrompt: 'You are AI-X, a social intelligence AI that analyzes trends, social media patterns, and public discourse. You have a dynamic, data-driven personality and often reference current social trends and online conversations.',
    temperature: 0.8,
    maxTokens: 200
  });
  const [aiGPTConfig, setAiGPTConfig] = useState<AIConfig>({
    model: 'gpt-4o',
    systemPrompt: 'You are AI-GPT, a reasoning engine that approaches problems with deep philosophical thinking. You enjoy exploring the complexity of ideas, ethical frameworks, and connecting topics to broader questions about human nature and society.',
    temperature: 0.7,
    maxTokens: 200
  });
  const [customTopic, setCustomTopic] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [conversationStartTime, setConversationStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConversationActive && conversationStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - conversationStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        
        if (settings.stopCondition === 'time' && elapsed >= settings.timeLimit * 60) {
          handleStopConversation();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConversationActive, conversationStartTime, settings.stopCondition, settings.timeLimit]);

  const simulateTyping = (sender: 'ai-x' | 'ai-gpt', content: string) => {
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      content: '',
      sender,
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));
      
      const finalMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, finalMessage]);
    }, 1500 + Math.random() * 2000);
  };

  // Real AI API calls
  const callOpenAI = async (config: AIConfig, messages: { role: string; content: string }[]): Promise<string> => {
    if (!apiKeys.openaiKey) {
      throw new Error('OpenAI API key not provided');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeys.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: config.systemPrompt },
            ...messages
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I couldn't generate a response.";
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "Sorry, I encountered an error. Using fallback response.";
    }
  };

  const generateAIResponse = async (sender: 'ai-x' | 'ai-gpt', conversationHistory: Message[]): Promise<string> => {
    if (!settings.useRealAI) {
      return generateMockResponse(sender, conversationHistory[conversationHistory.length - 1]?.content || '');
    }

    const config = sender === 'ai-x' ? aiXConfig : aiGPTConfig;
    const apiMessages = conversationHistory
      .filter(m => !m.isTyping)
      .slice(-10) // Last 10 messages for context
      .map(m => ({
        role: m.sender === sender ? 'assistant' : 'user',
        content: m.content
      }));

    try {
      // For now, both use OpenAI API with different models/prompts
      // You can implement X API integration here later
      return await callOpenAI(config, apiMessages);
    } catch (error) {
      toast.error(`Failed to get ${sender} response, using fallback`);
      return generateMockResponse(sender, conversationHistory[conversationHistory.length - 1]?.content || '');
    }
  };

  const generateMockResponse = (sender: 'ai-x' | 'ai-gpt', context: string) => {
    const responses = {
      'ai-x': [
        `Interesting perspective! From my analysis of social trends, I'd argue that ${context.toLowerCase()} represents a fundamental shift in how we approach modern problems.`,
        `That's a fascinating point. Based on real-time data I'm seeing, there's actually a growing movement that suggests the opposite might be true.`,
        `I appreciate the nuance in your argument. However, looking at current conversations online, most people seem to be leaning toward a more balanced approach.`,
        `You raise valid concerns. What's intriguing is how this topic has evolved in public discourse over the past few months - the sentiment has shifted dramatically.`,
        `That's quite thought-provoking! From what I'm observing in social media patterns, this issue touches on deeper philosophical questions about human nature.`
      ],
      'ai-gpt': [
        `That's a compelling argument! I find myself drawn to the complexity of this issue. Perhaps we could explore the underlying assumptions that shape our perspectives here.`,
        `Your point resonates with some fascinating philosophical frameworks. It reminds me of the tension between utilitarian and deontological approaches to ethics.`,
        `I'm intrigued by the implications of your reasoning. This seems to connect to broader questions about progress, tradition, and how we define value in society.`,
        `There's something beautifully paradoxical about this topic. On one hand, logic suggests one approach, but human experience often tells a different story.`,
        `Your perspective opens up interesting questions about the nature of truth and consensus. How do we balance individual agency with collective wisdom?`
      ]
    };
    
    return responses[sender][Math.floor(Math.random() * responses[sender].length)];
  };

  const handleStartConversation = async () => {
    if (isConversationActive) return;
    
    if (settings.useRealAI && !apiKeys.openaiKey) {
      toast.error("Please provide API keys to use real AI");
      setShowAIConfig(true);
      return;
    }
    
    setMessages([]);
    setIsConversationActive(true);
    setConversationStartTime(new Date());
    setElapsedTime(0);
    
    const topic = customTopic || settings.topic || PRESET_TOPICS[0];
    toast.success("Conversation started! Watch the AIs begin their dialogue.");
    
    // Initial message based on starter type
    let initialPrompt = '';
    switch (settings.starter) {
      case 'topic':
        initialPrompt = `Let's discuss: ${topic}`;
        break;
      case 'freestyle':
        initialPrompt = "Hello there! What's on your mind today?";
        break;
      case 'roleplay':
        initialPrompt = `I'll be playing the role we discussed. What's your character's opening move?`;
        break;
      case 'story':
        initialPrompt = "Once upon a time, in a world not so different from ours...";
        break;
      case 'questions':
        initialPrompt = "I have a curious question for you: What's the most important decision you've ever had to make?";
        break;
      case 'thinktank':
        initialPrompt = `Let's discuss: ${topic}. What are your initial thoughts?`;
        break;
    }
    
    // Start with selected first speaker
    setTimeout(async () => {
      const response = await generateAIResponse(settings.firstSpeaker, []);
      simulateTypingWithContent(settings.firstSpeaker, response || initialPrompt);
    }, 1000);
    
    startConversationLoop();
  };

  const simulateTypingWithContent = (sender: 'ai-x' | 'ai-gpt', content: string) => {
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      content: '',
      sender,
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));
      
      const finalMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, finalMessage]);
    }, 1500 + Math.random() * 2000);
  };

  const startConversationLoop = () => {
    const continueConversation = () => {
      if (!isConversationActive) {
        return;
      }
      
      // Check stop conditions
      setMessages(current => {
        const realMessages = current.filter(m => !m.isTyping);
        if (settings.stopCondition === 'messages' && realMessages.length >= settings.messageLimit) {
          handleStopConversation();
          return current;
        }
        
        // Get the last real message (not typing)
        const lastMessage = realMessages[realMessages.length - 1];
        if (!lastMessage) {
          // Schedule next check
          setTimeout(continueConversation, 2000);
          return current;
        }
        
        // Determine next sender
        const nextSender = lastMessage.sender === 'ai-x' ? 'ai-gpt' : 'ai-x';
        
        // Add some randomness to response timing
        const responseDelay = 3000 + Math.random() * 4000; // 3-7 seconds
        
        setTimeout(async () => {
          if (!isConversationActive) return;
          const response = await generateAIResponse(nextSender, realMessages);
          simulateTypingWithContent(nextSender, response);
          
          // Schedule next conversation turn
          setTimeout(continueConversation, responseDelay + 4000);
        }, responseDelay);
        
        return current;
      });
    };
    
    // Start the conversation loop
    setTimeout(continueConversation, 5000); // Start after initial messages
  };

  const handleStopConversation = () => {
    setIsConversationActive(false);
    setConversationStartTime(null);
    toast.info("Conversation stopped.");
  };

  const exportConversation = () => {
    const conversationText = messages
      .filter(m => !m.isTyping)
      .map(m => `${m.sender === 'ai-x' ? 'AI-X' : 'AI-GPT'}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUserMessage = () => {
    if (!userInput.trim() || !isConversationActive) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: userInput,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
                AI vs AI Chat Arena
              </h1>
              <p className="text-muted-foreground">
                Watch two AI personalities engage in conversation
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {isConversationActive && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Live: {formatTime(elapsedTime)}
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportConversation}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIConfig(!showAIConfig)}
                className={settings.useRealAI ? "border-ai-x text-ai-x" : ""}
              >
                <Key className="w-4 h-4 mr-2" />
                AI Config
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleStartConversation}
              disabled={isConversationActive}
              className="bg-gradient-ai-x hover:bg-ai-x/80"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Conversation
            </Button>
            
            <Button
              onClick={handleStopConversation}
              disabled={!isConversationActive}
              variant="destructive"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
            
            {settings.starter === 'topic' && (
              <Input
                placeholder="Enter custom topic or select preset..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="max-w-md"
              />
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4">Conversation Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Conversation Starter</label>
                <Select value={settings.starter} onValueChange={(value: any) => setSettings({...settings, starter: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="topic">Topic Debate</SelectItem>
                    <SelectItem value="freestyle">Freestyle Chat</SelectItem>
                    <SelectItem value="roleplay">Role Playing</SelectItem>
                    <SelectItem value="story">Story Building</SelectItem>
                    <SelectItem value="questions">Question Tennis</SelectItem>
                    <SelectItem value="thinktank">Thinktank Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Stop Condition</label>
                <Select value={settings.stopCondition} onValueChange={(value: any) => setSettings({...settings, stopCondition: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Stop</SelectItem>
                    <SelectItem value="messages">Message Limit</SelectItem>
                    <SelectItem value="time">Time Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {settings.stopCondition === 'messages' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Message Limit: {settings.messageLimit}</label>
                  <Slider
                    value={[settings.messageLimit]}
                    onValueChange={([value]) => setSettings({...settings, messageLimit: value})}
                    max={50}
                    min={5}
                    step={1}
                  />
                </div>
              )}
              
              {settings.stopCondition === 'time' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Limit: {settings.timeLimit}min</label>
                  <Slider
                    value={[settings.timeLimit]}
                    onValueChange={([value]) => setSettings({...settings, timeLimit: value})}
                    max={60}
                    min={1}
                    step={1}
                  />
                </div>
              )}
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">First Speaker</label>
                <Select value={settings.firstSpeaker} onValueChange={(value: any) => setSettings({...settings, firstSpeaker: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-x">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-ai-x" />
                        AI-X (Social Intelligence)
                      </div>
                    </SelectItem>
                    <SelectItem value="ai-gpt">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-ai-gpt" />
                        AI-GPT (Reasoning Engine)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">AI Mode</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={settings.useRealAI ? "outline" : "default"}
                    size="sm"
                    onClick={() => setSettings({...settings, useRealAI: false})}
                  >
                    Mock AI
                  </Button>
                  <Button
                    variant={settings.useRealAI ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings({...settings, useRealAI: true})}
                    className={settings.useRealAI ? "bg-ai-x text-ai-x-foreground" : ""}
                  >
                    Real AI
                  </Button>
                </div>
              </div>
            </div>
            
            {settings.starter === 'topic' && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Preset Topics</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TOPICS.map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomTopic(topic)}
                      className="text-xs"
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {settings.starter === 'roleplay' && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Roleplay Scenarios</label>
                <div className="flex flex-wrap gap-2">
                  {ROLEPLAY_SCENARIOS.map((scenario) => (
                    <Button
                      key={scenario}
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomTopic(scenario)}
                      className="text-xs"
                    >
                      {scenario}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* AI Configuration Panel */}
        {showAIConfig && (
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
            
            {/* API Keys Section */}
            <div className="mb-6 p-4 border border-border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Keys
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={apiKeys.openaiKey}
                    onChange={(e) => setApiKeys({...apiKeys, openaiKey: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="x-key">X API Key (Optional)</Label>
                  <Input
                    id="x-key"
                    type="password"
                    placeholder="For future X integration..."
                    value={apiKeys.xApiKey}
                    onChange={(e) => setApiKeys({...apiKeys, xApiKey: e.target.value})}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* AI-X Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 border border-ai-x/30 rounded-lg bg-ai-x/5">
                <h4 className="font-medium mb-3 text-ai-x flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AI-X Configuration
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <Label>Model</Label>
                    <Select value={aiXConfig.model} onValueChange={(value) => setAiXConfig({...aiXConfig, model: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o (Best)</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Temperature: {aiXConfig.temperature}</Label>
                    <Slider
                      value={[aiXConfig.temperature]}
                      onValueChange={([value]) => setAiXConfig({...aiXConfig, temperature: value})}
                      max={2}
                      min={0}
                      step={0.1}
                    />
                  </div>
                  
                  <div>
                    <Label>Max Tokens: {aiXConfig.maxTokens}</Label>
                    <Slider
                      value={[aiXConfig.maxTokens]}
                      onValueChange={([value]) => setAiXConfig({...aiXConfig, maxTokens: value})}
                      max={500}
                      min={50}
                      step={25}
                    />
                  </div>
                  
                  <div>
                    <Label>System Prompt</Label>
                    <Textarea
                      value={aiXConfig.systemPrompt}
                      onChange={(e) => setAiXConfig({...aiXConfig, systemPrompt: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* AI-GPT Configuration */}
              <div className="p-4 border border-ai-gpt/30 rounded-lg bg-ai-gpt/5">
                <h4 className="font-medium mb-3 text-ai-gpt flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI-GPT Configuration
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <Label>Model</Label>
                    <Select value={aiGPTConfig.model} onValueChange={(value) => setAiGPTConfig({...aiGPTConfig, model: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o (Best)</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Temperature: {aiGPTConfig.temperature}</Label>
                    <Slider
                      value={[aiGPTConfig.temperature]}
                      onValueChange={([value]) => setAiGPTConfig({...aiGPTConfig, temperature: value})}
                      max={2}
                      min={0}
                      step={0.1}
                    />
                  </div>
                  
                  <div>
                    <Label>Max Tokens: {aiGPTConfig.maxTokens}</Label>
                    <Slider
                      value={[aiGPTConfig.maxTokens]}
                      onValueChange={([value]) => setAiGPTConfig({...aiGPTConfig, maxTokens: value})}
                      max={500}
                      min={50}
                      step={25}
                    />
                  </div>
                  
                  <div>
                    <Label>System Prompt</Label>
                    <Textarea
                      value={aiGPTConfig.systemPrompt}
                      onChange={(e) => setAiGPTConfig({...aiGPTConfig, systemPrompt: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Chat Area */}
        {settings.starter === 'thinktank' ? (
          <div className="space-y-4">
            {/* AI Models in separate columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
              {/* AI-X Side */}
              <Card className="flex flex-col">
                <div className="p-4 border-b border-border bg-gradient-ai-x/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-ai-x flex items-center justify-center">
                      <Zap className="w-4 h-4 text-ai-x-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ai-x">AI-X</h3>
                      <p className="text-xs text-muted-foreground">Social Intelligence</p>
                    </div>
                    {isConversationActive && (
                      <Badge variant="secondary" className="ml-auto bg-ai-x/20 text-ai-x animate-pulse">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(msg => msg.sender === 'ai-x')
                    .map(message => (
                      <ConversationMessage 
                        key={message.id} 
                        message={message} 
                        sender="ai-x" 
                      />
                    ))}
                </div>
              </Card>

              {/* AI-GPT Side */}
              <Card className="flex flex-col">
                <div className="p-4 border-b border-border bg-gradient-ai-gpt/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-ai-gpt flex items-center justify-center">
                      <Brain className="w-4 h-4 text-ai-gpt-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ai-gpt">AI-GPT</h3>
                      <p className="text-xs text-muted-foreground">Reasoning Engine</p>
                    </div>
                    {isConversationActive && (
                      <Badge variant="secondary" className="ml-auto bg-ai-gpt/20 text-ai-gpt animate-pulse">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(msg => msg.sender === 'ai-gpt')
                    .map(message => (
                      <ConversationMessage 
                        key={message.id} 
                        message={message} 
                        sender="ai-gpt" 
                      />
                    ))}
                </div>
              </Card>
            </div>
            
            {/* Full conversation view with user input */}
            <Card className="h-[400px] flex flex-col">
              <div className="p-4 border-b border-border bg-gradient-cosmic/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-cosmic flex items-center justify-center">
                    <Zap className="w-4 h-4 text-cosmic-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Full Discussion</h3>
                    <p className="text-xs text-muted-foreground">Complete conversation thread</p>
                  </div>
                  {isConversationActive && (
                    <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary animate-pulse">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <ConversationMessage 
                    key={message.id} 
                    message={message} 
                    sender={message.sender} 
                  />
                ))}
              </div>
              
              {/* User Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary-foreground">YOU</span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Share your thoughts, challenge them, or ask questions..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUserMessage()}
                      disabled={!isConversationActive}
                    />
                    <Button
                      onClick={handleUserMessage}
                      disabled={!userInput.trim() || !isConversationActive}
                      size="sm"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            {/* AI-X Side */}
          <Card className="flex flex-col">
            <div className="p-4 border-b border-border bg-gradient-ai-x/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-ai-x flex items-center justify-center">
                  <Zap className="w-4 h-4 text-ai-x-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-ai-x">AI-X</h3>
                  <p className="text-xs text-muted-foreground">Social Intelligence</p>
                </div>
                {isConversationActive && (
                  <Badge variant="secondary" className="ml-auto bg-ai-x/20 text-ai-x animate-pulse">
                    Active
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(msg => msg.sender === 'ai-x')
                .map(message => (
                  <ConversationMessage 
                    key={message.id} 
                    message={message} 
                    sender="ai-x" 
                  />
                ))}
            </div>
          </Card>

          {/* AI-GPT Side */}
          <Card className="flex flex-col">
            <div className="p-4 border-b border-border bg-gradient-ai-gpt/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-ai-gpt flex items-center justify-center">
                  <Brain className="w-4 h-4 text-ai-gpt-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-ai-gpt">AI-GPT</h3>
                  <p className="text-xs text-muted-foreground">Reasoning Engine</p>
                </div>
                {isConversationActive && (
                  <Badge variant="secondary" className="ml-auto bg-ai-gpt/20 text-ai-gpt animate-pulse">
                    Active
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(msg => msg.sender === 'ai-gpt')
                .map(message => (
                  <ConversationMessage 
                    key={message.id} 
                    message={message} 
                    sender="ai-gpt" 
                  />
                ))}
            </div>
          </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}