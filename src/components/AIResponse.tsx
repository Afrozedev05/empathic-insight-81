import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AIResponseProps {
  response: string;
  emotion: string;
}

export const AIResponse = ({ response, emotion }: AIResponseProps) => {
  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😔',
      angry: '😠',
      fear: '😨',
      neutral: '😐'
    };
    return emojiMap[emotion] || '😐';
  };

  if (!response) {
    return (
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Support
        </h2>
        <p className="text-muted-foreground text-center py-8">
          I'm here to listen and support you. Share your feelings to get started.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 backdrop-blur-sm bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 shadow-lg animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        AI Support
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getEmotionEmoji(emotion)}</span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Detected Emotion</p>
            <p className="text-lg font-semibold capitalize text-foreground">{emotion}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border/30">
          <p className="text-foreground leading-relaxed">
            {response}
          </p>
        </div>
      </div>
    </Card>
  );
};
