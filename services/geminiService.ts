import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from '../types';

// Utility function to convert a File object to a Base64 string for the API
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result includes the mime type header, remove it.
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractInfoFromCard = async (file: File): Promise<Partial<Lead> | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(file);

  const response = await ai.models.generateContent({
    // Using a more powerful model for better accuracy with various image qualities from phone cameras.
    model: "gemini-2.5-pro",
    contents: {
      parts: [
        imagePart,
        // A more detailed prompt to guide the model's extraction process.
        { text: "You are an expert business card scanner. Carefully analyze the provided image and extract the full name, company name, email address, phone number, and country. Return the information in a JSON object that strictly adheres to the provided schema. If any field is not found on the card, its value should be an empty string." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Full name of the person, including titles if any.' },
          company: { type: Type.STRING, description: 'The name of the company.' },
          email: { type: Type.STRING, description: 'The primary email address.' },
          phone: { type: Type.STRING, description: 'The primary phone number, including extension if present.' },
          country: { type: Type.STRING, description: 'The country mentioned in the address, if any. Return empty string if not found.' },
        },
        required: ["name", "company", "email", "phone", "country"],
      },
    },
  });

  try {
    const jsonString = response.text.trim();
    // Sanitize the response string to remove potential markdown code fences for JSON.
    const sanitizedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    const parsedJson = JSON.parse(sanitizedJsonString);
    
    // Basic validation to ensure the parsed object matches the expected structure
    if (typeof parsedJson.name === 'string' &&
        typeof parsedJson.company === 'string' &&
        typeof parsedJson.email === 'string' &&
        typeof parsedJson.phone === 'string' &&
        typeof parsedJson.country === 'string') {
      return parsedJson as Partial<Lead>;
    }
    throw new Error("Parsed JSON does not match expected structure");
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    console.error("Raw response text:", response.text);
    return null;
  }
};