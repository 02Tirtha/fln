import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './middlewares/errorHandler';
import stateRoutes from './routes/state.routes';
import districtRoutes from './routes/district.routes';
import blockRoutes from './routes/block.routes';
import schoolRoutes from './routes/school.routes';
import authRoutes from './routes/auth.routes';
import teacherRoutes from './routes/teacher.routes';
import classRoutes from './routes/class/class.routes';
import studentRoutes from './routes/student/student.routes';
import { State } from './models/state.model';
import { District } from './models/district.model';
import { School } from './models/school.model';
import { Student } from './models/student/student.model';
import { Teacher } from './models/teacher.model';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is running', data: null });
});

// Public stats endpoint (used by landing page)
app.get('/api/stats', async (_req, res) => {
  console.log('[api] GET /api/stats hit');
  try {
    const userCollection = mongoose.connection.db.collection('users');
    const [totalStates, totalDistricts, totalSchools, totalStudents, totalTeachers] = await Promise.all([
      State.countDocuments(),
      District.countDocuments(),
      School.countDocuments(),
      Student.countDocuments(),
      userCollection.countDocuments({ role: 'teacher' }),
    ]);
    return res.json({ totalStates, totalDistricts, totalSchools, totalStudents, totalTeachers });
  } catch (err: any) {
    console.error('[api] /api/stats error', err.message || err);
    return res.status(500).json({ error: 'Failed to compute stats' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);

app.use(errorHandler);

export default app;
