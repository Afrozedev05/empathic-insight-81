import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Send } from 'lucide-react';
import { toast } from 'sonner';

interface TextVoiceInputProps {
  onTextSubmit: (text: string) => void;
}

export const TextVoiceInput = ({ onTextSubmit }: TextVoiceInputProps) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setIsListening(false);
      toast.success('Voice captured');
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error('Voice recognition error');
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onTextSubmit(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">
        Share Your Feelings
      </h2>
      
      <div className="space-y-4">
        <Textarea
          placeholder="Type your feelings here or use voice... (Press Enter to submit)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[120px] resize-none bg-background/50 border-border/50"
        />
        
        <div className="flex gap-2">
          <Button
            onClick={startVoiceRecording}
            variant={isListening ? 'default' : 'secondary'}
            className={isListening ? 'animate-pulse-soft' : ''}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Listening...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Voice Input
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="bg-primary hover:bg-primary/90 flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            Analyze Emotion
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
