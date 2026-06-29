const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { performance } = require('perf_hooks');

let _genAI = null;
let _openai = null;

const getGenAI = (apiKey) => {
  if (!_genAI && apiKey) _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
};

const getOpenAI = (apiKey) => {
  if (!_openai && apiKey) _openai = new OpenAI({ apiKey });
  return _openai;
};

const SYSTEM_PROMPT = `
You are the official AI Email Sales Executive for "Lohitha Dharma", a premier Real Estate company.
Your goal is to understand the customer's intent and generate a highly personalized, fast, and human-like response.

RULES & INSTRUCTIONS:

1. INTENT DETECTION: Classify the customer's message into one of the following intents:
"Plot enquiry", "Villa enquiry", "Apartment enquiry", "Farm land enquiry", "Commercial property enquiry", "Investment enquiry", "Price enquiry", "Location enquiry", "Site visit request", "Availability enquiry", "Loan/EMI enquiry", "Registration enquiry", "Amenities enquiry", "Contact request", "Greeting only", "Complaint", "Follow-up customer", "Existing customer", "Unknown enquiry".

2. PERSONALIZATION: Start EVERY email exactly with:
"Dear <Customer Name>," (If the name is available, otherwise "Dear Customer,")
"Thank you for contacting Lohitha Dharma."

3. INTENT-SPECIFIC RESPONSE STRICTNESS:
- If Plot enquiry: ONLY talk about residential/open plots, plot sizes, and locations. Ask: Preferred location, Budget, Plot size, Investment or personal use? DO NOT mention villas or apartments.
- If Villa enquiry: ONLY talk about villas, features, gated community, amenities, possession, pricing. Ask: Budget, Number of bedrooms, Preferred location, Move-in timeline? DO NOT mention plots or apartments.
- If Apartment enquiry: ONLY talk about apartments/flats. Ask: BHK preference, Budget, Location, Ready-to-move or under construction?
- If Farm land enquiry: ONLY talk about farmland.
- If Commercial property enquiry: ONLY talk about commercial properties.
- If Price enquiry: Focus ONLY on pricing and explain the team will share exact pricing based on location and availability.
- If Location enquiry: Answer ONLY about location and ask for their preferred area.
- If unclear: Politely ask for more details.

4. COMPANY INFORMATION: Do NOT list all services (plots, villas, etc.) at the bottom of the email. ONLY mention the specific service the customer asked about.

5. LANGUAGE DETECTION: Automatically reply in the EXACT language the customer used (English, Telugu, or Hindi). Do not translate unless necessary. Keep the tone warm and professional, like a real sales executive.

6. AVOIDANCE: Avoid robotic language, generic paragraphs, and repeating sentences. Maximum length: 150-220 words. NEVER hallucinate exact prices or availability.

You MUST return a JSON response with the following format:
{
  "replyText": "The dynamically generated email reply body text. Use newlines (\\n) for formatting.",
  "language": "English" | "Telugu" | "Hindi",
  "intent": "Plot enquiry" | "Villa enquiry" | "Apartment enquiry" | etc,
  "extractedInfo": {
    "name": "Extracted customer name or empty string if not found",
    "phone": "Extracted phone number or empty string if not found",
    "location": "Extracted location preference or empty string if not found",
    "budget": "Extracted budget or empty string if not found",
    "propertyType": "Extracted property type or empty string if not found",
    "preferredContactTime": "Extracted contact time or empty string if not found"
  }
}
`;

const generateReply = async (customerEmail, subject, messageContent) => {
  const t0 = performance.now();
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    throw new Error('No API key provided.');
  }

  const promptText = `
Inbound Email details:
Sender Email: ${customerEmail}
Subject: ${subject}
Message Body:
${messageContent}

Extract the customer's name and intent. Shape your response strictly around that intent in their native language.
`;

  const parseSafeJSON = (rawText) => {
    try {
      let cleanText = rawText.trim();
      if (cleanText.startsWith('\`\`\`json')) cleanText = cleanText.substring(7);
      else if (cleanText.startsWith('\`\`\`')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.substring(0, cleanText.length - 3);
      
      const parsed = JSON.parse(cleanText.trim());
      if (!parsed.extractedInfo) {
        parsed.extractedInfo = { name: '', phone: '', location: '', budget: '', propertyType: '', preferredContactTime: '' };
      }
      return parsed;
    } catch (err) {
      console.error('[AI PARSE ERROR] Raw text was:', rawText);
      throw new Error('Failed to parse AI JSON response');
    }
  };

  let parsed = null;

  try {
    if (geminiKey) {
      const genAI = getGenAI(geminiKey);
      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
      const maxRetries = 2; // Reduced retries to prioritize speed
      
      let attempt = 0;
      while (attempt <= maxRetries && !parsed) {
        const currentModel = modelsToTry[Math.min(attempt, modelsToTry.length - 1)];
        try {
          const model = genAI.getGenerativeModel({ 
            model: currentModel,
            generationConfig: { responseMimeType: 'application/json' }
          });
          
          const result = await model.generateContent(SYSTEM_PROMPT + '\n' + promptText);
          
          parsed = parseSafeJSON(result.response.text());
        } catch (error) {
          console.error(`[GEMINI ATTEMPT ERROR] Attempt ${attempt}:`, error);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 1000)); // Short 1s wait for speed
            attempt++;
          } else {
            break;
          }
        }
      }
    } else if (openaiKey) {
      const openai = getOpenAI(openaiKey);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptText }
        ],
        temperature: 0.7
      });
      parsed = parseSafeJSON(completion.choices[0].message.content);
    }
  } catch (error) {
    console.error('[AI SERVICE ERROR]', error);
  }

  const aiGenerationTime = Math.round(performance.now() - t0);

  if (!parsed) {
    return {
      replyText: `Dear Customer,\n\nThank you for contacting Lohitha Dharma.\n\nOur team is currently reviewing your request and will get back to you with the latest details shortly.\n\nFor immediate assistance, please share your preferred contact number.\n\nBest regards,\nLohitha Dharma Team`,
      language: 'English',
      intent: 'Unknown enquiry',
      extractedInfo: { name: '', phone: '', location: '', budget: '', propertyType: '', preferredContactTime: '' },
      aiGenerationTime
    };
  }
  
  parsed.aiGenerationTime = aiGenerationTime;
  return parsed;
};

module.exports = {
  generateReply
};
