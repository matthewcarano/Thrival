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

    console.log('API endpoint reached for criterion:', criterion)

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
  "feedback": "[5-sentence detailed feedback explaining the score]"
}

The feedback should be professional, constructive, and specific.`

    const userPrompt = `EVALUATION CRITERIA: ${criterion}

SPECIFIC PROMPT FOR THIS CRITERION:
${prompt}

APPLICATION TEXT TO EVALUATE:
${applicationText}

Please evaluate this application for the "${criterion}" criterion and respond with the JSON format specified above.`

    console.log('Making request to Claude API...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
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

    console.log('Claude API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', errorText)
      return res.status(500).json({ 
        message: 'Claude API error',
        status: response.status,
        error: errorText
      })
    }

    const claudeResponse = await response.json()
    console.log('Claude response received:', claudeResponse)

    const responseText = claudeResponse.content[0]?.text || ''
    console.log('Response text:', responseText)
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in response')
        throw new Error('No JSON found in response')
      }
      
      const result = JSON.parse(jsonMatch[0])
      console.log('Parsed result:', result)
      
      if (typeof result.score !== 'number' || !result.feedback) {
        throw new Error('Invalid response structure')
      }
      
      result.score = Math.max(1, Math.min(10, Math.round(result.score)))
      
      res.status(200).json(result)
    } catch (parseError) {
      console.error('Parse error:', parseError)
      
      res.status(200).json({
        score: 5,
        feedback: 'The evaluation could not be completed due to a parsing issue. Please try again.'
      })
    }

  } catch (error: any) {
    console.error('Evaluation API error:', error)
    res.status(200).json({ 
      score: 5,
      feedback: `Server Error: ${error.message}. Stack: ${error.stack}`
    })
  }
