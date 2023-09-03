import { Configuration, OpenAIApi } from 'openai-edge'

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }),
);

export default openai
