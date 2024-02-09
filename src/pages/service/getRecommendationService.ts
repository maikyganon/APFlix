import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
// const apiKey = process.env.OPENAI_API_KEY

const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo'
  // temperature: 0.7,
})

const prompt = ChatPromptTemplate.fromTemplate(`
    according to my description, recommend me a movie from this list -
    1. The Silence of the Lambs
    2. Pulp Fiction
    3. The Shawshank Redemption
    4. Inception
    5. Jurassic Park
    6. The Lord of the Rings: The Fellowship of the Ring
    7. Fight Club
    8. Titanic
    9. The Matrix
    10. Forrest Gump
    my description: {input} 
`)

const chain = prompt.pipe(model)

export async function getRecommendationService(messages: any) {
  const recommendationRes = await invokeRecommendation(messages[messages.length - 1]?.content)
  return recommendationRes
  // const url = 'https://api.openai.com/v1/chat/completions'

  // const body = JSON.stringify({
  //     messages,
  //     model: 'gpt-3.5-turbo',
  //     stream: false
  // })

  // try {
  //     const response = await fetch(url, {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${apiKey}`
  //         },
  //         body
  //     })
  //     const data = await response.json()
  //     return data
  // } catch (error: any) {
  //     throw new Error(error.message)
  // }
}

export async function invokeRecommendation(description: string) {
  const response = await chain.invoke({
    input: description
  })
  const recommendation = {
    content: response?.content,
    role: 'assistant'
  }
  return recommendation
}
