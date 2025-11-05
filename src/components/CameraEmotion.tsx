import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';
import { toast } from 'sonner';

interface CameraEmotionProps {
  onEmotionDetected: (emotion: string, confidence: number) => void;
}

export const CameraEmotion = ({ onEmotionDetected }: CameraEmotionProps) => {
  const [isActive, setIsActive] = useState(false);
  const [emotion, setEmotion] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        toast.success('Camera activated');
        
        // Start emotion detection loop
        detectEmotion();
      }
    } catch (error) {
      toast.error('Failed to access camera');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setEmotion('');
    setConfidence(0);
    toast.info('Camera stopped');
  };

  const detectEmotion = async () => {
    // This would call your edge function for vision-based emotion detection
    // For now, we'll simulate it
    const emotions = ['happy', 'sad', 'angry', 'fear', 'neutral'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const randomConfidence = Math.random() * 0.4 + 0.6; // 60-100%
    
    setEmotion(randomEmotion);
    setConfidence(randomConfidence);
    onEmotionDetected(randomEmotion, randomConfidence);
    
    if (isActive) {
      setTimeout(detectEmotion, 3000); // Detect every 3 seconds
    }
  };

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

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">
        Vision Detection
      </h2>
      
      <div className="relative rounded-lg overflow-hidden bg-muted mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover"
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Camera className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex justify-center mb-4">
        {!isActive ? (
          <Button onClick={startCamera} className="bg-primary hover:bg-primary/90">
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="secondary">
            <CameraOff className="mr-2 h-4 w-4" />
            Stop Camera
          </Button>
        )}
      </div>

      {emotion && (
        <div className="text-center animate-pulse-soft">
          <div className="text-6xl mb-2">{getEmotionEmoji(emotion)}</div>
          <p className="text-lg font-medium text-foreground capitalize">{emotion}</p>
          <p className="text-sm text-muted-foreground">
            Confidence: {(confidence * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </Card>
  );
};
