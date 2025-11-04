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

export const extractInfoFromCard = async (file: File): Promise<Lead | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(file);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        imagePart,
        { text: "Extract the full name, company name, email address, and phone number from this business card. If a field is not found, return an empty string for that key." }
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
        },
        required: ["name", "company", "email", "phone"],
      },
    },
  });

  try {
    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    // Basic validation to ensure the parsed object matches the Lead structure
    if (typeof parsedJson.name === 'string' &&
        typeof parsedJson.company === 'string' &&
        typeof parsedJson.email === 'string' &&
        typeof parsedJson.phone === 'string') {
      return parsedJson as Lead;
    }
    throw new Error("Parsed JSON does not match Lead structure");
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    console.error("Raw response text:", response.text);
    return null;
  }
};
