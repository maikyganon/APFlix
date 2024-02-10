import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { Document } from '@langchain/core/documents'

const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo'

})

const promptRecommendation = ChatPromptTemplate.fromTemplate(`
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
const seperator = "<@!$@!seperator$@#%@%!#$@!@>"
const promptSeperateDescriptionAndLinks = ChatPromptTemplate.fromTemplate(`
    i want to get all the links in the message(if there are links) and the description, i 
    want it in the following format:
    links: www.link1.com, www.link2.com, www.link3.com
    ${seperator}description: the user description

    the message is: {input}
`)
// const prompt = ChatPromptTemplate.fromTemplate(`
//     answer the following question:
//     context: {context}
//     question: {input}
// `)

// const chain = prompt.pipe(model)

export async function getRecommendationService(messages: any) {
    const {description, links } = await invokeSeperateDescriptionAndLinks(messages[messages.length - 1]?.content)
    const recommendationRes = await invokeRecommendation(description, links)
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

export async function invokeRecommendation(description: string, links: string[] = []) {
  try {
    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt: promptRecommendation
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

export async function invokeSeperateDescriptionAndLinks(message: string) {
    try {
        const chain = promptSeperateDescriptionAndLinks.pipe(model)
        const response = await chain.invoke({
            input: message
        })
        const content = response.content.toString();
        const links = content.split(seperator)[0].replace('links:', '').trim().split(',').map((link: string) => link.trim())
        const description = content.split(seperator)[1].replace('description:', '').trim();
        return { description, links };
        
    } catch (error: any) {
        throw new Error(error.message)
    }
}
