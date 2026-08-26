import 'dotenv/config';
import { dbStore } from '../src/db';
import { generateDiagnosticPaper } from '../src/paperGenerator';
import fs from 'fs';

  import { connectDB } from '../src/db';
  
  async function run() {
    // Initialize the database store
    await connectDB();
    await dbStore.init();
  
  const students = await dbStore.getStudents();
  if (students.length === 0) {
    console.log("No students found.");
    return;
  }
  
  // Pick a couple of students for the test
  const selectedStudents = students.slice(0, 2);
  const results = [];

  for (const student of selectedStudents) {
    const classMatch = student.classGroup.match(/\d+/);
    const classNumber = classMatch ? parseInt(classMatch[0], 10) : 1;

    console.log(`Generating diagnostic for ${student.name} (Class ${classNumber})`);
    
    try {
      const result = await generateDiagnosticPaper({
        classNumber,
        students: [{
          name: student.name,
          studentId: student.id,
          qrData: {
             age: student.age, classGroup: student.classGroup, section: student.section,
             schoolId: student.schoolId, currentLevel: student.currentLevel,
             currentSubLevel: student.currentSubLevel, targetLevel: student.targetLevel
          }
        }]
      });
      
      results.push({
        studentId: student.id,
        studentName: student.name,
        classNumber,
        questions: result.questions
      });
    } catch(err) {
       console.error("Error generating for student", student.name, err);
    }
  }

  const outputPath = 'diagnostic_output.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Saved to ${outputPath}`);
}

run().catch(console.error);
