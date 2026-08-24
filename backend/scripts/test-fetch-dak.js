const { dbStore } = require('../../src/db');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables for MongoDB connection
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testFetch() {
  const studentId = 's_HR_AMB_AMB_01_01_C2_01';
  
  console.log('Connecting to database...');
  await dbStore.init();
  
  console.log(`\nFetching Diagnostic Answer Key for student: ${studentId}`);
  const dak = await dbStore.getStudentDiagnosticAnswerKey(studentId);
  
  if (!dak) {
    console.log(`\n❌ RESULT: No Diagnostic Answer Key found in the database for student ${studentId}.`);
    console.log('This is why the remediation generator is falling back to dummy data!');
  } else {
    console.log(`\n✅ RESULT: Found Diagnostic Answer Key!`);
    console.log('Total Questions in Key:', dak.questions?.length || 0);
    console.log('\nFirst 3 Questions from the Key:');
    console.log(JSON.stringify(dak.questions?.slice(0, 3), null, 2));
  }
  
  // Also check if any DAKs exist in the entire database to prove the collection is working
  console.log('\nChecking total Diagnostic Answer Keys in database...');
  let totalKeys = 0;
  if (dbStore.mongoDb) {
    totalKeys = await dbStore.mongoDb.collection('diagnostic_answer_keys').countDocuments();
  } else {
    totalKeys = dbStore.data?.diagnosticAnswerKeys?.length || 0;
  }
  console.log(`Total Answer Keys stored across all students: ${totalKeys}`);
  
  process.exit(0);
}

testFetch().catch(console.error);
