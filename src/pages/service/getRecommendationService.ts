import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { Document } from '@langchain/core/documents'
// const apiKey = process.env.OPENAI_API_KEY

const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo'
  // temperature: 0.7,
})

const prompt = ChatPromptTemplate.fromTemplate(`
    according to my description, recommend me a movie from this list (under the list, in the "extra movies" section
        there might be more info about movies you might dont know , you can recommend from there too, 
        even if the movie in the "extra movies" is not in the list):
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
    extra movies: {context}
    my description: {input}
`)

// const prompt = ChatPromptTemplate.fromTemplate(`
//     answer the following question:
//     context: {context}
//     question: {input}
// `)

// const chain = prompt.pipe(model)

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
  try {
    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt
    })

    // Document
    const documentA = new Document({
      pageContent: `Aquaman and the Lost Kingdom - Black Manta seeks revenge on Aquaman for his father's death. Wielding the Black Trident's power, he becomes a formidable foe. To defend Atlantis, Aquaman forges an alliance with his imprisoned brother. They must protect the kingdom.`
    })
    const response = await chain.invoke({
      input: description,
      context: [documentA]
    })
    const recommendation = {
      content: response,
      role: 'assistant'
    }
    return recommendation
  } catch (error: any) {
    throw new Error(error.message)
  }
}
