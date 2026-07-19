export interface NumericConstraint {
  min: number;
  max: number;
}

export class NumericEngine {
  /**
   * Generates a question and answer based on templateText and variableConstraints.
   */
  generate(templateText: string, variableConstraints: Record<string, NumericConstraint> = {}) {
    const values: Record<string, number> = {};
    let question = templateText;

    // Generate random values for each constraint key and substitute
    Object.entries(variableConstraints).forEach(([key, constraint]) => {
      const min = constraint.min !== undefined ? constraint.min : 1;
      const max = constraint.max !== undefined ? constraint.max : 100;
      const val = Math.floor(Math.random() * (max - min + 1)) + min;
      values[key] = val;
      question = question.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    });

    let answer = 'Placeholder answer';
    try {
      // Evaluate comparison templates: e.g. "Is 10 greater than 5?"
      const lowercaseQ = question.toLowerCase();
      if (lowercaseQ.includes('greater than') || lowercaseQ.includes('larger than') || lowercaseQ.includes('more than')) {
        const keys = Object.keys(values);
        if (keys.length >= 2) {
          const valA = values[keys[0]];
          const valB = values[keys[1]];
          answer = valA > valB ? 'Yes' : 'No';
        }
      } else if (lowercaseQ.includes('less than') || lowercaseQ.includes('smaller than')) {
        const keys = Object.keys(values);
        if (keys.length >= 2) {
          const valA = values[keys[0]];
          const valB = values[keys[1]];
          answer = valA < valB ? 'Yes' : 'No';
        }
      } else if (lowercaseQ.includes('equal to')) {
        const keys = Object.keys(values);
        if (keys.length >= 2) {
          const valA = values[keys[0]];
          const valB = values[keys[1]];
          answer = valA === valB ? 'Yes' : 'No';
        }
      } else {
        // Fallback to evaluating arithmetic expression from template
        const mathExpression = question.replace(/[^0-9+\-*/\s()]/g, '').trim();
        if (mathExpression && /^[0-9+\-*/\s()]+$/.test(mathExpression)) {
          // eslint-disable-next-line no-eval
          const result = eval(mathExpression);
          answer = String(result);
        }
      }
    } catch {
      answer = 'Evaluator error';
    }

    return {
      question,
      answer,
      values
    };
  }
}

export const numericEngine = new NumericEngine();
