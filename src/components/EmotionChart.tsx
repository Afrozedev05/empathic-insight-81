import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EmotionEntry {
  emotion: string;
  timestamp: Date;
}

interface EmotionChartProps {
  history: EmotionEntry[];
}

export const EmotionChart = ({ history }: EmotionChartProps) => {
  // Count emotions
  const emotionCounts = history.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    count,
  }));

  const getEmotionColor = (emotion: string) => {
    const colorMap: Record<string, string> = {
      Happy: 'hsl(var(--primary))',
      Sad: 'hsl(200, 70%, 60%)',
      Angry: 'hsl(0, 70%, 60%)',
      Fear: 'hsl(280, 70%, 70%)',
      Neutral: 'hsl(var(--muted-foreground))',
    };
    return colorMap[emotion] || 'hsl(var(--primary))';
  };

  if (history.length === 0) {
    return (
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Emotion Insights
        </h2>
        <p className="text-muted-foreground text-center py-8">
          Your emotional journey will appear here as you interact with EmpathAI.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">
        Emotion Insights
      </h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="emotion" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-sm text-muted-foreground">
          Total interactions: {history.length}
        </p>
      </div>
    </Card>
  );
};
