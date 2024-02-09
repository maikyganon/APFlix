const apiKey = process.env.OPENAI_API_KEY

export async function getRecommendationService(messages: any) {
  const url = 'https://api.openai.com/v1/chat/completions'

  const body = JSON.stringify({
    messages,
    model: 'gpt-3.5-turbo',
    stream: false
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body
    })
    const data = await response.json()
    return data
  } catch (error: any) {
    throw new Error(error.message)
  }
}
