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

For this evaluation, you are assessing the "${criterion}" criterion for a grant application.

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
  "feedback": "[detailed feedback explaining the score]"
}

The feedback should be professional, constructive, and specific. Reference concrete details from the application when possible.`

    const userPrompt = `EVALUATION CRITERIA: ${criterion}

SPECIFIC PROMPT FOR THIS CRITERION:
${prompt}

APPLICATION TEXT TO EVALUATE:
${applicationText}

Please evaluate this application for the "${criterion}" criterion and respond with the JSON format specified above.`

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
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return res.status(200).json({
          score: 5,
          feedback: `Could not parse response: ${responseText}`
        })
      }
      
      // Clean up the JSON string to handle special characters
      let cleanJsonString = jsonMatch[0]
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      
      const result = JSON.parse(cleanJsonString)
      
      if (typeof result.score !== 'number' || !result.feedback) {
        return res.status(200).json({
          score: 5,
          feedback: `Invalid response format: ${JSON.stringify(result)}`
        })
      }
      
      result.score = Math.max(1, Math.min(10, Math.round(result.score)))
      
      res.status(200).json(result)
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
