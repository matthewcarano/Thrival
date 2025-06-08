// pages/api/evaluate-comprehensive.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('=== API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body keys:', Object.keys(req.body || {}));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { applicationText, projectName, selectedProgram, externalData, apiKey } = req.body
    
    console.log('=== EXTRACTED DATA ===');
    console.log('Has applicationText:', !!applicationText);
    console.log('Has apiKey:', !!apiKey);
    console.log('ApiKey starts with sk-ant:', apiKey?.startsWith('sk-ant'));
    
    if (!apiKey || !apiKey.startsWith('sk-ant')) {
      console.log('=== API KEY ERROR ===');
      return res.status(400).json({ message: 'Valid Claude API key required' })
    }
      
    if (!applicationText) {
      console.log('=== APPLICATION TEXT ERROR ===');
      return res.status(400).json({ message: 'Application text is required' })
    }

    console.log('=== ABOUT TO CALL CLAUDE ===');
   
    // Initialize Supabase client
    const supabase = createClient(
      'https://baieuwnbiiwumgjydjvs.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzd... (your anon key)'
    );

    // Load AI Evaluator Instructions from Supabase
    let systemPrompt = '';
    try {
      const { data: promptData, error: promptError } = await supabase
        .from('prompt_templates')
        .select('prompt_text')
        .eq('prompt_type', 'system')
        .eq('active', true)
        .single();
        
      if (promptData && promptData.prompt_text) {
        systemPrompt = promptData.prompt_text;
        console.log('Successfully loaded AI Evaluator Instructions from database');
      } else {
        throw new Error('No active system prompt found');
      }
    } catch (error) {
      console.error('Failed to load AI Evaluator Instructions from database:', error);
      // Fallback to ensure evaluation can still work
      systemPrompt = `AI EVALUATOR INSTRUCTIONS
    You are evaluating blockchain funding applications for Thrive Protocol.
    [FALLBACK PROMPT - Please update AI Evaluator Instructions in Settings]

    REQUIRED JSON OUTPUT: { "projectName": "", "projectEmail": "", "programType": "", "totalScore": 0, "recommendation": "", "criterionFeedback": {"team": {"score": 0, "feedback": ""}, "evidence": {"score": 0, "feedback": ""}, "fit": {"score": 0, "feedback": ""}, "need": {"score": 0, "feedback": ""}, "novelty": {"score": 0, "feedback": ""}, "focus": {"score": 0, "feedback": ""}}, "overallFeedback": "", "boardFeedback": "", "applicantFeedback": "" }`;
    }

    // Add program-specific context if available
    if (selectedProgram) {
      try {
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select('overall_prompt')
          .eq('id', selectedProgram)
          .single();
          
        if (programData && programData.overall_prompt) {
          systemPrompt += '\n\nPROGRAM-SPECIFIC CONTEXT:\n' + programData.overall_prompt;
          console.log('Added program-specific context for:', selectedProgram);
        }
      } catch (error) {
        console.error('Failed to load program context:', error);
      }
    }
    
    let userPrompt = `APPLICATION TO EVALUATE:

Project Name: ${projectName || 'Not specified'}

External Data Provided:
- Twitter: ${externalData?.twitter || 'Not provided'}
- GitHub: ${externalData?.github || 'Not provided'}  
- Website: ${externalData?.website || 'Not provided'}

APPLICATION TEXT:
${applicationText}

Please evaluate this application according to the framework above and respond with the required JSON structure.`;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    })

   if (!response.ok) {
      const errorText = await response.text()
      return res.status(500).json({ 
        message: `Claude API Error: ${response.status}`,
        details: errorText,
        status: response.status
      })
}

    const claudeResponse = await response.json()
    const responseText = claudeResponse.content[0]?.text || ''
    
    try {
      // Extract JSON from Claude's response (in case it includes extra text)
      let jsonText = responseText;
      
      // Find the first { and last } to extract just the JSON
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        jsonText = responseText.substring(firstBrace, lastBrace + 1);
        console.log('Extracted JSON from Claude response');
      }
      
      // Parse the JSON response from Claude
      const evaluationResult = JSON.parse(jsonText);
      
      // Validate required fields
      if (!evaluationResult.criterionFeedback || !evaluationResult.overallFeedback || !evaluationResult.boardFeedback) {
        throw new Error('Missing required feedback fields');
      }
      
      res.status(200).json(evaluationResult);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Claude Response:', responseText);
      res.status(500).json({
        message: 'Failed to parse evaluation response',
        rawResponse: responseText
      });
    }

  } catch (error: any) {
    res.status(500).json({ 
      message: error.message,
      errorName: error.name,
      stack: error.stack?.substring(0, 500),
      details: String(error)
    });
  }
}
