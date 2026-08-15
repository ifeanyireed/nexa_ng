-- Nexa NG Complete Schema and Seed Data for MySQL / Hostinger phpMyAdmin

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `Message`;
DROP TABLE IF EXISTS `Delivery`;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS `Transaction`;
DROP TABLE IF EXISTS `Wallet`;
DROP TABLE IF EXISTS `Booking`;
DROP TABLE IF EXISTS `Product`;
DROP TABLE IF EXISTS `Article`;
DROP TABLE IF EXISTS `Service`;
DROP TABLE IF EXISTS `ProProfile`;
DROP TABLE IF EXISTS `User`;

CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'CLIENT',
  `isOnline` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `User_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProProfile` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `businessName` VARCHAR(191) NULL,
  `slug` VARCHAR(191) NULL,
  `bio` TEXT NULL,
  `hourlyRate` DOUBLE NULL,
  `specialties` VARCHAR(191) NULL,
  `niche` VARCHAR(191) NULL,
  `subService` VARCHAR(191) NULL,
  `specialtyLevel` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `area` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `whatsapp` VARCHAR(191) NULL,
  `businessEmail` VARCHAR(191) NULL,
  `nin` VARCHAR(191) NULL,
  `plan` VARCHAR(191) NULL DEFAULT 'basic',
  `subscriptionExpiresAt` DATETIME(3) NULL,
  `verified` BOOLEAN NOT NULL DEFAULT false,
  `acceptsPos` BOOLEAN NOT NULL DEFAULT false,
  `homeDelivery` BOOLEAN NOT NULL DEFAULT false,
  `rating` DOUBLE NOT NULL DEFAULT 0,
  `profileViews` INT NOT NULL DEFAULT 0,
  `logoUrl` VARCHAR(500) NULL,
  `catalog` TEXT NULL,
  `availability` TEXT NULL,
  UNIQUE INDEX `ProProfile_userId_key`(`userId`),
  UNIQUE INDEX `ProProfile_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Service` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `price` DOUBLE NOT NULL,
  `proProfileId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Article` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `image` VARCHAR(500) NULL,
  `niche` VARCHAR(191) NOT NULL,
  `proProfileId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Product` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `price` DOUBLE NOT NULL,
  `image` VARCHAR(500) NULL,
  `proProfileId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Booking` (
  `id` VARCHAR(191) NOT NULL,
  `clientId` VARCHAR(191) NOT NULL,
  `proProfileId` VARCHAR(191) NOT NULL,
  `serviceName` VARCHAR(191) NULL,
  `amount` DOUBLE NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'STANDARD',
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `scheduledAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Wallet` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `balance` DOUBLE NOT NULL DEFAULT 0,
  UNIQUE INDEX `Wallet_userId_key`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Transaction` (
  `id` VARCHAR(191) NOT NULL,
  `walletId` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Order` (
  `id` VARCHAR(191) NOT NULL,
  `clientId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `amount` DOUBLE NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `shippingAddress` TEXT NULL,
  `phone` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Delivery` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `trackingNumber` VARCHAR(191) NULL,
  `carrier` VARCHAR(191) NULL,
  `estimatedDelivery` DATETIME(3) NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Delivery_orderId_key`(`orderId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Message` (
  `id` VARCHAR(191) NOT NULL,
  `senderId` VARCHAR(191) NOT NULL,
  `receiverId` VARCHAR(191) NOT NULL,
  `text` TEXT NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ProProfile` ADD CONSTRAINT `ProProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Service` ADD CONSTRAINT `Service_proProfileId_fkey` FOREIGN KEY (`proProfileId`) REFERENCES `ProProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Article` ADD CONSTRAINT `Article_proProfileId_fkey` FOREIGN KEY (`proProfileId`) REFERENCES `ProProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Product` ADD CONSTRAINT `Product_proProfileId_fkey` FOREIGN KEY (`proProfileId`) REFERENCES `ProProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_proProfileId_fkey` FOREIGN KEY (`proProfileId`) REFERENCES `ProProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Order` ADD CONSTRAINT `Order_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Order` ADD CONSTRAINT `Order_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- SEED DATA INSERTION
-- =================================================================

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_admin_01', 'admin@nexa.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Nexa Super Admin', 'ADMIN', true);
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_client_01', 'client@nexa.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Test Client', 'CLIENT', false);
INSERT INTO `Wallet` (`id`, `userId`, `balance`) VALUES ('wal_client_01', 'usr_client_01', 50000);

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_01', 'bisi@handyman.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Bisi Fix-It', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_01', 'usr_pro_01', 'Bisi Fix-It Services', 'bisi-fix-it-services', 'Expert leakage repairs and piping installations.', 4000, 'Plumber', 'home-services', 'handyman-finders', 'Master', 'Lagos', 'Ikeja', '+2348012345678', '+2348012345678', 'bisi@handyman.ng', true, true, true, 4.8, 120, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_01', 'Plumber Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_01');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_01', 'Premium Toolbox Set', 'Complete set of high-quality tools for home repairs.', 45000, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60', 'pro_prf_01');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_01', 'How to choose the best Plumber in Lagos', 'This is an expert guide by Bisi Fix-It detailing how to find, evaluate, and choose a top-quality Plumber for your project in Nigeria.', '/article_home.jpg', 'home-services', 'pro_prf_01');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_02', 'alabi@handyman.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Alabi Spark', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_02', 'usr_pro_02', 'Alabi Spark Services', 'alabi-spark-services', 'Residential wiring and fault clearing specialist.', 4000, 'Electrician', 'home-services', 'handyman-finders', 'Master', 'Lagos', 'Garki', '+2348012345678', '+2348012345678', 'alabi@handyman.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_02', 'Electrician Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_02');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_02', 'Smart Home Security Kit', 'Advanced security cameras and sensors.', 120000, 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=500&auto=format&fit=crop&q=60', 'pro_prf_02');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_02', 'How to choose the best Electrician in Lagos', 'This is an expert guide by Alabi Spark detailing how to find, evaluate, and choose a top-quality Electrician for your project in Nigeria.', '/article_home.jpg', 'home-services', 'pro_prf_02');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_03', 'tunde@handyman.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Tunde Woodworks', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_03', 'usr_pro_03', 'Tunde Woodworks Services', 'tunde-woodworks-services', 'Custom furniture and structural repairs.', 4000, 'Carpenter', 'home-services', 'handyman-finders', 'Master', 'Lagos', 'Lekki', '+2348012345678', '+2348012345678', 'tunde@handyman.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_03', 'Carpenter Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_03');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_03', 'Premium Toolbox Set', 'Complete set of high-quality tools for home repairs.', 45000, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60', 'pro_prf_03');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_03', 'How to choose the best Carpenter in Lagos', 'This is an expert guide by Tunde Woodworks detailing how to find, evaluate, and choose a top-quality Carpenter for your project in Nigeria.', '/article_home.jpg', 'home-services', 'pro_prf_03');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_04', 'paint@handyman.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'PaintPro Lagos', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_04', 'usr_pro_04', 'PaintPro Lagos Services', 'paintpro-lagos-services', 'Flawless wall finishing and premium coat application.', 4000, 'Painter', 'home-services', 'handyman-finders', 'Master', 'Lagos', 'Surulere', '+2348012345678', '+2348012345678', 'paint@handyman.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_04', 'Painter Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_04');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_04', 'Smart Home Security Kit', 'Advanced security cameras and sensors.', 120000, 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=500&auto=format&fit=crop&q=60', 'pro_prf_04');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_04', 'How to choose the best Painter in Lagos', 'This is an expert guide by PaintPro Lagos detailing how to find, evaluate, and choose a top-quality Painter for your project in Nigeria.', '/article_home.jpg', 'home-services', 'pro_prf_04');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_05', 'info@sunvolt.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'SunVolt Solar', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_05', 'usr_pro_05', 'SunVolt Solar Services', 'sunvolt-solar-services', 'Sustainable energy solutions for homes.', 4000, 'Solar Installer', 'home-services', 'specialist-finders', 'Master', 'Lagos', 'Wuse', '+2348012345678', '+2348012345678', 'info@sunvolt.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_05', 'Solar Installer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_05');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_05', 'Premium Toolbox Set', 'Complete set of high-quality tools for home repairs.', 45000, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60', 'pro_prf_05');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_05', 'How to choose the best Solar Installer in Lagos', 'This is an expert guide by SunVolt Solar detailing how to find, evaluate, and choose a top-quality Solar Installer for your project in Nigeria.', '/article_home.jpg', 'home-services', 'pro_prf_05');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_06', 'repair@coolair.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'CoolAir Tech', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_06', 'usr_pro_06', 'CoolAir Tech Services', 'coolair-tech-services', 'AC and cooling system specialists.', 4000, 'AC Technician', 'home-services', 'specialist-finders', 'Master', 'Lagos', 'Yaba', '+2348012345678', '+2348012345678', 'repair@coolair.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_06', 'AC Technician Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_06');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_06', 'Smart Home Security Kit', 'Advanced security cameras and sensors.', 120000, 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=500&auto=format&fit=crop&q=60', 'pro_prf_06');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_06', 'How to choose the best AC Technician in Lagos', 'This is an expert guide by CoolAir Tech detailing how to find, evaluate, and choose a top-quality AC Technician for your project in Nigeria.', '/article_home.jpg', 'home-services', 'pro_prf_06');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_07', 'clean@sparkle.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Sparkle Cleaners', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_07', 'usr_pro_07', 'Sparkle Cleaners Services', 'sparkle-cleaners-services', 'Professional home and office cleaning.', 4000, 'Home Cleaner', 'home-services', 'sanitation-finders', 'Master', 'Lagos', 'Victoria-Island', '+2348012345678', '+2348012345678', 'clean@sparkle.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_07', 'Home Cleaner Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_07');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_07', 'Premium Toolbox Set', 'Complete set of high-quality tools for home repairs.', 45000, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60', 'pro_prf_07');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_07', 'How to choose the best Home Cleaner in Lagos', 'This is an expert guide by Sparkle Cleaners detailing how to find, evaluate, and choose a top-quality Home Cleaner for your project in Nigeria.', '/article_home.jpg', 'home-services', 'pro_prf_07');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_08', 'pest@ecopest.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'EcoPest Solutions', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_08', 'usr_pro_08', 'EcoPest Solutions Services', 'ecopest-solutions-services', 'Safe and effective pest control.', 4000, 'Fumigator', 'home-services', 'sanitation-finders', 'Master', 'Lagos', 'Maitama', '+2348012345678', '+2348012345678', 'pest@ecopest.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_08', 'Fumigator Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_08');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_08', 'Smart Home Security Kit', 'Advanced security cameras and sensors.', 120000, 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=500&auto=format&fit=crop&q=60', 'pro_prf_08');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_08', 'How to choose the best Fumigator in Lagos', 'This is an expert guide by EcoPest Solutions detailing how to find, evaluate, and choose a top-quality Fumigator for your project in Nigeria.', '/article_home.jpg', 'home-services', 'pro_prf_08');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_09', 'cuts@dapper.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Dapper Cuts', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_09', 'usr_pro_09', 'Dapper Cuts Services', 'dapper-cuts-services', 'Modern haircuts and grooming for men.', 4000, 'Barber', 'fashion', 'style-finders', 'Master', 'Lagos', 'Ikeja', '+2348012345678', '+2348012345678', 'cuts@dapper.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_09', 'Barber Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_09');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_09', 'Bespoke Native Fabric', 'High-quality traditional fabric.', 25000, 'https://images.unsplash.com/photo-1603228254119-e6a4d015fb73?w=500&auto=format&fit=crop&q=60', 'pro_prf_09');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_09', 'How to choose the best Barber in Lagos', 'This is an expert guide by Dapper Cuts detailing how to find, evaluate, and choose a top-quality Barber for your project in Nigeria.', '/article_fashion.jpg', 'fashion', 'pro_prf_09');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_10', 'bespoke@stitch.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'StitchPerfect Bespoke', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_10', 'usr_pro_10', 'StitchPerfect Bespoke Services', 'stitchperfect-bespoke-services', 'Exquisite tailor-made traditional and formal wear.', 4000, 'Tailor', 'fashion', 'style-finders', 'Master', 'Lagos', 'Surulere', '+2348012345678', '+2348012345678', 'bespoke@stitch.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_10', 'Tailor Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_10');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_10', 'Men's Grooming Kit', 'Premium beard oils and clippers.', 12000, 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=60', 'pro_prf_10');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_10', 'How to choose the best Tailor in Lagos', 'This is an expert guide by StitchPerfect Bespoke detailing how to find, evaluate, and choose a top-quality Tailor for your project in Nigeria.', '/article_fashion.jpg', 'fashion', 'pro_prf_10');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_11', 'fresh@press.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'FreshPress Laundry', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_11', 'usr_pro_11', 'FreshPress Laundry Services', 'freshpress-laundry-services', 'Fast and reliable laundry services.', 4000, 'Laundry', 'fashion', 'wardrobe-finders', 'Master', 'Lagos', 'Garki', '+2348012345678', '+2348012345678', 'fresh@press.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_11', 'Laundry Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_11');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_11', 'Bespoke Native Fabric', 'High-quality traditional fabric.', 25000, 'https://images.unsplash.com/photo-1603228254119-e6a4d015fb73?w=500&auto=format&fit=crop&q=60', 'pro_prf_11');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_11', 'How to choose the best Laundry in Lagos', 'This is an expert guide by FreshPress Laundry detailing how to find, evaluate, and choose a top-quality Laundry for your project in Nigeria.', '/article_fashion.jpg', 'fashion', 'pro_prf_11');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_12', 'shop@chic.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Chic Curations', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_12', 'usr_pro_12', 'Chic Curations Services', 'chic-curations-services', 'Personal styling and shopping assistance.', 4000, 'Personal Shopper', 'fashion', 'wardrobe-finders', 'Master', 'Lagos', 'Lekki', '+2348012345678', '+2348012345678', 'shop@chic.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_12', 'Personal Shopper Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_12');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_12', 'Men's Grooming Kit', 'Premium beard oils and clippers.', 12000, 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=60', 'pro_prf_12');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_12', 'How to choose the best Personal Shopper in Lagos', 'This is an expert guide by Chic Curations detailing how to find, evaluate, and choose a top-quality Personal Shopper for your project in Nigeria.', '/article_fashion.jpg', 'fashion', 'pro_prf_12');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_13', 'hello@codecraft.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'CodeCraft Studios', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_13', 'usr_pro_13', 'CodeCraft Studios Services', 'codecraft-studios-services', 'Building world-class web and mobile applications.', 4000, 'Web Developer', 'professionals', 'tech-finders', 'Master', 'Lagos', 'Yaba', '+2348012345678', '+2348012345678', 'hello@codecraft.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_13', 'Web Developer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_13');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_13', 'Ergonomic Office Chair', 'Comfortable seating for long hours.', 85000, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&auto=format&fit=crop&q=60', 'pro_prf_13');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_13', 'How to choose the best Web Developer in Lagos', 'This is an expert guide by CodeCraft Studios detailing how to find, evaluate, and choose a top-quality Web Developer for your project in Nigeria.', '/article_professionals.jpg', 'professionals', 'pro_prf_13');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_14', 'design@pixel.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'PixelPerfect Design', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_14', 'usr_pro_14', 'PixelPerfect Design Services', 'pixelperfect-design-services', 'Intuitive UI/UX design and branding.', 4000, 'UI/UX Designer', 'professionals', 'tech-finders', 'Master', 'Lagos', 'Wuse', '+2348012345678', '+2348012345678', 'design@pixel.ng', true, true, true, 4.8, 120, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_14', 'UI/UX Designer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_14');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_14', 'Mechanical Keyboard', 'Tactile typing experience.', 35000, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60', 'pro_prf_14');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_14', 'How to choose the best UI/UX Designer in Lagos', 'This is an expert guide by PixelPerfect Design detailing how to find, evaluate, and choose a top-quality UI/UX Designer for your project in Nigeria.', '/article_professionals.jpg', 'professionals', 'pro_prf_14');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_15', 'legal@lex.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'LexAdvocate Partners', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_15', 'usr_pro_15', 'LexAdvocate Partners Services', 'lexadvocate-partners-services', 'Comprehensive legal services for businesses.', 4000, 'Lawyer', 'professionals', 'corporate-finders', 'Master', 'Lagos', 'Ikoyi', '+2348012345678', '+2348012345678', 'legal@lex.ng', true, true, true, 4.8, 120, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_15', 'Lawyer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_15');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_15', 'Ergonomic Office Chair', 'Comfortable seating for long hours.', 85000, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&auto=format&fit=crop&q=60', 'pro_prf_15');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_15', 'How to choose the best Lawyer in Lagos', 'This is an expert guide by LexAdvocate Partners detailing how to find, evaluate, and choose a top-quality Lawyer for your project in Nigeria.', '/article_professionals.jpg', 'professionals', 'pro_prf_15');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_16', 'tax@auditpro.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'AuditPro Consulting', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_16', 'usr_pro_16', 'AuditPro Consulting Services', 'auditpro-consulting-services', 'Expert accounting and tax management.', 4000, 'Accountant', 'professionals', 'corporate-finders', 'Master', 'Lagos', 'Ikeja', '+2348012345678', '+2348012345678', 'tax@auditpro.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_16', 'Accountant Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_16');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_16', 'Mechanical Keyboard', 'Tactile typing experience.', 35000, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60', 'pro_prf_16');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_16', 'How to choose the best Accountant in Lagos', 'This is an expert guide by AuditPro Consulting detailing how to find, evaluate, and choose a top-quality Accountant for your project in Nigeria.', '/article_professionals.jpg', 'professionals', 'pro_prf_16');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_17', 'write@wordsmith.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'WordSmith Media', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_17', 'usr_pro_17', 'WordSmith Media Services', 'wordsmith-media-services', 'Compelling copywriting and content strategy.', 4000, 'Copywriter', 'professionals', 'content-finders', 'Master', 'Lagos', 'Garki', '+2348012345678', '+2348012345678', 'write@wordsmith.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_17', 'Copywriter Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_17');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_17', 'Ergonomic Office Chair', 'Comfortable seating for long hours.', 85000, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&auto=format&fit=crop&q=60', 'pro_prf_17');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_17', 'How to choose the best Copywriter in Lagos', 'This is an expert guide by WordSmith Media detailing how to find, evaluate, and choose a top-quality Copywriter for your project in Nigeria.', '/article_professionals.jpg', 'professionals', 'pro_prf_17');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_18', 'manage@social.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'SocialSphere Agency', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_18', 'usr_pro_18', 'SocialSphere Agency Services', 'socialsphere-agency-services', 'Strategic social media management and growth.', 4000, 'Social Media Manager', 'professionals', 'content-finders', 'Master', 'Lagos', 'Lekki', '+2348012345678', '+2348012345678', 'manage@social.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_18', 'Social Media Manager Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_18');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_18', 'Mechanical Keyboard', 'Tactile typing experience.', 35000, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60', 'pro_prf_18');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_18', 'How to choose the best Social Media Manager in Lagos', 'This is an expert guide by SocialSphere Agency detailing how to find, evaluate, and choose a top-quality Social Media Manager for your project in Nigeria.', '/article_professionals.jpg', 'professionals', 'pro_prf_18');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_19', 'booking@elitetalent.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'EliteTalent Nigeria', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_19', 'usr_pro_19', 'EliteTalent Nigeria Services', 'elitetalent-nigeria-services', 'Connecting top models and actors with brands.', 4000, 'Model', 'professionals', 'talent-finders', 'Master', 'Lagos', 'Surulere', '+2348012345678', '+2348012345678', 'booking@elitetalent.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_19', 'Model Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_19');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_19', 'Ergonomic Office Chair', 'Comfortable seating for long hours.', 85000, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&auto=format&fit=crop&q=60', 'pro_prf_19');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_19', 'How to choose the best Model in Lagos', 'This is an expert guide by EliteTalent Nigeria detailing how to find, evaluate, and choose a top-quality Model for your project in Nigeria.', '/article_professionals.jpg', 'professionals', 'pro_prf_19');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_20', 'voice@sonicvibe.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'SonicVibe Voices', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_20', 'usr_pro_20', 'SonicVibe Voices Services', 'sonicvibe-voices-services', 'Professional voice-over services for commercials.', 4000, 'Voice-Over Artist', 'professionals', 'talent-finders', 'Master', 'Lagos', 'Wuse', '+2348012345678', '+2348012345678', 'voice@sonicvibe.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_20', 'Voice-Over Artist Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_20');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_20', 'Mechanical Keyboard', 'Tactile typing experience.', 35000, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60', 'pro_prf_20');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_20', 'How to choose the best Voice-Over Artist in Lagos', 'This is an expert guide by SonicVibe Voices detailing how to find, evaluate, and choose a top-quality Voice-Over Artist for your project in Nigeria.', '/article_professionals.jpg', 'professionals', 'pro_prf_20');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_21', 'learn@prime.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Prime Tutors', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_21', 'usr_pro_21', 'Prime Tutors Services', 'prime-tutors-services', 'Expert home tutoring for all subjects.', 4000, 'Home Tutor', 'education', 'academic-finders', 'Master', 'Lagos', 'Yaba', '+2348012345678', '+2348012345678', 'learn@prime.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_21', 'Home Tutor Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_21');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_21', 'Interactive Whiteboard', 'Modern teaching tool.', 150000, 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=500&auto=format&fit=crop&q=60', 'pro_prf_21');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_21', 'How to choose the best Home Tutor in Lagos', 'This is an expert guide by Prime Tutors detailing how to find, evaluate, and choose a top-quality Home Tutor for your project in Nigeria.', '/article_education.jpg', 'education', 'pro_prf_21');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_22', 'music@melody.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Melody Academy', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_22', 'usr_pro_22', 'Melody Academy Services', 'melody-academy-services', 'Professional music lessons for kids and adults.', 4000, 'Music Instructor', 'education', 'academic-finders', 'Master', 'Lagos', 'Victoria-Island', '+2348012345678', '+2348012345678', 'music@melody.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_22', 'Music Instructor Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_22');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_22', 'Acoustic Guitar Pack', 'Perfect for beginners.', 45000, 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=60', 'pro_prf_22');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_22', 'How to choose the best Music Instructor in Lagos', 'This is an expert guide by Melody Academy detailing how to find, evaluate, and choose a top-quality Music Instructor for your project in Nigeria.', '/article_education.jpg', 'education', 'pro_prf_22');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_23', 'drive@safety.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'SafetyFirst Driving', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_23', 'usr_pro_23', 'SafetyFirst Driving Services', 'safetyfirst-driving-services', 'Comprehensive driving lessons and license processing.', 4000, 'Driving School', 'education', 'vocational-finders', 'Master', 'Lagos', 'Maitama', '+2348012345678', '+2348012345678', 'drive@safety.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_23', 'Driving School Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_23');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_23', 'Interactive Whiteboard', 'Modern teaching tool.', 150000, 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=500&auto=format&fit=crop&q=60', 'pro_prf_23');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_23', 'How to choose the best Driving School in Lagos', 'This is an expert guide by SafetyFirst Driving detailing how to find, evaluate, and choose a top-quality Driving School for your project in Nigeria.', '/article_education.jpg', 'education', 'pro_prf_23');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_24', 'train@skillup.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'SkillUp Hub', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_24', 'usr_pro_24', 'SkillUp Hub Services', 'skillup-hub-services', 'Hands-on tech and vocational skills training.', 4000, 'Tech Skill Trainer', 'education', 'vocational-finders', 'Master', 'Lagos', 'Ikeja', '+2348012345678', '+2348012345678', 'train@skillup.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_24', 'Tech Skill Trainer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_24');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_24', 'Acoustic Guitar Pack', 'Perfect for beginners.', 45000, 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=60', 'pro_prf_24');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_24', 'How to choose the best Tech Skill Trainer in Lagos', 'This is an expert guide by SkillUp Hub detailing how to find, evaluate, and choose a top-quality Tech Skill Trainer for your project in Nigeria.', '/article_education.jpg', 'education', 'pro_prf_24');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_25', 'plan@grand.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'GrandEvents Planning', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_25', 'usr_pro_25', 'GrandEvents Planning Services', 'grandevents-planning-services', 'Exquisite event planning and coordination.', 4000, 'Event Planner', 'events', 'planning-finders', 'Master', 'Lagos', 'Surulere', '+2348012345678', '+2348012345678', 'plan@grand.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_25', 'Event Planner Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_25');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_25', 'Party Lighting System', 'Dynamic lights for any occasion.', 75000, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60', 'pro_prf_25');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_25', 'How to choose the best Event Planner in Lagos', 'This is an expert guide by GrandEvents Planning detailing how to find, evaluate, and choose a top-quality Event Planner for your project in Nigeria.', '/article_events.jpg', 'events', 'pro_prf_25');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_26', 'decor@dreams.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'DecoDreams Studio', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_26', 'usr_pro_26', 'DecoDreams Studio Services', 'decodreams-studio-services', 'Creative event decoration and floral design.', 4000, 'Decorator', 'events', 'planning-finders', 'Master', 'Lagos', 'Garki', '+2348012345678', '+2348012345678', 'decor@dreams.ng', true, true, true, 4.8, 120, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_26', 'Decorator Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_26');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_26', 'DJ Controller', 'Mix tracks like a pro.', 180000, 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=500&auto=format&fit=crop&q=60', 'pro_prf_26');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_26', 'How to choose the best Decorator in Lagos', 'This is an expert guide by DecoDreams Studio detailing how to find, evaluate, and choose a top-quality Decorator for your project in Nigeria.', '/article_events.jpg', 'events', 'pro_prf_26');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_27', 'dj@spin.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'DJ SpinMaster', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_27', 'usr_pro_27', 'DJ SpinMaster Services', 'dj-spinmaster-services', 'Premium music entertainment for all occasions.', 4000, 'DJ', 'events', 'entertainment-finders', 'Master', 'Lagos', 'Lekki', '+2348012345678', '+2348012345678', 'dj@spin.ng', true, true, true, 4.8, 120, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_27', 'DJ Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_27');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_27', 'Party Lighting System', 'Dynamic lights for any occasion.', 75000, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60', 'pro_prf_27');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_27', 'How to choose the best DJ in Lagos', 'This is an expert guide by DJ SpinMaster detailing how to find, evaluate, and choose a top-quality DJ for your project in Nigeria.', '/article_events.jpg', 'events', 'pro_prf_27');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_28', 'photo@lenscraft.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'LensCraft Media', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_28', 'usr_pro_28', 'LensCraft Media Services', 'lenscraft-media-services', 'Capturing life's beautiful moments through photography.', 4000, 'Photographer', 'events', 'entertainment-finders', 'Master', 'Lagos', 'Yaba', '+2348012345678', '+2348012345678', 'photo@lenscraft.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_28', 'Photographer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_28');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_28', 'DJ Controller', 'Mix tracks like a pro.', 180000, 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=500&auto=format&fit=crop&q=60', 'pro_prf_28');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_28', 'How to choose the best Photographer in Lagos', 'This is an expert guide by LensCraft Media detailing how to find, evaluate, and choose a top-quality Photographer for your project in Nigeria.', '/article_events.jpg', 'events', 'pro_prf_28');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_29', 'nurse@careconnect.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'CareConnect Health', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_29', 'usr_pro_29', 'CareConnect Health Services', 'careconnect-health-services', 'Compassionate private nursing care at home.', 4000, 'Private Nurse', 'health', 'medical-finders', 'Master', 'Lagos', 'Ikoyi', '+2348012345678', '+2348012345678', 'nurse@careconnect.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_29', 'Private Nurse Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_29');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_29', 'Yoga Mat & Blocks', 'Essential fitness gear.', 15000, 'https://images.unsplash.com/photo-1601134599986-7e2831f2dc34?w=500&auto=format&fit=crop&q=60', 'pro_prf_29');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_29', 'How to choose the best Private Nurse in Lagos', 'This is an expert guide by CareConnect Health detailing how to find, evaluate, and choose a top-quality Private Nurse for your project in Nigeria.', '/article_health.jpg', 'health', 'pro_prf_29');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_30', 'rehab@physioflex.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'PhysioFlex Clinic', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_30', 'usr_pro_30', 'PhysioFlex Clinic Services', 'physioflex-clinic-services', 'Specialized physiotherapy and rehabilitation services.', 4000, 'Physiotherapist', 'health', 'medical-finders', 'Master', 'Lagos', 'Wuse', '+2348012345678', '+2348012345678', 'rehab@physioflex.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_30', 'Physiotherapist Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_30');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_30', 'Adjustable Dumbbells', 'Space-saving workout equipment.', 40000, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=60', 'pro_prf_30');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_30', 'How to choose the best Physiotherapist in Lagos', 'This is an expert guide by PhysioFlex Clinic detailing how to find, evaluate, and choose a top-quality Physiotherapist for your project in Nigeria.', '/article_health.jpg', 'health', 'pro_prf_30');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_31', 'fit@fitbody.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'FitBody Coaching', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_31', 'usr_pro_31', 'FitBody Coaching Services', 'fitbody-coaching-services', 'Personalized fitness training and weight loss programs.', 4000, 'Gym Instructor', 'health', 'wellness-finders', 'Master', 'Lagos', 'Ikeja', '+2348012345678', '+2348012345678', 'fit@fitbody.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_31', 'Gym Instructor Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_31');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_31', 'Yoga Mat & Blocks', 'Essential fitness gear.', 15000, 'https://images.unsplash.com/photo-1601134599986-7e2831f2dc34?w=500&auto=format&fit=crop&q=60', 'pro_prf_31');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_31', 'How to choose the best Gym Instructor in Lagos', 'This is an expert guide by FitBody Coaching detailing how to find, evaluate, and choose a top-quality Gym Instructor for your project in Nigeria.', '/article_health.jpg', 'health', 'pro_prf_31');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_32', 'yoga@zenyoga.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'ZenYoga Nigeria', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_32', 'usr_pro_32', 'ZenYoga Nigeria Services', 'zenyoga-nigeria-services', 'Mindfulness and yoga classes for all levels.', 4000, 'Yoga Teacher', 'health', 'wellness-finders', 'Master', 'Lagos', 'Surulere', '+2348012345678', '+2348012345678', 'yoga@zenyoga.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_32', 'Yoga Teacher Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_32');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_32', 'Adjustable Dumbbells', 'Space-saving workout equipment.', 40000, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=60', 'pro_prf_32');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_32', 'How to choose the best Yoga Teacher in Lagos', 'This is an expert guide by ZenYoga Nigeria detailing how to find, evaluate, and choose a top-quality Yoga Teacher for your project in Nigeria.', '/article_health.jpg', 'health', 'pro_prf_32');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_33', 'care@nannylink.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'NannyLink Agency', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_33', 'usr_pro_33', 'NannyLink Agency Services', 'nannylink-agency-services', 'Vetted and experienced nannies for your kids.', 4000, 'Nanny', 'health', 'care-finders', 'Master', 'Lagos', 'Garki', '+2348012345678', '+2348012345678', 'care@nannylink.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_33', 'Nanny Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_33');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_33', 'Yoga Mat & Blocks', 'Essential fitness gear.', 15000, 'https://images.unsplash.com/photo-1601134599986-7e2831f2dc34?w=500&auto=format&fit=crop&q=60', 'pro_prf_33');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_33', 'How to choose the best Nanny in Lagos', 'This is an expert guide by NannyLink Agency detailing how to find, evaluate, and choose a top-quality Nanny for your project in Nigeria.', '/article_health.jpg', 'health', 'pro_prf_33');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_34', 'support@companion.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Companion Care', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_34', 'usr_pro_34', 'Companion Care Services', 'companion-care-services', 'Dedicated care and companionship for the elderly.', 4000, 'Elderly Companion', 'health', 'care-finders', 'Master', 'Lagos', 'Lekki', '+2348012345678', '+2348012345678', 'support@companion.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_34', 'Elderly Companion Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_34');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_34', 'Adjustable Dumbbells', 'Space-saving workout equipment.', 40000, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=60', 'pro_prf_34');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_34', 'How to choose the best Elderly Companion in Lagos', 'This is an expert guide by Companion Care detailing how to find, evaluate, and choose a top-quality Elderly Companion for your project in Nigeria.', '/article_health.jpg', 'health', 'pro_prf_34');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_35', 'driver@prodrive.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'ProDrive Services', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_35', 'usr_pro_35', 'ProDrive Services Services', 'prodrive-services-services', 'Reliable professional drivers for personal or business use.', 4000, 'Professional Driver', 'logistics', 'transport-finders', 'Master', 'Lagos', 'Yaba', '+2348012345678', '+2348012345678', 'driver@prodrive.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_35', 'Professional Driver Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_35');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_35', 'Heavy Duty Moving Boxes', 'Durable packaging.', 10000, 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&auto=format&fit=crop&q=60', 'pro_prf_35');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_35', 'How to choose the best Professional Driver in Lagos', 'This is an expert guide by ProDrive Services detailing how to find, evaluate, and choose a top-quality Professional Driver for your project in Nigeria.', '/article_logistics.jpg', 'logistics', 'pro_prf_35');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_36', 'tow@rapid.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'RapidTow Nigeria', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_36', 'usr_pro_36', 'RapidTow Nigeria Services', 'rapidtow-nigeria-services', '24/7 emergency towing and roadside assistance.', 4000, 'Towing Van', 'logistics', 'transport-finders', 'Master', 'Lagos', 'Wuse', '+2348012345678', '+2348012345678', 'tow@rapid.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_36', 'Towing Van Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_36');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_36', 'GPS Tracker', 'Real-time asset tracking.', 18000, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60', 'pro_prf_36');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_36', 'How to choose the best Towing Van in Lagos', 'This is an expert guide by RapidTow Nigeria detailing how to find, evaluate, and choose a top-quality Towing Van for your project in Nigeria.', '/article_logistics.jpg', 'logistics', 'pro_prf_36');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_37', 'dispatch@swift.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'SwiftDelivery Express', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_37', 'usr_pro_37', 'SwiftDelivery Express Services', 'swiftdelivery-express-services', 'Fast and secure intra-city delivery services.', 4000, 'Dispatch Rider', 'logistics', 'delivery-finders', 'Master', 'Lagos', 'Surulere', '+2348012345678', '+2348012345678', 'dispatch@swift.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_37', 'Dispatch Rider Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_37');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_37', 'Heavy Duty Moving Boxes', 'Durable packaging.', 10000, 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&auto=format&fit=crop&q=60', 'pro_prf_37');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_37', 'How to choose the best Dispatch Rider in Lagos', 'This is an expert guide by SwiftDelivery Express detailing how to find, evaluate, and choose a top-quality Dispatch Rider for your project in Nigeria.', '/article_logistics.jpg', 'logistics', 'pro_prf_37');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_38', 'move@reloease.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'ReloEase Movers', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_38', 'usr_pro_38', 'ReloEase Movers Services', 'reloease-movers-services', 'Stress-free residential and office relocation.', 4000, 'Moving Service', 'logistics', 'delivery-finders', 'Master', 'Lagos', 'Ikeja', '+2348012345678', '+2348012345678', 'move@reloease.ng', true, true, true, 4.8, 120, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_38', 'Moving Service Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_38');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_38', 'GPS Tracker', 'Real-time asset tracking.', 18000, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60', 'pro_prf_38');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_38', 'How to choose the best Moving Service in Lagos', 'This is an expert guide by ReloEase Movers detailing how to find, evaluate, and choose a top-quality Moving Service for your project in Nigeria.', '/article_logistics.jpg', 'logistics', 'pro_prf_38');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_39', 'segun@autofix.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Segun Auto Fix', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_39', 'usr_pro_39', 'Segun Auto Fix Services', 'segun-auto-fix-services', 'Specialist in Japanese and German cars.', 4000, 'Car Mechanic', 'auto', 'repair-finders', 'Master', 'Lagos', 'Garki', '+2348012345678', '+2348012345678', 'segun@autofix.ng', true, true, true, 4.8, 120, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_39', 'Car Mechanic Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_39');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_39', 'Car Care Detailing Kit', 'Keep your vehicle shining.', 28000, 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&auto=format&fit=crop&q=60', 'pro_prf_39');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_39', 'How to choose the best Car Mechanic in Lagos', 'This is an expert guide by Segun Auto Fix detailing how to find, evaluate, and choose a top-quality Car Mechanic for your project in Nigeria.', '/article_auto.jpg', 'auto', 'pro_prf_39');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_40', 'fix@quickvul.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'QuickVulcanizer', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_40', 'usr_pro_40', 'QuickVulcanizer Services', 'quickvulcanizer-services', 'Emergency tire repairs and maintenance.', 4000, 'Vulcanizer', 'auto', 'repair-finders', 'Master', 'Lagos', 'Lekki', '+2348012345678', '+2348012345678', 'fix@quickvul.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_40', 'Vulcanizer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_40');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_40', 'Smart Dash Cam', 'Record your journeys safely.', 45000, 'https://images.unsplash.com/photo-1517005085862-e61b7b049d50?w=500&auto=format&fit=crop&q=60', 'pro_prf_40');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_40', 'How to choose the best Vulcanizer in Lagos', 'This is an expert guide by QuickVulcanizer detailing how to find, evaluate, and choose a top-quality Vulcanizer for your project in Nigeria.', '/article_auto.jpg', 'auto', 'pro_prf_40');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_41', 'wash@glossy.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'GlossyWash Mobile', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_41', 'usr_pro_41', 'GlossyWash Mobile Services', 'glossywash-mobile-services', 'Premium mobile car detailing at your doorstep.', 4000, 'Mobile Car Wash', 'auto', 'auto-care-finders', 'Master', 'Lagos', 'Yaba', '+2348012345678', '+2348012345678', 'wash@glossy.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_41', 'Mobile Car Wash Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_41');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_41', 'Car Care Detailing Kit', 'Keep your vehicle shining.', 28000, 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&auto=format&fit=crop&q=60', 'pro_prf_41');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_41', 'How to choose the best Mobile Car Wash in Lagos', 'This is an expert guide by GlossyWash Mobile detailing how to find, evaluate, and choose a top-quality Mobile Car Wash for your project in Nigeria.', '/article_auto.jpg', 'auto', 'pro_prf_41');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_42', 'track@securedrive.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'SecureDrive Tech', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_42', 'usr_pro_42', 'SecureDrive Tech Services', 'securedrive-tech-services', 'Advanced car tracking and security installations.', 4000, 'Car Tracker Installer', 'auto', 'auto-care-finders', 'Master', 'Lagos', 'Wuse', '+2348012345678', '+2348012345678', 'track@securedrive.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_42', 'Car Tracker Installer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_42');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_42', 'Smart Dash Cam', 'Record your journeys safely.', 45000, 'https://images.unsplash.com/photo-1517005085862-e61b7b049d50?w=500&auto=format&fit=crop&q=60', 'pro_prf_42');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_42', 'How to choose the best Car Tracker Installer in Lagos', 'This is an expert guide by SecureDrive Tech detailing how to find, evaluate, and choose a top-quality Car Tracker Installer for your project in Nigeria.', '/article_auto.jpg', 'auto', 'pro_prf_42');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_43', 'chef@gbolahan.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'Chef Gbolahan', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_43', 'usr_pro_43', 'Chef Gbolahan Services', 'chef-gbolahan-services', 'Expert in local and continental dishes.', 4000, 'Private Chef', 'food', 'culinary-finders', 'Master', 'Lagos', 'Ikoyi', '+2348012345678', '+2348012345678', 'chef@gbolahan.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_43', 'Private Chef Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_43');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_43', 'Chef's Knife Set', 'Professional grade culinary knives.', 65000, 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500&auto=format&fit=crop&q=60', 'pro_prf_43');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_43', 'How to choose the best Private Chef in Lagos', 'This is an expert guide by Chef Gbolahan detailing how to find, evaluate, and choose a top-quality Private Chef for your project in Nigeria.', '/article_food.jpg', 'food', 'pro_prf_43');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_44', 'bake@sweetdelights.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'SweetDelights Cakes', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_44', 'usr_pro_44', 'SweetDelights Cakes Services', 'sweetdelights-cakes-services', 'Custom cakes and desserts for all celebrations.', 4000, 'Cake Baker', 'food', 'culinary-finders', 'Master', 'Lagos', 'Ikeja', '+2348012345678', '+2348012345678', 'bake@sweetdelights.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_44', 'Cake Baker Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_44');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_44', 'Premium Spice Collection', 'Exotic and rich flavors.', 15000, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60', 'pro_prf_44');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_44', 'How to choose the best Cake Baker in Lagos', 'This is an expert guide by SweetDelights Cakes detailing how to find, evaluate, and choose a top-quality Cake Baker for your project in Nigeria.', '/article_food.jpg', 'food', 'pro_prf_44');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_45', 'info@greenthumb.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'GreenThumb Farms', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_45', 'usr_pro_45', 'GreenThumb Farms Services', 'greenthumb-farms-services', 'Professional farm management and consultancy.', 4000, 'Farm Manager', 'food', 'agro-finders', 'Master', 'Lagos', 'Garki', '+2348012345678', '+2348012345678', 'info@greenthumb.ng', true, false, true, 4.8, 120, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_45', 'Farm Manager Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_45');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_45', 'Chef's Knife Set', 'Professional grade culinary knives.', 65000, 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500&auto=format&fit=crop&q=60', 'pro_prf_45');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_45', 'How to choose the best Farm Manager in Lagos', 'This is an expert guide by GreenThumb Farms detailing how to find, evaluate, and choose a top-quality Farm Manager for your project in Nigeria.', '/article_food.jpg', 'food', 'pro_prf_45');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_46', 'care@happypets.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'HappyPets Vet', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_46', 'usr_pro_46', 'HappyPets Vet Services', 'happypets-vet-services', 'Expert veterinary care and pet grooming.', 4000, 'Veterinary Doctor', 'food', 'agro-finders', 'Master', 'Lagos', 'Lekki', '+2348012345678', '+2348012345678', 'care@happypets.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_46', 'Veterinary Doctor Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_46');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_46', 'Premium Spice Collection', 'Exotic and rich flavors.', 15000, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60', 'pro_prf_46');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_46', 'How to choose the best Veterinary Doctor in Lagos', 'This is an expert guide by HappyPets Vet detailing how to find, evaluate, and choose a top-quality Veterinary Doctor for your project in Nigeria.', '/article_food.jpg', 'food', 'pro_prf_46');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_47', 'search@lagoshome.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'LagosHome Finder', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_47', 'usr_pro_47', 'LagosHome Finder Services', 'lagoshome-finder-services', 'Helping you find the perfect property in Lagos.', 4000, 'Estate Agent', 'realestate', 'property-finders', 'Master', 'Lagos', 'Lekki', '+2348012345678', '+2348012345678', 'search@lagoshome.ng', true, true, false, 4.8, 120, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_47', 'Estate Agent Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_47');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_47', 'Smart Door Lock', 'Keyless and secure entry.', 85000, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60', 'pro_prf_47');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_47', 'How to choose the best Estate Agent in Lagos', 'This is an expert guide by LagosHome Finder detailing how to find, evaluate, and choose a top-quality Estate Agent for your project in Nigeria.', '/article_realestate.jpg', 'realestate', 'pro_prf_47');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_48', 'mgt@primefac.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'PrimeFacility Management', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_48', 'usr_pro_48', 'PrimeFacility Management Services', 'primefacility-management-services', 'Comprehensive facility management for residential estates.', 4000, 'Facility Manager', 'realestate', 'property-finders', 'Master', 'Lagos', 'Yaba', '+2348012345678', '+2348012345678', 'mgt@primefac.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_48', 'Facility Manager Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_48');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_48', 'Interior Paint Premium Set', 'Transform your living space.', 40000, 'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=500&auto=format&fit=crop&q=60', 'pro_prf_48');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_48', 'How to choose the best Facility Manager in Lagos', 'This is an expert guide by PrimeFacility Management detailing how to find, evaluate, and choose a top-quality Facility Manager for your project in Nigeria.', '/article_realestate.jpg', 'realestate', 'pro_prf_48');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_49', 'design@modernspace.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'ModernSpace Architects', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_49', 'usr_pro_49', 'ModernSpace Architects Services', 'modernspace-architects-services', 'Innovative architectural design and project management.', 4000, 'Architect', 'realestate', 'building-finders', 'Master', 'Lagos', 'Ikeja', '+2348012345678', '+2348012345678', 'design@modernspace.ng', true, false, false, 4.8, 120, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_49', 'Architect Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_49');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_49', 'Smart Door Lock', 'Keyless and secure entry.', 85000, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60', 'pro_prf_49');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_49', 'How to choose the best Architect in Lagos', 'This is an expert guide by ModernSpace Architects detailing how to find, evaluate, and choose a top-quality Architect for your project in Nigeria.', '/article_realestate.jpg', 'realestate', 'pro_prf_49');

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isOnline`) VALUES ('usr_pro_50', 'info@buildright.ng', '$2a$10$SfGslmEk7n7mhiRpcXTlKurIOZRaPsrgL8sQJ2vIFFbOhM/XsdygC', 'BuildRight Construction', 'PRO', true);
INSERT INTO `ProProfile` (`id`, `userId`, `businessName`, `slug`, `bio`, `hourlyRate`, `specialties`, `niche`, `subService`, `specialtyLevel`, `city`, `area`, `phone`, `whatsapp`, `businessEmail`, `verified`, `acceptsPos`, `homeDelivery`, `rating`, `profileViews`, `logoUrl`) VALUES ('pro_prf_50', 'usr_pro_50', 'BuildRight Construction Services', 'buildright-construction-services', 'Quality masonry and building services.', 4000, 'Bricklayer', 'realestate', 'building-finders', 'Master', 'Lagos', 'Surulere', '+2348012345678', '+2348012345678', 'info@buildright.ng', true, true, true, 4.8, 120, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80');
INSERT INTO `Service` (`id`, `name`, `description`, `price`, `proProfileId`) VALUES ('srv_itm_50', 'Bricklayer Consultation', 'Comprehensive initial consultation, inspection, and estimate.', 5000, 'pro_prf_50');
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `proProfileId`) VALUES ('prd_itm_50', 'Interior Paint Premium Set', 'Transform your living space.', 40000, 'https://images.unsplash.com/photo-1562184552-997c461abbe6?w=500&auto=format&fit=crop&q=60', 'pro_prf_50');
INSERT INTO `Article` (`id`, `title`, `content`, `image`, `niche`, `proProfileId`) VALUES ('art_itm_50', 'How to choose the best Bricklayer in Lagos', 'This is an expert guide by BuildRight Construction detailing how to find, evaluate, and choose a top-quality Bricklayer for your project in Nigeria.', '/article_realestate.jpg', 'realestate', 'pro_prf_50');

