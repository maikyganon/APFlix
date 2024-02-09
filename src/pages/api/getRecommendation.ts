import { NextApiRequest, NextApiResponse } from 'next'
import { getRecommendationService } from '../service/getRecommendationService'

export default async function getRecommendation(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body

  try {
    const data = await getRecommendationService(messages)
    res.status(200).json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
