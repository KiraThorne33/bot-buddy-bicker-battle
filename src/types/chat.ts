export interface Message {
  id: string;
  content: string;
  sender: 'ai-x' | 'ai-gpt' | 'user';
  timestamp: Date;
  isTyping?: boolean;
}

export interface AIConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface ConversationSettings {
  starter: 'topic' | 'freestyle' | 'roleplay' | 'story' | 'questions' | 'thinktank';
  stopCondition: 'manual' | 'messages' | 'time' | 'sentiment';
  messageLimit: number;
  timeLimit: number;
  topic?: string;
  firstSpeaker: 'ai-x' | 'ai-gpt';
  useRealAI: boolean;
}

export interface APIKeys {
  openaiKey: string;
  xApiKey: string;
}