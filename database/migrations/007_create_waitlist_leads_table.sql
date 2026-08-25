-- ==============================================================================
-- MIGRATION 007: WaitlistLeads Table & Seed Data
-- Target Database: u721451974_nexa_db (MySQL / MariaDB)
-- Microservices: user-subscription-service (:8081) & ofia_admin CRM
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `waitlist_leads` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `business_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `phone` VARCHAR(50) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'MERCHANT',
    `niche` VARCHAR(50) NOT NULL DEFAULT 'retail',
    `state` VARCHAR(100) NOT NULL DEFAULT 'Lagos',
    `city` VARCHAR(100) NULL,
    `team_size` VARCHAR(50) NULL DEFAULT '1-10',
    `features_interest` JSON NULL,
    `queue_number` INT NOT NULL AUTO_INCREMENT UNIQUE,
    `referral_code` VARCHAR(50) NOT NULL UNIQUE,
    `referred_by` VARCHAR(50) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `invite_code` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_waitlist_email` (`email`),
    INDEX `idx_waitlist_status` (`status`),
    INDEX `idx_waitlist_niche` (`niche`),
    INDEX `idx_waitlist_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- SEED REALISTIC WAITLIST APPLICANTS ACROSS NIGERIA
-- ------------------------------------------------------------------------------

INSERT INTO `waitlist_leads` (
    `id`, `full_name`, `business_name`, `email`, `phone`, `role`, `niche`, `state`, `city`, `team_size`,
    `features_interest`, `referral_code`, `status`, `invite_code`, `notes`, `created_at`, `updated_at`
) VALUES
(
    'wt-001', 'Engr. Nnamdi Eze', 'Eko Horizon Automation & Tech', 'eze@ekoatlantic.com', '+2348029988776',
    'SERVICE_PRO', 'professionals', 'Lagos', 'Victoria Island', '11-50',
    '["ai_agents", "marketplace", "logistics"]', 'REF-EKO801', 'QUALIFIED', 'OFIA-VIP-9021',
    'High value smart home and CCTV engineering firm in Eko Atlantic. Priority wave 1 invitee.',
    DATE_SUB(NOW(3), INTERVAL 4 DAY), NOW(3)
),
(
    'wt-002', 'Hajiya Amina Bello', 'Amina Luxury Fabrics & Couture', 'amina.bello@fabrics.ng', '+2348054433221',
    'MERCHANT', 'fashion', 'Abuja FCT', 'Maitama', '5-10',
    '["pos", "marketplace", "escrow"]', 'REF-AMN402', 'INVITED', 'OFIA-VIP-4081',
    'High-end Northern textile merchant with 3 branches in Abuja & Kano. Requested POS + multi-store sync.',
    DATE_SUB(NOW(3), INTERVAL 3 DAY), NOW(3)
),
(
    'wt-003', 'Dr. Babatunde Adeyemi', 'Solarking Power Systems Ltd', 'babatunde@solarking.ng', '+2348031122334',
    'ENTERPRISE', 'home', 'Lagos', 'Ikeja', '50+',
    '["ai_agents", "pos", "logistics", "escrow"]', 'REF-SLR103', 'QUALIFIED', NULL,
    'Commercial solar installer looking to equip 18 field technicians with Ofia Pro Verified dispatch.',
    DATE_SUB(NOW(3), INTERVAL 2 DAY), NOW(3)
),
(
    'wt-004', 'Chidiebere Okonkwo', 'Trans-Niger Cold Chain Logistics', 'c.okonkwo@transniger.com', '+2348037776655',
    'MERCHANT', 'logistics', 'Rivers', 'Port Harcourt', '11-50',
    '["logistics", "escrow", "ai_agents"]', 'REF-TNG504', 'PENDING', NULL,
    'Fleet owner in Trans-Amadi industrial layout. Seeking Waybill tracking and automated payments.',
    DATE_SUB(NOW(3), INTERVAL 1 DAY), NOW(3)
),
(
    'wt-005', 'Zainab Danjuma', 'Kano Grain & Agro Hub', 'zainab@kanograins.ng', '+2348061234567',
    'MERCHANT', 'agro', 'Kano', 'Nassarawa', '1-5',
    '["marketplace", "pos"]', 'REF-KNO705', 'PENDING', NULL,
    'Wholesale grain supplier seeking multi-region marketplace buyers across South-West and East.',
    NOW(3), NOW(3)
),
(
    'wt-006', 'Oluwaseun Balogun', 'SwiftBite Gourmet Express', 'seun@swiftbite.ng', '+2348149876543',
    'MERCHANT', 'food', 'Lagos', 'Lekki Phase 1', '5-10',
    '["marketplace", "pos", "logistics"]', 'REF-SWF906', 'ONBOARDED', 'OFIA-VIP-1105',
    'Cloud kitchen & specialty catering. Already tested pilot ordering system.',
    DATE_SUB(NOW(3), INTERVAL 6 DAY), NOW(3)
)
ON DUPLICATE KEY UPDATE
    `full_name` = VALUES(`full_name`),
    `business_name` = VALUES(`business_name`),
    `status` = VALUES(`status`),
    `updated_at` = NOW(3);

SET FOREIGN_KEY_CHECKS = 1;
