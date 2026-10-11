import express from 'express';
import { registerRemediationRoutes } from '../routes/remediation';
import { dbStore, UserRole } from '../db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../auth';

async function runTest() {
  await dbStore.init();

  const app = express();
  app.use(express.json());
  registerRemediationRoutes(app);

  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;

  const users = await dbStore.getUsers();
  const testUser = users.find(u => u.role === UserRole.TEACHER) || users[0];

  const token = jwt.sign(
    { email: testUser.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  let allPassed = true;

  // Route 1: POST /api/remediation/generate with non-existent student
  {
    const res = await fetch(`${baseUrl}/api/remediation/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        studentId: 'non_existent_student_999',
        examId: 'exam_1',
        failedQuestionIds: ['q1']
      })
    });
    const status = res.status;
    const body: any = await res.json();
    if (status === 404 && body.error === 'Student not found.') {
      console.log('✓ Route 1 (POST /generate): correctly returns 404 for unknown student');
    } else {
      console.error(`✗ Route 1 failed: status=${status}`, body);
      allPassed = false;
    }
  }

  // Route 2: GET /api/remediation/ledgers with non-existent student
  {
    const res = await fetch(`${baseUrl}/api/remediation/ledgers?studentId=non_existent_student_999`, {
      method: 'GET',
      headers
    });
    const status = res.status;
    const body: any = await res.json();
    if (status === 404 && body.error === 'Student not found.') {
      console.log('✓ Route 2 (GET /ledgers): correctly returns 404 for unknown student');
    } else {
      console.error(`✗ Route 2 failed: status=${status}`, body);
      allPassed = false;
    }
  }

  // Route 3: POST /api/remediation/ledgers/:ledgerId/generate where ledger does not exist
  {
    const res = await fetch(`${baseUrl}/api/remediation/ledgers/unknown_ledger_123/generate`, {
      method: 'POST',
      headers
    });
    const status = res.status;
    const body: any = await res.json();
    if (status === 404) {
      console.log('✓ Route 3 (POST /ledgers/:id/generate): correctly returns 404 when ledger not found');
    } else {
      console.error(`✗ Route 3 failed: status=${status}`, body);
      allPassed = false;
    }
  }

  // Route 4: GET /api/remediation/batch/:examId
  {
    const res = await fetch(`${baseUrl}/api/remediation/batch/non_existent_exam_999`, {
      method: 'GET',
      headers
    });
    const status = res.status;
    const body: any = await res.json();
    if (status === 404) {
      console.log('✓ Route 4 (GET /batch/:examId): correctly returns 404 when no accessible ledgers');
    } else {
      console.error(`✗ Route 4 failed: status=${status}`, body);
      allPassed = false;
    }
  }

  // Route 5: GET /api/remediation/:studentId/:examId with non-existent student
  {
    const res = await fetch(`${baseUrl}/api/remediation/non_existent_student_999/exam_1`, {
      method: 'GET',
      headers
    });
    const status = res.status;
    const body: any = await res.json();
    if (status === 404 && body.error === 'Student not found.') {
      console.log('✓ Route 5 (GET /:studentId/:examId): correctly returns 404 for unknown student');
    } else {
      console.error(`✗ Route 5 failed: status=${status}`, body);
      allPassed = false;
    }
  }

  server.close();

  if (allPassed) {
    console.log('\nAll 5 remediation route security/404 checks passed successfully! ✅');
  } else {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
