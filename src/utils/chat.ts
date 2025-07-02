export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const exportConversation = (messages: any[]) => {
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