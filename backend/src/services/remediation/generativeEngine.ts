import { generateAIDiagnostic } from '../../gemini';

export class GenerativeEngine {
  /**
   * Generates a question using Gemini or AI models.
   */
  async generate(templateText: string, promptTemplate: string = '') {
    const finalPrompt = `${promptTemplate || 'Generate a school level question.'} Template / pattern to follow: ${templateText}`;
    
    try {
      // Use existing AI generation function
      const aiQuestions = await generateAIDiagnostic('Remediation Student', 'Class 2');
      if (aiQuestions && aiQuestions.length > 0) {
        const firstQ = aiQuestions[0];
        return {
          question: firstQ.question,
          answer: firstQ.answer || 'Answer not generated',
          aiGenerated: true
        };
      }
    } catch (err) {
      console.error('Generative engine AI call failed, falling back:', err);
    }

    // Fallback if AI generation fails or is disabled
    let question = templateText;
    const placeholderRegex = /\{(\d+)\}/g;
    const matches = [...templateText.matchAll(placeholderRegex)];
    matches.forEach((_m, idx) => {
      question = question.replace(new RegExp(`\\{${idx}\\}`, 'g'), '[generate]');
    });

    return {
      question,
      answer: 'Generative answer fallback',
      aiGenerated: false
    };
  }
}

export const generativeEngine = new GenerativeEngine();
