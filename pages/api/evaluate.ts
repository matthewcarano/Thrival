import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { criterion, applicationText, programId, prompt, externalData, apiKey } = req.body

    // Simple debug test
    if (!apiKey || !apiKey.startsWith('sk-ant')) {
      return res.status(200).json({
        score: 3,
        feedback: `API Key issue: Received=${apiKey ? 'YES' : 'NO'}, Length=${apiKey ? apiKey.length : 0}, Format=${apiKey ? apiKey.startsWith('sk-ant') : false}`
      })
    }
    
    // Add this new debug:
    if (criterion === 'test') {
      return res.status(200).json({
        score: 4,
        feedback: 'Test successful - API key and endpoint working!'
      })
    }

    if (!criterion || !applicationText || !prompt) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Use the layered prompt from your frontend instead of hardcoded system prompt
    const systemPrompt = `${prompt}

RESPONSE FORMAT:
Provide your response as a JSON object with exactly this structure:
{
  "score": [number between 1-5],
  "feedback": "[detailed feedback following the guidelines in your instructions above]"
}

IMPORTANT: You MUST respond with valid JSON only. Do not include any other text before or after the JSON.`;

    const userPrompt = `EVALUATION CRITERION: ${criterion}
    
    APPLICATION TEXT TO EVALUATE:
    ${applicationText}
    
    ${externalData && Object.keys(externalData).length > 0 ? `
    ADDITIONAL CONTEXT:
    ${Object.entries(externalData)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}
    ` : ''}
    
    Please evaluate this application for the "${criterion}" criterion and respond with the JSON format specified above.`
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
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
      console.log('Claude API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0
      })
      return res.status(200).json({
        score: 3,
        feedback: `Claude API Error: ${response.status} - ${errorText}`
      })
    }

    const claudeResponse = await response.json()
    const responseText = claudeResponse.content[0]?.text || ''
    
    try {
      // Extract just the score and feedback manually to avoid JSON parsing issues
      const scoreMatch = responseText.match(/"score":\s*(\d+)/);
      const feedbackMatch = responseText.match(/"feedback":\s*"(.*?)"\s*}/s);
      
      if (!scoreMatch || !feedbackMatch) {
        return res.status(200).json({
          score: 3,
          feedback: `Could not extract score/feedback: ${responseText}`
        })
      }
      
      const score = Math.max(1, Math.min(5, parseInt(scoreMatch[1]))); // Changed to 1-5 scale
      const feedback = feedbackMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      
      res.status(200).json({ score, feedback })
    } catch (parseError) {
      res.status(200).json({
        score: 3,
        feedback: `Parse error: ${parseError}. Raw response: ${responseText}`
      })
    }

  } catch (error: any) {
    res.status(200).json({
      score: 3,
      feedback: `Server error: ${error.message}`
    })
  }
}
