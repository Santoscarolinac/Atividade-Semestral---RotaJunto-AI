import { GoogleGenAI, Type } from "@google/genai";
import { Ride, RideStatus } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates simulated rides based on a destination search using Gemini.
 * This simulates a database query by asking the AI to "find" matches.
 */
export const findRidesWithAI = async (destination: string, userLocation: string): Promise<Partial<Ride>[]> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    O usuário está em "${userLocation}" e quer ir para "${destination}".
    Gere 4 opções realistas de caronas/rotas compartilhadas que estariam disponíveis hoje ou amanhã.
    Para cada carona, invente um motorista, um veículo, um custo total realista em Reais (BRL) para o trajeto,
    e uma capacidade total de passageiros (entre 3 e 6).
    Adicione uma breve descrição amigável sobre a rota ou o motorista.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  driverName: { type: Type.STRING },
                  origin: { type: Type.STRING },
                  destination: { type: Type.STRING },
                  time: { type: Type.STRING, description: "Horário formato HH:MM" },
                  totalCost: { type: Type.NUMBER, description: "Custo total da viagem" },
                  capacity: { type: Type.NUMBER },
                  vehicle: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const data = JSON.parse(jsonText);
    
    // Transform API data to App format
    return data.rides.map((r: any, index: number) => ({
      ...r,
      id: `generated-${Date.now()}-${index}`,
      date: new Date().toISOString().split('T')[0], // Assume today for simplicity
      passengers: [], // Start empty
      status: RideStatus.OPEN
    }));

  } catch (error) {
    console.error("Erro ao buscar rotas com Gemini:", error);
    return [];
  }
};

/**
 * Calculates a fair split tip or insight using AI
 */
export const getCostInsight = async (totalCost: number, numPassengers: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `O custo da viagem é R$${totalCost} e será dividido por ${numPassengers} pessoas. 
      Calcule o valor por pessoa e dê uma dica rápida e amigável sobre a economia feita ou sobre sustentabilidade ao compartilhar carona. 
      Máximo de 2 frases.`,
    });
    return response.text || "Dividir a viagem ajuda o bolso e o planeta!";
  } catch (e) {
    return `O custo será de R$${(totalCost / numPassengers).toFixed(2)} por pessoa.`;
  }
};