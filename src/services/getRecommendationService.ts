import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { Document } from '@langchain/core/documents'
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings} from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { createRetrievalChain } from 'langchain/chains/retrieval'
import cheerio from 'cheerio'
import axios from 'axios';


const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.0
})

const promptRecommendation = ChatPromptTemplate.fromTemplate(`
    according to my description, recommend me a movie from this list (under the list, in the "extra movies" section
        there might be more info about movies you might dont know , you can recommend from there too, 
        even if the movie in the "extra movies" is not in the list). under the "extra movies" section, there
        is a "context" section, you can use that to get more info about the movies from "extra movies" section.:
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
    extra movies: {extramovies}
    context: {context}
    my description: {input}
`)
const seperator = "<@!$@!seperator$@#%@%!#$@!@>"
const promptSeperateDescriptionAndLinks = ChatPromptTemplate.fromTemplate(`
    you are my assistant, i will parse your message and get the links and the description you found. 
    i want to get all the links in the message(if there are links) and the description, i 
    want it exactly in this format(dont say anything that is not part of the format):
    links: www.link1.com, www.link2.com, www.link3.com
    ${seperator}description: the user description

    the message is: {input}
`)


export async function getRecommendationService(messages: any) {
    const {description, links } = await invokeSeperateDescriptionAndLinks(messages[messages.length - 1]?.content)
    const recommendationRes = await invokeRecommendation(description, links)
    return recommendationRes
}

async function getDocsFromLinks(links: string[]) {
  const docs = [];
  const splitDocsCrossLinks = [];

  for (let i = 0; i < links.length; i++) {
    try {
      // use basic scraping from imdb to get the title, description and storyline of the movie from the link
      if (!links[i].includes('www.imdb.com/title'))
        continue;
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      let response = await axios.get(links[i], { headers });
      const html = response.data;
      const fullHtml = cheerio.load(html);
      let movieTitle = fullHtml('title').text();
      let movieDescription = fullHtml('meta[name="description"]').attr('content');
      let movieStoryline = fullHtml('.ipc-overflowText--children').text();

      // Combine all movie details into a summary
      let movieSummary = `Title: ${movieTitle}\nDescription: ${movieDescription}\nStoryline: ${movieStoryline}`;
      docs.push(new Document({
        pageContent: movieSummary
      }));

      //create splited documents for the later embedding and retrieval process

      // create Document from all the html content
      const documentA = new Document({
        pageContent: fullHtml('body').toString()
      });

      //split the document into smaller documents
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20
      });
      const splitDocs = await splitter.splitDocuments([documentA]);
      splitDocsCrossLinks.push(...splitDocs);

    } catch (error: any) {
      console.log(error.message);
    }
  }

  return { docs, splitDocsCrossLinks };
}


export async function invokeRecommendation(description: string, links: string[] = []) {
  try {

    // get the documents from the links
    const { docs, splitDocsCrossLinks } = await getDocsFromLinks(links)
    

    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt: promptRecommendation
    })

    //Embed the documents and store the embeddings in inmemory storage
    const embeddings = new OpenAIEmbeddings()
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocsCrossLinks,
      embeddings
    );

    // retrieve the most relevant parts from the html
    const retriever = vectorStore.asRetriever({
      k: 1
    })

    const retrieverChain = await createRetrievalChain({
      combineDocsChain: chain,
      retriever: retriever
    })

    const response = await retrieverChain.invoke({
      input: description,
      extramovies: docs
    })
    
    const recommendation = {
      content: response?.answer,
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
        
        if (!content.includes(seperator)) {
          console.log('error: no seperator found in the response')
          return { description: content, links: [] }
        }
        let linksStr = content.split(seperator)[0]
        // check for prefix by the LLM before the links
        const linksIndex = content.indexOf('link:')
        if (linksIndex > 0){
          linksStr = linksStr.split('link:')[1]
        }
        const links = linksStr.replace('links:', '').trim().split(',').map((link: string) => link.trim())
        const description = content.split(seperator)[1].replace('description:', '').trim();
        return { description, links };
        
    } catch (error: any) {
        throw new Error(error.message)
    }
}
