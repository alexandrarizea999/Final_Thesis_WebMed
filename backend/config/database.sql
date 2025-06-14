CREATE TABLE IF NOT EXISTS `loyalty_cards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `total_earned_points` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_loyalty_card_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_patient_loyalty_card` (`patient_id`)
);
CREATE TABLE IF NOT EXISTS `loyalty_packages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `points_required` INT NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS `loyalty_redemptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `package_id` INT NOT NULL,
  `points_spent` INT NOT NULL,
  `status` ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  `redemption_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_redemption_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_redemption_package` FOREIGN KEY (`package_id`) REFERENCES `loyalty_packages` (`id`) ON DELETE CASCADE
); 