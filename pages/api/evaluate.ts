import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
})

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

    console.log('Starting evaluation for criterion:', criterion)

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

The feedback should be professional, constructive, and specific. Reference concrete details from the application when possible.`

  const userPrompt = `EVALUATION CRITERIA: ${criterion}

SPECIFIC PROMPT FOR THIS CRITERION:
${prompt}

APPLICATION TEXT TO EVALUATE:
${applicationText}

Please evaluate this application for the "${criterion}" criterion and respond with the JSON format specified above.`

    const message = await anthropic.messages.create({
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

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('Claude response:', responseText)
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in response:', responseText)
        throw new Error('No JSON found in response')
      }
      
      const result = JSON.parse(jsonMatch[0])
      console.log('Parsed result:', result)
      
      if (typeof result.score !== 'number' || !result.feedback) {
        console.error('Invalid response structure:', result)
        throw new Error('Invalid response structure')
      }
      
      result.score = Math.max(1, Math.min(10, Math.round(result.score)))
      
      res.status(200).json(result)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError)
      console.error('Raw response:', responseText)
      
      res.status(200).json({
        score: 5,
        feedback: 'The evaluation could not be completed due to a parsing issue. Please try again.'
      })
    }

  } catch (error: any) {
    console.error('Evaluation API error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    })
  }
}
