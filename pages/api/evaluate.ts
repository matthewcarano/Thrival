import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ 
    score: 7, 
    feedback: 'This is a test response from the API endpoint. If you see this, the endpoint is working.' 
  })
}
