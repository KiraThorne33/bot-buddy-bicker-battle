import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: 'ai-x' | 'ai-gpt' | 'user';
  timestamp: Date;
  isTyping?: boolean;
}

interface ConversationMessageProps {
  message: Message;
  sender: 'ai-x' | 'ai-gpt' | 'user';
}

export function ConversationMessage({ message, sender }: ConversationMessageProps) {
  if (message.isTyping) {
    return (
      <div className="animate-slide-in">
        <div className={`p-4 rounded-lg ${
          sender === 'ai-x' 
            ? 'bg-ai-x/20 border border-ai-x/30' 
            : sender === 'ai-gpt'
            ? 'bg-ai-gpt/20 border border-ai-gpt/30'
            : 'bg-primary/20 border border-primary/30'
        }`}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                sender === 'ai-x' ? 'bg-ai-x' : sender === 'ai-gpt' ? 'bg-ai-gpt' : 'bg-primary'
              }`} />
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                sender === 'ai-x' ? 'bg-ai-x' : sender === 'ai-gpt' ? 'bg-ai-gpt' : 'bg-primary'
              }`} style={{ animationDelay: '0.2s' }} />
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                sender === 'ai-x' ? 'bg-ai-x' : sender === 'ai-gpt' ? 'bg-ai-gpt' : 'bg-primary'
              }`} style={{ animationDelay: '0.4s' }} />
            </div>
            <span className={`text-sm ${
              sender === 'ai-x' ? 'text-ai-x' : sender === 'ai-gpt' ? 'text-ai-gpt' : 'text-primary'
            }`}>
              typing...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-in">
      <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
        sender === 'ai-x' 
          ? 'bg-ai-x/10 border border-ai-x/20 hover:bg-ai-x/20 hover:border-ai-x/40' 
          : sender === 'ai-gpt'
          ? 'bg-ai-gpt/10 border border-ai-gpt/20 hover:bg-ai-gpt/20 hover:border-ai-gpt/40'
          : 'bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40'
      }`}>
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              sender === 'ai-x' ? 'text-ai-x' : sender === 'ai-gpt' ? 'text-ai-gpt' : 'text-primary'
            }`}>
              {sender === 'ai-x' ? 'AI-X' : sender === 'ai-gpt' ? 'AI-GPT' : 'YOU'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <p className="text-foreground leading-relaxed">
          {message.content}
        </p>
        
        <div className={`mt-3 w-full h-0.5 bg-gradient-to-r ${
          sender === 'ai-x' 
            ? 'from-ai-x/50 to-transparent' 
            : sender === 'ai-gpt'
            ? 'from-ai-gpt/50 to-transparent'
            : 'from-primary/50 to-transparent'
        }`} />
      </div>
    </div>
  );
}