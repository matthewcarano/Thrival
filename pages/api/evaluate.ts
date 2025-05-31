import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // First, check if we have the API key
    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      return res.status(200).json({
        score: 5,
        feedback: 'Error: No Claude API key found in environment variables'
      })
    }

    if (!apiKey.startsWith('sk-ant-')) {
      return res.status(200).json({
        score: 5,
        feedback: `Error: Invalid API key format. Key starts with: ${apiKey.substring(0, 7)}...`
      })
    }

    // Try a simple fetch to Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Say "test successful"'
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(200).json({
        score: 5,
        feedback: `Claude API Error: Status ${response.status}. Response: ${errorText}`
      })
    }

    const claudeResponse = await response.json()
    const responseText = claudeResponse.content[0]?.text || 'No response text'

    return res.status(200).json({
      score: 8,
      feedback: `Claude API is working! Response: ${responseText}`
    })

  } catch (error: any) {
    return res.status(200).json({
      score: 5,
      feedback: `Catch Error: ${error.message}`
    })
  }
}
