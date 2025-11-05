import { useState } from 'react';
import { CameraEmotion } from '@/components/CameraEmotion';
import { TextVoiceInput } from '@/components/TextVoiceInput';
import { AIResponse } from '@/components/AIResponse';
import { EmotionChart } from '@/components/EmotionChart';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmotionEntry {
  emotion: string;
  timestamp: Date;
}

const Index = () => {
  const [visionEmotion, setVisionEmotion] = useState<string>('');
  const [textEmotion, setTextEmotion] = useState<string>('');
  const [finalEmotion, setFinalEmotion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [emotionHistory, setEmotionHistory] = useState<EmotionEntry[]>([]);
  const [voiceEmotionMode, setVoiceEmotionMode] = useState<boolean>(false);

  const handleVisionEmotion = (emotion: string, confidence: number) => {
    setVisionEmotion(emotion);
    console.log('Vision emotion:', emotion, 'confidence:', confidence);
  };

  const fuseEmotions = (vision: string, text: string): string => {
    // Prioritize negative emotions
    const negativeEmotions = ['sad', 'angry', 'fear'];
    
    if (negativeEmotions.includes(vision)) return vision;
    if (negativeEmotions.includes(text)) return text;
    
    // If both are positive or neutral, use text emotion (more explicit)
    return text || vision;
  };

  const getBackgroundColor = (emotion: string): string => {
    if (!voiceEmotionMode) return '';
    
    const emotionColors: Record<string, string> = {
      happy: '#FFFACD',      // light yellow
      sad: '#B0E0E6',        // soft blue
      angry: '#FFB6C1',      // light red
      fear: '#B0C4DE',       // grey-blue
      neutral: '#FFFFFF'     // white
    };
    
    return emotionColors[emotion] || '#FFFFFF';
  };

  const handleTextSubmit = async (text: string) => {
    try {
      toast.loading('Analyzing your emotions...');

      // Call edge function to analyze text emotion
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { text, visionEmotion }
      });

      if (error) throw error;

      const detectedTextEmotion = data.textEmotion;
      const fused = fuseEmotions(visionEmotion, detectedTextEmotion);
      const response = data.empatheticResponse;

      setTextEmotion(detectedTextEmotion);
      setFinalEmotion(fused);
      setAiResponse(response);

      // Add to history
      setEmotionHistory(prev => [...prev, {
        emotion: fused,
        timestamp: new Date()
      }]);

      toast.success('Analysis complete');
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      toast.error('Failed to analyze emotions. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 transition-colors duration-800"
      style={voiceEmotionMode && finalEmotion ? { backgroundColor: getBackgroundColor(finalEmotion) } : {}}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              EmpathAI
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Human Vision & Emotion Companion
          </p>
          
          {/* Voice Emotion Mode Toggle */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={voiceEmotionMode}
                onChange={(e) => setVoiceEmotionMode(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">Voice Emotion Mode</span>
            </label>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Camera */}
          <div className="lg:col-span-1">
            <CameraEmotion onEmotionDetected={handleVisionEmotion} />
          </div>

          {/* Section 2: Text/Voice */}
          <div className="lg:col-span-1">
            <TextVoiceInput onTextSubmit={handleTextSubmit} />
          </div>

          {/* Section 3: AI Response */}
          <div className="lg:col-span-1">
            <AIResponse response={aiResponse} emotion={finalEmotion} />
          </div>

          {/* Section 4: Chart */}
          <div className="lg:col-span-1">
            <EmotionChart history={emotionHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
