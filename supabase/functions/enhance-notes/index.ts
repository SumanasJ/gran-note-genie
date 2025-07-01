
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript, notes, templatePrompt, customPrompt } = await req.json();
    
    if (!transcript && !notes) {
      throw new Error('No content provided for enhancement');
    }

    console.log('Enhancing notes with AI...');

    let systemPrompt = '';
    let userContent = '';

    if (templatePrompt) {
      systemPrompt = templatePrompt.replace('{{transcript}}', '');
      userContent = `会议转录:\n${transcript || ''}\n\n用户笔记:\n${notes || ''}`;
    } else if (customPrompt) {
      systemPrompt = `你是一个专业的会议助手。根据用户的要求处理会议内容。用户要求: ${customPrompt}`;
      userContent = `会议转录:\n${transcript || ''}\n\n用户笔记:\n${notes || ''}`;
    } else {
      systemPrompt = `你是一个专业的会议助手。请根据提供的会议转录和用户笔记，生成结构化的会议总结。

请按以下格式输出:
- 关键讨论点
- 重要决定
- 行动项目
- 下次会议要点`;
      userContent = `会议转录:\n${transcript || ''}\n\n用户笔记:\n${notes || ''}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

    console.log('Notes enhancement completed successfully');

    // Parse the enhanced content into sections
    const sections = enhancedContent.split('\n').reduce((acc: Record<string, string>, line: string) => {
      if (line.startsWith('- ') || line.startsWith('## ') || line.startsWith('### ')) {
        const title = line.replace(/^[#\-\s]+/, '');
        if (title) {
          acc[title] = '';
        }
      } else if (line.trim() && Object.keys(acc).length > 0) {
        const lastKey = Object.keys(acc)[Object.keys(acc).length - 1];
        acc[lastKey] += (acc[lastKey] ? '\n' : '') + line.trim();
      }
      return acc;
    }, {});

    // If no clear sections were found, return the content as a single summary
    const finalSummary = Object.keys(sections).length > 0 ? sections : {
      "AI 总结": enhancedContent
    };

    return new Response(
      JSON.stringify({ summary: finalSummary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhance-notes function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
