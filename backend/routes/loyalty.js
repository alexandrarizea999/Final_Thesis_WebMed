const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LoyaltyCard = require('../models/loyalty_card');
const LoyaltyPackage = require('../models/loyalty_package');
const LoyaltyRedemption = require('../models/loyalty_redemption');
const { Op } = require('sequelize');

// Rută pentru obținerea sau crearea cardului de loialitate al unui pacient
// GET /loyalty/card
// Necesită autentificare și rol de pacient
router.get('/card', auth, async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este pacient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Only patients can access loyalty cards.' });
    }

    // Căutăm cardul de loialitate existent
    let loyaltyCard = await LoyaltyCard.findOne({
      where: { patient_id: req.user.userId }
    });

    // Dacă nu există, creăm unul nou cu 0 puncte
    if (!loyaltyCard) {
      loyaltyCard = await LoyaltyCard.create({
        patient_id: req.user.userId,
        points: 0,
        total_earned_points: 0
      });
    }

    res.json(loyaltyCard);
  } catch (error) {
    console.error('Error fetching loyalty card:', error);
    res.status(500).json({ message: 'Error fetching loyalty card' });
  }
});

// Rută pentru obținerea tuturor pachetelor de loialitate active
// GET /loyalty/packages
// Necesită autentificare
router.get('/packages', auth, async (req, res) => {
  try {
    // Obținem toate pachetele active, ordonate după punctele necesare
    const packages = await LoyaltyPackage.findAll({
      where: { is_active: true },
      order: [['points_required', 'ASC']]
    });

    res.json(packages);
  } catch (error) {
    console.error('Error fetching loyalty packages:', error);
    res.status(500).json({ message: 'Error fetching loyalty packages' });
  }
});

// Rută pentru răscumpărarea unui pachet de loialitate
// POST /loyalty/redeem
// Necesită autentificare și rol de pacient
router.post('/redeem', auth, async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este pacient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Only patients can redeem loyalty packages.' });
    }

    const { package_id } = req.body;

    // Verificăm dacă pachetul există și este activ
    const loyaltyPackage = await LoyaltyPackage.findByPk(package_id);
    if (!loyaltyPackage) {
      return res.status(404).json({ message: 'Loyalty package not found' });
    }
    if (!loyaltyPackage.is_active) {
      return res.status(400).json({ message: 'This package is no longer available' });
    }

    // Verificăm cardul de loialitate al pacientului
    let loyaltyCard = await LoyaltyCard.findOne({
      where: { patient_id: req.user.userId }
    });
    if (!loyaltyCard) {
      return res.status(404).json({ message: 'Loyalty card not found' });
    }

    // Verificăm dacă pacientul are suficiente puncte
    if (loyaltyCard.points < loyaltyPackage.points_required) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Creăm înregistrarea de răscumpărare
    const redemption = await LoyaltyRedemption.create({
      patient_id: req.user.userId,
      package_id: loyaltyPackage.id,
      points_spent: loyaltyPackage.points_required,
      status: 'pending',
      redemption_date: new Date()
    });

    // Scădem punctele din cardul de loialitate
    loyaltyCard.points -= loyaltyPackage.points_required;
    await loyaltyCard.save();

    res.status(201).json({
      message: 'Package redeemed successfully',
      redemption,
      remaining_points: loyaltyCard.points
    });
  } catch (error) {
    console.error('Error redeeming loyalty package:', error);
    res.status(500).json({ message: 'Error redeeming loyalty package' });
  }
});

// Rută pentru vizualizarea istoricului răscumpărărilor
// GET /loyalty/redemptions
// Necesită autentificare și rol de pacient
router.get('/redemptions', auth, async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este pacient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Only patients can view their redemption history.' });
    }

    // Obținem toate răscumpărările pacientului, inclusiv detaliile pachetelor
    const redemptions = await LoyaltyRedemption.findAll({
      where: { patient_id: req.user.userId },
      include: [
        { model: LoyaltyPackage, as: 'package' }
      ],
      order: [['redemption_date', 'DESC']]
    });

    res.json(redemptions);
  } catch (error) {
    console.error('Error fetching redemption history:', error);
    res.status(500).json({ message: 'Error fetching redemption history' });
  }
});

module.exports = router; 