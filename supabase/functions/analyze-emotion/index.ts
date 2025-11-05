import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, visionEmotion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing emotion for text:', text);
    console.log('Vision emotion:', visionEmotion);

    // Analyze text emotion
    const emotionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an emotion detection AI. Analyze the text and return ONLY ONE emotion: happy, sad, angry, fear, or neutral. Respond with just the emotion word, nothing else.'
          },
          {
            role: 'user',
            content: text
          }
        ],
      }),
    });

    if (!emotionResponse.ok) {
      const errorText = await emotionResponse.text();
      console.error('Emotion detection error:', errorText);
      throw new Error('Failed to detect emotion from text');
    }

    const emotionData = await emotionResponse.json();
    const textEmotion = emotionData.choices[0].message.content.trim().toLowerCase();
    
    console.log('Detected text emotion:', textEmotion);

    // Determine final emotion (prioritize negative emotions)
    const negativeEmotions = ['sad', 'angry', 'fear'];
    let finalEmotion = textEmotion;
    
    if (visionEmotion && negativeEmotions.includes(visionEmotion)) {
      finalEmotion = visionEmotion;
    } else if (negativeEmotions.includes(textEmotion)) {
      finalEmotion = textEmotion;
    } else if (visionEmotion) {
      finalEmotion = textEmotion; // Use text if both are positive/neutral
    }

    console.log('Final emotion:', finalEmotion);

    // Generate empathetic response
    const responseGen = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an empathetic AI companion. The user is feeling ${finalEmotion}. Generate a warm, caring response (2 sentences max) that:
1. Acknowledges their emotion with empathy
2. Offers one psychology-based or motivational suggestion

Be human-like, calming, and genuinely supportive. Use simple, warm language.`
          },
          {
            role: 'user',
            content: text
          }
        ],
      }),
    });

    if (!responseGen.ok) {
      const errorText = await responseGen.text();
      console.error('Response generation error:', errorText);
      throw new Error('Failed to generate empathetic response');
    }

    const responseData = await responseGen.json();
    const empatheticResponse = responseData.choices[0].message.content;

    console.log('Generated response:', empatheticResponse);

    return new Response(
      JSON.stringify({
        textEmotion,
        finalEmotion,
        empatheticResponse,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-emotion function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
