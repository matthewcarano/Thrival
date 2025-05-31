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

${externalData && Object.keys(externalData).length > 0 ? `
EXTERNAL DATA PROVIDED:
${Object.entries(externalData)
  .filter(([, value]) => value)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}
` : ''}
