import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Message, AIConfig, ConversationSettings, APIKeys } from '@/types/chat';
import { PRESET_TOPICS } from '@/constants/chat';

export function useConversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [conversationStartTime, setConversationStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const conversationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    messagesRef.current = messages;
    scrollToBottom();
  }, [messages]);

  // Real AI API calls
  const callOpenAI = async (config: AIConfig, messages: { role: string; content: string }[], apiKeys: APIKeys): Promise<string> => {
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

  const generateAIResponse = async (
    sender: 'ai-x' | 'ai-gpt', 
    conversationHistory: Message[], 
    settings: ConversationSettings,
    aiXConfig: AIConfig,
    aiGPTConfig: AIConfig,
    apiKeys: APIKeys
  ): Promise<string> => {
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
      return await callOpenAI(config, apiMessages, apiKeys);
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

  const startConversationLoop = (
    settings: ConversationSettings,
    aiXConfig: AIConfig,
    aiGPTConfig: AIConfig,
    apiKeys: APIKeys
  ) => {
    // Clear any existing interval
    if (conversationIntervalRef.current) {
      clearInterval(conversationIntervalRef.current);
    }
    
    const continueConversation = async () => {
      if (!isConversationActive) {
        return;
      }
      
      const currentMessages = messagesRef.current.filter(m => !m.isTyping);
      
      // Check stop conditions
      if (settings.stopCondition === 'messages' && currentMessages.length >= settings.messageLimit) {
        handleStopConversation();
        return;
      }
      
      // Get the last real message (not typing)
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (!lastMessage) {
        // Schedule next check if no messages yet
        conversationIntervalRef.current = setTimeout(continueConversation, 2000);
        return;
      }
      
      // Determine next sender
      const nextSender = lastMessage.sender === 'ai-x' ? 'ai-gpt' : 'ai-x';
      
      // Generate response immediately
      const response = await generateAIResponse(nextSender, currentMessages, settings, aiXConfig, aiGPTConfig, apiKeys);
      simulateTypingWithContent(nextSender, response);
      
      // Schedule next conversation turn after typing finishes
      conversationIntervalRef.current = setTimeout(continueConversation, 6000); // Wait for typing to complete + delay
    };
    
    // Start the conversation loop after first message
    conversationIntervalRef.current = setTimeout(continueConversation, 4000);
  };

  const handleStartConversation = async (
    settings: ConversationSettings,
    customTopic: string,
    apiKeys: APIKeys,
    aiXConfig: AIConfig,
    aiGPTConfig: AIConfig
  ) => {
    if (isConversationActive) return;
    
    if (settings.useRealAI && !apiKeys.openaiKey) {
      toast.error("Please provide API keys to use real AI");
      return false;
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
      const response = await generateAIResponse(settings.firstSpeaker, [], settings, aiXConfig, aiGPTConfig, apiKeys);
      simulateTypingWithContent(settings.firstSpeaker, response || initialPrompt);
    }, 1000);
    
    startConversationLoop(settings, aiXConfig, aiGPTConfig, apiKeys);
    return true;
  };

  const handleStopConversation = () => {
    setIsConversationActive(false);
    setConversationStartTime(null);
    if (conversationIntervalRef.current) {
      clearTimeout(conversationIntervalRef.current);
      conversationIntervalRef.current = null;
    }
    toast.info("Conversation stopped.");
  };

  const handleUserMessage = (userInput: string, setUserInput: (input: string) => void) => {
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

  return {
    messages,
    isConversationActive,
    conversationStartTime,
    elapsedTime,
    setElapsedTime,
    messagesEndRef,
    handleStartConversation,
    handleStopConversation,
    handleUserMessage
  };
}