# APFlix - movie reco

APFlix is a movie recommendation system that helps users discover new movies based on their preferences. Whether you're looking for action-packed thrillers or heartwarming romantic comedies, APFlix has got you covered.

# Demo

- For Demo go to - https://www.maikyganon.com/

## Table of Contents

- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
- [Tech Stack](#Tech-Stack)
- [How does it work?](#How-does-it-work?)
- [Future Improvements (if we had more time)](Future-Improvements)

## Getting Started

1. Clone the repository
2. Create a `.env` file next to the .env.example with the following content:
   OPENAI_API_KEY=<your-api-key>
3. run - npm i
4. run - npm run build
5. run - npm run start

### Prerequisites

- node version 18.19.0
- npm version 10.2.3

## Tech Stack

1. Next.js - I selected Next.js for efficient and convenient full-stack development
2. LangChain - For LLM quering, embadding and retrieval
3. **Deployment** - The system is deplyed to AWS ec2. Fill free to visit https://www.maikyganon.com/ for demo. 

## How does it work?

1. **User Interaction:** The process begins with the user entering the chat. The system greets the user with a welcome message:

   ```
   Welcome to APFlix! 🎉 I'm your movie recommendation assistant. Share a bit about yourself and what you're in the mood for. Don't forget, you can also add IMDb links for any recently released movies you're interested in. Let's make movie night awesome! 🍿
   ```

2. **User Input:** The user provides a description and IMDb links (in any order) in response to the system's prompt.

3. **LLM Processing:** The system takes the user's message and leverages the Language Model (LLM) to split the user's input into a description and links, using a predefined separator for easy distinction.

   ```javascript
   const separator = "<@!$@!separator$@#%@%!#$@!@>";
   const promptSeparateDescriptionAndLinks = ChatPromptTemplate.fromTemplate(`
      You are my assistant. I will parse your message and extract the links and description.
      I want to get all the links in the message (if there are links) and the description.
      Please format the information as follows:
      links: www.link1.com, www.link2.com, www.link3.com
      ${separator}description: the user description

      The message is: {input}
   `);

   // Use the prompt to separate description and links
   ```
(Note: This part could be done without LLM, but I thought it would be cool to use LLM for it.)

4. **Recommendation Prompt:** After obtaining the description and links, the system uses the description to create a movie recommendation prompt. The prompt includes a list of movies and an "extra movies" section.

   ```plaintext
   According to my description, recommend me a movie from this list (under the list, in the "extra movies" section, there might be more info about movies you might not know. You can recommend from there too, even if the movie in the "extra movies" is not in the list). Under the "extra movies" section, there is a "context" section; you can use that to get more info about the movies from the "extra movies" section.:

   1. The Silence of the Lambs
   2. Pulp Fiction
   3. The Shawshank Redemption
   ...
   extra movies: {extramovies}
   context: {context}
   my description: {input}
   ```
5. **Web Scraping IMDb:** The system performs classic web scraping of IMDb to extract Title, Description, and Storyline for the movies in the "extra movies" section of the prompt.

6. **Context Enrichment:** The system enriches the recommendation prompt's context by using LangChain to extract relevant information chunks from the websites provided by the user. The process involves **scraping the websites, splitting them into chunks(Documents), embedding the chunks, and retrieving relevant information**. This information is inserted into the `{context}` section. This step ensures additional information is available even if IMDb changes over time. 

7. **LLM Recommendation:** The recommendation prompt, enriched with both LangChain context and IMDb details, is sent to the Language Model for generating a movie recommendation.

8. **User Response:** The recommendation from the LLM is provided as a response to the user, completing the interaction.

9. **Repeat Process:** The user can initiate the process again by providing new inputs, leading to a continuous and interactive movie recommendation experience.

## Future Improvements (if we had more time)

If additional development time were available, several key enhancements could be implemented to elevate the APFlix movie recommendation system:

1. **Optimized Vector Storage:**
   - *Objective:* Integrate a more scalable solution like a Vector Database instead of the current in-memory vector storage.
   - *Benefits:* This enhancement aims to support a larger list of movies, ensuring faster and more scalable operations.

2. **Enhanced User Input Sanitization:**
   - Implement additional sanitization measures using middlewares to fortify the system against potential security risks, particularly prompt injection vulnerabilities.

3. **Separation of Concerns:**
   - Refactor the codebase to establish a dedicated layer for communication with the Language Model (LLM). Currently, this functionality is embedded within the main service.

4. **Fine-Tuning Model for Movie Recommendations:**
   - Invest time in fine-tuning the Language Model specifically for movie recommendation tasks.

5. **Optimization for Faster Response Times:**
   -  Optimize the various steps involving LLM calls, web scraping, and information retrieval to reduce response times.

6. **CI/CD Implementation:**
   - Set up a Continuous Integration (CI) and Continuous Deployment (CD) pipeline. I would use github, github action and AWS ECR for CI and argocd for cd. 

7. **Comprehensive Testing:**
   - Implement robust testing mechanisms, including unit tests, integration tests, and end-to-end tests.
   - Establish automated tests specifically targeting the getRecommendation API endpoint.


