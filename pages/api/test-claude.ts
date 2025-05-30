import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'

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

    // Test the API key with a simple request
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Say "test"'
        }
      ]
    })

    // If we get here, the API key is valid
    res.status(200).json({ 
      success: true, 
      message: 'API key is valid',
      model: 'claude-3-sonnet-20240229'
    })

  } catch (error: any) {
    console.error('Claude API test error:', error)
    
    if (error.status === 401) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid API key' 
      })
    } else if (error.status === 429) {
      res.status(429).json({ 
        success: false, 
        message: 'Rate limit exceeded' 
      })
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'API connection failed' 
      })
    }
  }
}
