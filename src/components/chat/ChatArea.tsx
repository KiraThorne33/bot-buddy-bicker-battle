import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Zap, Brain, ArrowRight } from 'lucide-react';
import { ConversationMessage } from '@/components/ConversationMessage';
import { Message, ConversationSettings } from '@/types/chat';

interface ChatAreaProps {
  messages: Message[];
  settings: ConversationSettings;
  isConversationActive: boolean;
  userInput: string;
  setUserInput: (input: string) => void;
  handleUserMessage: () => void;
}

export function ChatArea({ 
  messages, 
  settings, 
  isConversationActive, 
  userInput, 
  setUserInput, 
  handleUserMessage 
}: ChatAreaProps) {
  if (settings.starter === 'thinktank') {
    return (
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
    );
  }

  return (
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
  );
}