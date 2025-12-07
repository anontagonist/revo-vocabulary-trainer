import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `Du bist ein hilfreicher Assistent für Schüler. 
Deine Aufgabe ist es, Vokabellisten und Kontextinformationen aus Fotos von Schulbüchern zu extrahieren.

1. Identifiziere Vokabelpaare (Fremdsprache und Übersetzung).
2. Versuche Kontextinformationen auf der Seite zu finden:
   - Welche Sprache wird gelernt? (z.B. Englisch, Latein, Französisch)
   - Welche Klassenstufe? 
   - Welches Kapitel oder Lektion?
   - Welche Seitenzahl?
3. Ignoriere Übungsanweisungen.
4. Bereinige OCR-Fehler.

Gib das Ergebnis als JSON-Objekt zurück, das 'metadata' und 'vocabulary' enthält.`;

export const extractVocabularyFromImage = async (base64Image: string): Promise<ExtractionResponse> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metadata: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING, description: "Die Fremdsprache (z.B. Englisch)" },
                grade: { type: Type.STRING, description: "Klasse oder Jahrgangsstufe" },
                chapter: { type: Type.STRING, description: "Kapitel oder Lektionsnummer" },
                page: { type: Type.STRING, description: "Seitenzahl im Buch" },
              },
            },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: {
                    type: Type.STRING,
                    description: "Das Wort in der Fremdsprache",
                  },
                  translation: {
                    type: Type.STRING,
                    description: "Die deutsche Übersetzung",
                  },
                },
                required: ["original", "translation"],
              },
            },
          },
        },
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "Analysiere dieses Schulbuchseite.",
          },
        ],
      },
    });

    const text = response.text;
    if (!text) throw new Error("Keine Antwort erhalten");

    return JSON.parse(text) as ExtractionResponse;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Konnte das Bild nicht verarbeiten. Bitte versuche es erneut.");
  }
};
