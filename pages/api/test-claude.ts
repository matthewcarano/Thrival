import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { apiKey } = req.body
    
    if (!apiKey) {
      return res.status(400).json({ message: 'API key is required' })
    }

    // Test with direct fetch to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say test' }]
      })
    })

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        message: `Claude API error: ${response.status}` 
      })
    }

    res.status(200).json({ 
      success: true, 
      message: 'API key is valid' 
    })

  } catch (error: any) {
    console.error('Test error:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message 
    })
  }
}
