const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LoyaltyCard = require('../models/loyalty_card');
const LoyaltyPackage = require('../models/loyalty_package');
const LoyaltyRedemption = require('../models/loyalty_redemption');
const { Op } = require('sequelize');
router.get('/card', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Only patients can access loyalty cards.' });
    }
    let loyaltyCard = await LoyaltyCard.findOne({
      where: { patient_id: req.user.userId }
    });
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
router.get('/packages', auth, async (req, res) => {
  try {
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
router.post('/redeem', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Only patients can redeem loyalty packages.' });
    }
    const { package_id } = req.body;
    const loyaltyPackage = await LoyaltyPackage.findByPk(package_id);
    if (!loyaltyPackage) {
      return res.status(404).json({ message: 'Loyalty package not found' });
    }
    if (!loyaltyPackage.is_active) {
      return res.status(400).json({ message: 'This package is no longer available' });
    }
    let loyaltyCard = await LoyaltyCard.findOne({
      where: { patient_id: req.user.userId }
    });
    if (!loyaltyCard) {
      return res.status(404).json({ message: 'Loyalty card not found' });
    }
    if (loyaltyCard.points < loyaltyPackage.points_required) {
      return res.status(400).json({ message: 'Insufficient points' });
    }
    const redemption = await LoyaltyRedemption.create({
      patient_id: req.user.userId,
      package_id: loyaltyPackage.id,
      points_spent: loyaltyPackage.points_required,
      status: 'pending',
      redemption_date: new Date()
    });
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
router.get('/redemptions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Only patients can view their redemption history.' });
    }
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