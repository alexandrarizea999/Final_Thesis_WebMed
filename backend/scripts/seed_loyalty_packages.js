const { sequelize } = require('../config/database');
const LoyaltyPackage = require('../models/loyalty_package');

async function seedLoyaltyPackages() {
  try {
    // Sample packages
    const packages = [
      {
        name: 'Consultație Gratuită',
        description: 'O consultație gratuită la medicul de familie sau la un specialist la alegere.',
        points_required: 100,
        is_active: true
      },
      {
        name: 'Reducere 15% Analize',
        description: 'Reducere de 15% la un pachet complet de analize medicale.',
        points_required: 150,
        is_active: true
      },
      {
        name: 'Ecografie Gratuită',
        description: 'O ecografie gratuită la alegere (abdominală, tiroidiană, etc.).',
        points_required: 250,
        is_active: true
      },
      {
        name: 'Pachet Check-up Complet',
        description: 'Un check-up medical complet ce include consultație, analize și interpretarea rezultatelor.',
        points_required: 500,
        is_active: true
      }
    ];

    // Insert packages
    await LoyaltyPackage.bulkCreate(packages);
    
    console.log('Loyalty packages seeded successfully');
  } catch (error) {
    console.error('Error seeding loyalty packages:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the seeder
seedLoyaltyPackages(); 