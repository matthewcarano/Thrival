import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { criterion, applicationText, programId, prompt, externalData } = req.body

    if (!criterion || !applicationText || !prompt) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      return res.status(200).json({
        score: 5,
        feedback: 'No Claude API key configured'
      })
    }

   const systemPrompt = `You are an expert grant application evaluator. Your task is to evaluate applications based on specific criteria and provide both a numerical score (1-10) and detailed feedback.

   For this evaluation, you are assessing the "${criterion}" criterion for a grant application. Use the program-specific evaluation guidance provided below as your primary framework for assessment.

SCORING GUIDELINES:
- Score 1-3: Poor/Inadequate - Major deficiencies that significantly impact viability
- Score 4-5: Below Average - Some issues but shows potential
- Score 6-7: Good/Solid - Meets expectations with room for improvement  
- Score 8-9: Excellent - Strong performance with minor gaps
- Score 10: Exceptional - Outstanding performance across all aspects

RESPONSE FORMAT:
Provide your response as a JSON object with exactly this structure:
{
  "score": [number between 1-10],
  "feedback": "[1-2 sentences maximum explaining the score]"
}

Keep feedback brief and concise. One sentence explaining the score and one sentence with specific details or recommendations.`

   const userPrompt = `EVALUATION CRITERIA: ${criterion}
    
    PROGRAM-SPECIFIC EVALUATION GUIDANCE:
    ${prompt}
    
    Use the above guidance as your primary framework for evaluating this criterion. Focus your assessment on how well the application aligns with these program-specific requirements.
    
    APPLICATION TEXT TO EVALUATE:
    ${applicationText}
    
    Please evaluate this application for the "${criterion}" criterion using the program guidance above and respond with the JSON format specified above.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
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
      return res.status(200).json({
        score: 5,
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
          score: 5,
          feedback: `Could not extract score/feedback: ${responseText}`
        })
      }
      
      const score = Math.max(1, Math.min(10, parseInt(scoreMatch[1])));
      const feedback = feedbackMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      
      res.status(200).json({ score, feedback })
    } catch (parseError) {
      res.status(200).json({
        score: 5,
        feedback: `Parse error: ${parseError}. Raw response: ${responseText}`
      })
    }

  } catch (error: any) {
    res.status(200).json({
      score: 5,
      feedback: `Server error: ${error.message}`
    })
  }
}
