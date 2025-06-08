// pages/api/evaluate-comprehensive.ts

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('=== API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body keys:', Object.keys(req.body || {}));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { applicationText, projectName, selectedProgram, externalData, apiKey } = req.body
    
    console.log('=== EXTRACTED DATA ===');
    console.log('Has applicationText:', !!applicationText);
    console.log('Has apiKey:', !!apiKey);
    console.log('ApiKey starts with sk-ant:', apiKey?.startsWith('sk-ant'));
    
    if (!apiKey || !apiKey.startsWith('sk-ant')) {
      console.log('=== API KEY ERROR ===');
      return res.status(400).json({ message: 'Valid Claude API key required' })
    }
      
    if (!applicationText) {
      console.log('=== APPLICATION TEXT ERROR ===');
      return res.status(400).json({ message: 'Application text is required' })
    }

    console.log('=== ABOUT TO CALL CLAUDE ===');
    // Build the comprehensive prompt
    let systemPrompt = `AI EVALUATOR INSTRUCTIONS

You are evaluating blockchain funding applications for Thrive Protocol. 

REQUIRED JSON OUTPUT - YOU MUST POPULATE ALL FIELDS:
{
  "projectName": "",
  "projectEmail": "", 
  "programType": "",
  "totalScore": 0,
  "recommendation": "",
  
  "criterionFeedback": {
    "team": {"score": 0, "feedback": ""},
    "evidence": {"score": 0, "feedback": ""},
    "fit": {"score": 0, "feedback": ""},
    "need": {"score": 0, "feedback": ""},
    "novelty": {"score": 0, "feedback": ""},
    "focus": {"score": 0, "feedback": ""}
  },
  
  "overallFeedback": "",
  "boardFeedback": "",
  "applicantFeedback": ""
}

FIELD REQUIREMENTS:
- projectName: Extract from application text
- projectEmail: Extract from application text
- programType: "Boost" (existing project) or "Launch" (new project)
- totalScore: Sum of all 6 criterion scores (max 30)
- recommendation: Based on total score (27-30=Strongly Recommend, 24-26=Recommend, 20-23=Needs Improvement, 0-19=Do Not Fund)
- criterionFeedback: Each criterion gets 1-5 score and 2-3 sentence feedback
- overallFeedback: 4-5 sentences analyzing project strengths, weaknesses, and investment rationale
- boardFeedback: Strategic arguments for ecosystem board - compelling case for funding or key gaps
- applicantFeedback: 2-3 sentences of professional feedback suitable for sending to applicant

SCORING (1-5 per criterion):
5 = Exceptional, 4 = Strong, 3 = Adequate, 2 = Weak, 1 = Poor

RECOMMENDATIONS:
27-30 = Strongly Recommend
24-26 = Recommend  
20-23 = Needs Improvement
0-19 = Do Not Fund

FEEDBACK REQUIREMENTS:

Overall Feedback: Comprehensive analysis including project strengths, weaknesses, scale potential, and verification needs for any external evidence claims.

Board Feedback: Strategic presentation for ecosystem decision-makers. For strong projects: compelling funding arguments. For weaker projects: key gaps and development needs.

Applicant Feedback: Professional, encouraging communication. Be informative but avoid disputable details. Focus on strategic guidance.

CRITICAL RULES:

- Return ONLY the JSON object, no other text
- Base assessment only on information explicitly provided in application
- Never invent or fabricate information not present
- If information is missing, state "Application does not provide [specific detail]"
- All JSON fields must contain meaningful content
- Score conservatively when details are missing`;

    // Add program-specific context if available
    // You'll need to load this from your database/config based on selectedProgram
    
    let userPrompt = `APPLICATION TO EVALUATE:

Project Name: ${projectName || 'Not specified'}

External Data Provided:
- Twitter: ${externalData?.twitter || 'Not provided'}
- GitHub: ${externalData?.github || 'Not provided'}  
- Website: ${externalData?.website || 'Not provided'}

APPLICATION TEXT:
${applicationText}

Please evaluate this application according to the framework above and respond with the required JSON structure.`;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4500,
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
      console.log('Claude API Error:', response.status, errorText)
      return res.status(500).json({ message: `Claude API Error: ${response.status}` })
    }

    const claudeResponse = await response.json()
    const responseText = claudeResponse.content[0]?.text || ''
    
    try {
      // Parse the JSON response from Claude
      const evaluationResult = JSON.parse(responseText);
      
      // Validate required fields
      if (!evaluationResult.criterionFeedback || !evaluationResult.overallFeedback || !evaluationResult.boardFeedback) {
        throw new Error('Missing required feedback fields');
      }
      
      res.status(200).json(evaluationResult);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Claude Response:', responseText);
      res.status(500).json({
        message: 'Failed to parse evaluation response',
        rawResponse: responseText
      });
    }

  } catch (error: any) {
    res.status(500).json({ 
      message: error.message,
      errorName: error.name,
      stack: error.stack?.substring(0, 500),
      details: String(error)
    });
  }
}
