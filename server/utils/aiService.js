const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const moderateProvider = async (providerData) => {
  try {
    const prompt = `Perform a high-fidelity audit on the following service provider profile.
    Name: ${providerData.user?.name}
    Category: ${providerData.categories?.join(', ')}
    Experience: ${providerData.experience} years
    Description: ${providerData.description}
    Trust Score: ${providerData.trustScore}
    
    Guidelines: 
    1. If the description is professional, logical, and mentions specific skills, approve.
    2. If the trust score is below 50, flag for review.
    3. If the categories match the description, approve.
    4. If the description contains placeholder text like "asdf" or "test", reject.

    Respond ONLY in JSON format:
    {
      "isApproved": boolean,
      "isGenuine": boolean,
      "analysis": "Brief 1-sentence analytical pulse",
      "severity": "low | medium | high | critical"
    }`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a professional service marketplace auditor. Perform extreme verification pulses.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error('[AI-PULSE ERROR]: Audit Failed:', err.message);
    return { isApproved: true, isGenuine: true, analysis: 'AI Pulse Overridden: Automatic Approval' };
  }
};

const moderateChat = async (messageContent) => {
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Audit the following chat message for offensive words, harassment, or non-professional conduct. Respond in JSON with "isProfessional": boolean and "flaggedWords": string[].' },
        { role: 'user', content: messageContent }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    return { isProfessional: true, flaggedWords: [] };
  }
};

module.exports = {
  moderateProvider,
  moderateChat
};
