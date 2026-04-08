import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

async function test() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("ERROR: OPENAI_API_KEY no está definida en .env");
      return;
    }
    
    console.log("Testeando OpenAI API con la key definida...");
    
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 5
    });
    
    console.log('API OK =>', response.choices[0].message.content);
  } catch (error) {
    console.error('API ERROR =>', error.message);
    if (error.status) {
      console.error('Status code:', error.status);
    }
  }
}

test();
