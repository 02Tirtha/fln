import { Type } from "@google/genai";
import { getAiClient, generateContentWithRetry } from '../../gemini';

export class GenerativeEngine {
  /**
   * Generates a practice question similar to the original question using AI.
   * @param originalQuestion - The question the student got wrong
   * @param conceptName - The concept/topic name
   * @param promptTemplate - Optional custom prompt template
   */
  async generate(originalQuestion: string, conceptName: string, promptTemplate?: string): Promise<{
    question: string;
    answer: string;
    aiGenerated: boolean;
  }> {
    const prompt = promptTemplate || `You are a math teacher creating a practice question for a student who got a similar question wrong.

Original question the student got wrong: "${originalQuestion}"
Concept: ${conceptName}

Generate ONE similar but distinct practice question that:
1. Tests the SAME concept (${conceptName})
2. Uses DIFFERENT numbers/values but SAME structure/type
3. Is at the SAME difficulty level
4. Is appropriate for the same grade level

Return ONLY a JSON object with:
{
  "question": "The practice question text",
  "answer": "The correct answer"
}`;

    try {
      const ai = getAiClient();
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a math teacher creating personalized remediation practice questions. Generate questions that are similar in concept and structure but use different values.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["question", "answer"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.question && parsed.answer) {
        return {
          question: parsed.question,
          answer: parsed.answer,
          aiGenerated: true
        };
      }
    } catch (err) {
      console.error('Generative engine AI call failed, falling back:', err);
    }

    // Fallback: generate a simple variation based on the original question pattern
    return this.generateFallback(originalQuestion, conceptName);
  }

  /**
   * Fallback generation when AI is unavailable - creates a variation by modifying numbers
   */
  private generateFallback(originalQuestion: string, conceptName: string) {
    // Extract numbers from the original question
    const numbers = originalQuestion.match(/\d+/g)?.map(Number) || [];

    let question = originalQuestion;
    let answer = 'Answer not generated';

    if (numbers.length > 0) {
      // Replace each number with a different number of similar magnitude
      question = originalQuestion.replace(/\d+/g, () => {
        const original = numbers.shift()!;
        const variation = original <= 10
          ? Math.max(1, original + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3) + 1)
          : original <= 100
            ? Math.max(1, original + (Math.random() > 0.5 ? 10 : -10) + Math.floor(Math.random() * 10))
            : Math.max(1, original + (Math.random() > 0.5 ? 50 : -50) + Math.floor(Math.random() * 50));
        return String(variation);
      });

      // Try to compute answer if it's a simple arithmetic expression
      try {
        const mathExpr = question.replace(/[^0-9+\-*/\s().]/g, '').trim();
        if (mathExpr && /^[0-9+\-*/\s().]+$/.test(mathExpr)) {
          // eslint-disable-next-line no-eval
          answer = String(eval(mathExpr));
        }
      } catch {
        answer = 'Compute from question';
      }
    }

    return {
      question,
      answer,
      aiGenerated: false
    };
  }
}

export const generativeEngine = new GenerativeEngine();
