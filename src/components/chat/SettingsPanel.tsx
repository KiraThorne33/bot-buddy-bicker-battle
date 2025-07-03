import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Zap, Brain } from 'lucide-react';
import { ConversationSettings } from '@/types/chat';
import { PRESET_TOPICS, ROLEPLAY_SCENARIOS } from '@/constants/chat';

interface SettingsPanelProps {
  settings: ConversationSettings;
  setSettings: (settings: ConversationSettings) => void;
  setCustomTopic: (topic: string) => void;
}

export function SettingsPanel({ settings, setSettings, setCustomTopic }: SettingsPanelProps) {
  return (
    <Card className="mb-6 p-6 max-h-[500px]">
      <h3 className="text-lg font-semibold mb-4">Conversation Settings</h3>
      <ScrollArea className="h-full">
        <div className="pr-4">
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
        </div>
      </ScrollArea>
    </Card>
  );
}