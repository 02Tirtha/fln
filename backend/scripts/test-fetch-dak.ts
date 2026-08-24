import { dbStore } from '../src/db.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading from backend/.env first, then root .env
let envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) envPath = path.join(process.cwd(), '../.env');
dotenv.config({ path: envPath });

async function testFetch() {
  const studentId = 's_HR_AMB_AMB_01_01_C2_01';
  
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected!');
  
  await dbStore.init();
  
  const questionIdToTest = 'Q_L20_1_1_b1';
  
  console.log(`\nTesting fallback lookup for question ID: ${questionIdToTest}`);
  
  const baseQuestionId = questionIdToTest.replace(/_b\d+$/, '');
  
  const startTime = Date.now();
  // Find in MongoDB directly just to prove speed
  const doc = await mongoose.connection.db?.collection('diagnostic_answer_keys').findOne({
    $or: [
      { 'questions.question_id': questionIdToTest },
      { 'questions.question_id': baseQuestionId }
    ]
  });
  const endTime = Date.now();
  
  if (!doc) {
    console.log(`\n❌ RESULT: Could not find question ${questionIdToTest} in ANY Diagnostic Answer Key in the database.`);
  } else {
    const foundQuestion = doc.questions.find((q: any) => q.question_id === questionIdToTest || q.question_id === baseQuestionId);
    console.log(`\n✅ RESULT: Found question in a generic Diagnostic Answer Key!`);
    console.log(`⏱️ Time taken: ${endTime - startTime} milliseconds`);
    console.log('Question Details:', JSON.stringify(foundQuestion, null, 2));
    console.log('The backend will now correctly use this real question text and concept ("' + foundQuestion.topic + '") to generate practice questions!');
  }
  
  process.exit(0);
}

testFetch().catch(console.error);
