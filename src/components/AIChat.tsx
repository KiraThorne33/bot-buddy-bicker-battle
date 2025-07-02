import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Settings, Download, Key } from 'lucide-react';
import { useConversation } from '@/hooks/useConversation';
import { SettingsPanel } from '@/components/chat/SettingsPanel';
import { AIConfigPanel } from '@/components/chat/AIConfigPanel';
import { ChatArea } from '@/components/chat/ChatArea';
import { formatTime, exportConversation } from '@/utils/chat';
import { ConversationSettings, AIConfig, APIKeys } from '@/types/chat';
import { PRESET_TOPICS } from '@/constants/chat';

export function AIChat() {
  const {
    messages,
    isConversationActive,
    elapsedTime,
    setElapsedTime,
    conversationStartTime,
    messagesEndRef,
    handleStartConversation,
    handleStopConversation,
    handleUserMessage
  } = useConversation();

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
  const [userInput, setUserInput] = useState('');

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

  const onStartConversation = async () => {
    const success = await handleStartConversation(settings, customTopic, apiKeys, aiXConfig, aiGPTConfig);
    if (!success) {
      setShowAIConfig(true);
    }
  };

  const onUserMessage = () => {
    handleUserMessage(userInput, setUserInput);
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
                  onClick={() => exportConversation(messages)}
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
              onClick={onStartConversation}
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
          <SettingsPanel 
            settings={settings}
            setSettings={setSettings}
            setCustomTopic={setCustomTopic}
          />
        )}

        {/* AI Configuration Panel */}
        {showAIConfig && (
          <AIConfigPanel 
            apiKeys={apiKeys}
            setApiKeys={setApiKeys}
            aiXConfig={aiXConfig}
            setAiXConfig={setAiXConfig}
            aiGPTConfig={aiGPTConfig}
            setAiGPTConfig={setAiGPTConfig}
          />
        )}

        {/* Chat Area */}
        <ChatArea 
          messages={messages}
          settings={settings}
          isConversationActive={isConversationActive}
          userInput={userInput}
          setUserInput={setUserInput}
          handleUserMessage={onUserMessage}
        />
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}