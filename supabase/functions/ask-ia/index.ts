
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, type = 'outros' } = await req.json();
    
    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Mensagem e ID do usuário são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'API da OpenAI não configurada' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Obter configuração do usuário
    const userSettingsResponse = await fetch(`${supabaseUrl}/rest/v1/ia_settings?user_id=eq.${userId}&select=tone,language`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    });

    const userSettings = await userSettingsResponse.json();
    const tone = userSettings[0]?.tone || 'profissional';
    const language = userSettings[0]?.language || 'pt-br';

    // Chamada para a OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `Você é um acessor inteligente de marketing e estratégia digital. 
            Responda com objetividade, criatividade e foco em resultados.
            Use o tom ${tone} e responda em ${language}.`
          },
          { role: 'user', content: message }
        ],
      }),
    });

    const data = await openAIResponse.json();
    const aiResponse = data.choices[0].message.content;

    // Salvar a conversa no banco de dados
    const saveConversationResponse = await fetch(`${supabaseUrl}/rest/v1/ia_conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        message,
        response: aiResponse,
        type
      })
    });

    if (saveConversationResponse.status !== 201) {
      console.error('Erro ao salvar conversa:', await saveConversationResponse.text());
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na função ask-ia:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
