import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('API endpoint called')
    console.log('Environment variables:', {
      hasClaudeKey: !!process.env.CLAUDE_API_KEY,
      nodeEnv: process.env.NODE_ENV
    })
    
    res.status(200).json({ 
      success: true,
      message: 'API endpoint is working',
      hasApiKey: !!process.env.CLAUDE_API_KEY
    })
  } catch (error: any) {
    console.error('Simple test error:', error)
    res.status(500).json({ error: error.message })
  }
}
