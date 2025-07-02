import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Key, Zap, Brain } from 'lucide-react';
import { AIConfig, APIKeys } from '@/types/chat';

interface AIConfigPanelProps {
  apiKeys: APIKeys;
  setApiKeys: (keys: APIKeys) => void;
  aiXConfig: AIConfig;
  setAiXConfig: (config: AIConfig) => void;
  aiGPTConfig: AIConfig;
  setAiGPTConfig: (config: AIConfig) => void;
}

export function AIConfigPanel({ 
  apiKeys, 
  setApiKeys, 
  aiXConfig, 
  setAiXConfig, 
  aiGPTConfig, 
  setAiGPTConfig 
}: AIConfigPanelProps) {
  return (
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
  );
}