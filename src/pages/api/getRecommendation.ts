import { NextApiRequest, NextApiResponse } from 'next'
import { getRecommendationService } from '../../services/getRecommendationService'

export default async function getRecommendation(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await getRecommendationService(req.body.messages)
    res.status(200).json({ data })
  } catch (error: any) {
    res.status(200).json({
      content: "I'm sorry, I'm having trouble understanding you right now. Please try again later.",
      role: 'assistant'
    })
  }
}
