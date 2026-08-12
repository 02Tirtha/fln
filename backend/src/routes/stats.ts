import express from 'express';
import { dbStore } from '../db';

export function registerStatsRoutes(app: express.Express) {
  // DB connection status (used by the header status indicator).
  // Returns the active db mode + counts so the UI can show MongoDB Atlas vs local.
  app.get('/api/db-status', (_req, res) => {
    return res.json({
      connected: true,
      usingMongo: dbStore.useMongo,
      mode: dbStore.useMongo ? 'MongoDB Atlas' : 'Local File DB (Fallback)',
    });
  });

  // Public stats (no auth required — used by landing page)
  app.get('/api/stats', async (_req, res) => {
    const db = dbStore.getDb();
    if (!db) {
      const schools = await dbStore.getSchools();
      const students = await dbStore.getStudents();
      const users = await dbStore.getUsers();
      const worksheets = await dbStore.getWorksheets();

      const totalSchools = schools.length;
      const totalStudents = students.length;
      const totalUsers = users.length;
      const totalAssessments = worksheets.length;

      const stateCodes = Array.from(new Set(schools.map(s => s.stateCode).filter(Boolean)));
      const districtCodes = Array.from(new Set(schools.map(s => s.districtCode).filter(Boolean)));

      const totalLevel = students.reduce((acc, s) => acc + (s.currentLevel || 0), 0);
      const avgFlnLevel = totalStudents > 0 ? Math.round(totalLevel / totalStudents) : 0;

      const certifiedCount = students.filter(s => (s.currentLevel || 0) >= 5).length;
      const certifiedPercent = totalStudents > 0 ? Math.round((certifiedCount / totalStudents) * 100) : 0;

      return res.json({
        totalStates: stateCodes.length,
        totalDistricts: districtCodes.length,
        totalSchools,
        totalStudents,
        totalAssessments,
        avgFlnLevel,
        totalUsers,
        certifiedCount,
        certifiedPercent,
      });
    }

    const [totalSchools, totalStudents, totalUsers, totalAssessments, stateCodes, districtCodes, avgResult, certifiedResult] = await Promise.all([
      db.collection('schools').countDocuments(),
      db.collection('students').countDocuments(),
      db.collection('users').countDocuments(),
      db.collection('worksheets').countDocuments(),
      db.collection('schools').distinct('stateCode'),
      db.collection('schools').distinct('districtCode'),
      db.collection('students').aggregate([{ $group: { _id: null, avg: { $avg: '$currentLevel' } } }]).toArray(),
      db.collection('students').aggregate([{ $match: { currentLevel: { $gte: 5 } } }, { $count: 'count' }]).toArray(),
    ]);

    const certifiedCount = certifiedResult[0]?.count ?? 0;
    const avgFlnLevel = totalStudents > 0 ? Math.round(avgResult[0]?.avg ?? 0) : 0;

    res.json({
      totalStates: stateCodes.length,
      totalDistricts: districtCodes.length,
      totalSchools,
      totalStudents,
      totalAssessments,
      avgFlnLevel,
      totalUsers,
      certifiedCount,
      certifiedPercent: totalStudents > 0 ? Math.round((certifiedCount / totalStudents) * 100) : 0,
    });
  });
}
