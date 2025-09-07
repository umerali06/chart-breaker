const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get payers
router.get('/payers', async (req, res) => {
  try {
    const payers = await prisma.payer.findMany({
      orderBy: { payerName: 'asc' }
    });

    res.json({ payers });

  } catch (error) {
    console.error('Get payers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get claims
router.get('/claims', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        include: {
          patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
          episode: { select: { id: true, episodeNumber: true } },
          payer: { select: { id: true, payerName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.claim.count({ where })
    ]);

    res.json({
      claims,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create claim
router.post('/claims', requireRole(['BILLER', 'ADMIN']), async (req, res) => {
  try {
    const { patientId, episodeId, payerId, claimType, claimAmount } = req.body;

    const claim = await prisma.claim.create({
      data: {
        patientId,
        episodeId,
        payerId,
        claimType,
        claimAmount: parseFloat(claimAmount)
      },
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
        payer: { select: { id: true, payerName: true } }
      }
    });

    res.status(201).json({
      message: 'Claim created successfully',
      claim
    });

  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
