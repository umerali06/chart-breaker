const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalPatients,
      activeEpisodes,
      pendingVisits,
      pendingClaims,
      pendingQaReviews
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.episode.count({ where: { status: 'ACTIVE' } }),
      prisma.schedule.count({ where: { status: 'SCHEDULED' } }),
      prisma.claim.count({ where: { status: 'PENDING' } }),
      prisma.qaReview.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      stats: {
        totalPatients,
        activeEpisodes,
        pendingVisits,
        pendingClaims,
        pendingQaReviews
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get productivity report
router.get('/productivity', requireRole(['ADMIN', 'QA_REVIEWER']), async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const productivity = await prisma.visitNote.groupBy({
      by: ['clinicianId'],
      where: {
        visitDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      _avg: {
        visitDate: true
      }
    });

    res.json({ productivity });

  } catch (error) {
    console.error('Get productivity report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
