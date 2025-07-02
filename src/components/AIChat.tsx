import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Square, Settings, Download, Zap, Brain } from 'lucide-react';
import { ConversationMessage } from './ConversationMessage';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'ai-x' | 'ai-gpt';
  timestamp: Date;
  isTyping?: boolean;
}

interface ConversationSettings {
  starter: 'topic' | 'freestyle' | 'roleplay' | 'story' | 'questions';
  stopCondition: 'manual' | 'messages' | 'time' | 'sentiment';
  messageLimit: number;
  timeLimit: number;
  topic?: string;
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
    topic: PRESET_TOPICS[0]
  });
  const [customTopic, setCustomTopic] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [conversationStartTime, setConversationStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
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

  const handleStartConversation = () => {
    if (isConversationActive) return;
    
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
    }
    
    // Start with AI-X
    setTimeout(() => {
      simulateTyping('ai-x', initialPrompt);
    }, 1000);
    
    // Continue conversation
    setTimeout(() => {
      simulateTyping('ai-gpt', generateMockResponse('ai-gpt', initialPrompt));
    }, 4000);
    
    startConversationLoop();
  };

  const startConversationLoop = () => {
    let conversationInterval: NodeJS.Timeout;
    
    const continueConversation = () => {
      if (!isConversationActive) {
        if (conversationInterval) clearTimeout(conversationInterval);
        return;
      }
      
      // Check stop conditions
      const realMessages = messages.filter(m => !m.isTyping);
      if (settings.stopCondition === 'messages' && realMessages.length >= settings.messageLimit) {
        handleStopConversation();
        return;
      }
      
      // Get the last real message (not typing)
      const lastMessage = realMessages[realMessages.length - 1];
      if (!lastMessage) {
        // Schedule next check
        conversationInterval = setTimeout(continueConversation, 2000);
        return;
      }
      
      // Determine next sender
      const nextSender = lastMessage.sender === 'ai-x' ? 'ai-gpt' : 'ai-x';
      const response = generateMockResponse(nextSender, lastMessage.content);
      
      // Add some randomness to response timing
      const responseDelay = 3000 + Math.random() * 4000; // 3-7 seconds
      
      setTimeout(() => {
        simulateTyping(nextSender, response);
        
        // Schedule next conversation turn
        conversationInterval = setTimeout(continueConversation, responseDelay + 4000);
      }, responseDelay);
    };
    
    // Start the conversation loop
    conversationInterval = setTimeout(continueConversation, 8000); // Start after initial messages
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

        {/* Chat Area */}
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
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}