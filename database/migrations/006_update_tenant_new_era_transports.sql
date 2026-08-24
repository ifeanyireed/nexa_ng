-- ==============================================================================
-- MIGRATION 006: Update Primary Tenant to New Era Transports & Seed ERP HR Data
-- Target Database: u721451974_nexa_db (MySQL / MariaDB)
-- Microservices: service_users (:8081) & service_erp (:8084)
-- Tenant: New Era Transports (slug: neweratransports)
-- Owner: Ifeanyi Felix (ifeanyi.ibeh@neweratransports.com)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. UPSERT OWNER USER RECORD (service_users)
-- ------------------------------------------------------------------------------
INSERT INTO `User` (
    `id`, `name`, `email`, `role`, `department`, `avatar`, `managerName`, `ratingTrend`,
    `company`, `designation`, `employmentDate`, `gradeLevel`, `location`, `password`, `managerId`,
    `createdAt`, `updatedAt`
) VALUES (
    'USR-001', 'Ifeanyi Felix', 'ifeanyi.ibeh@neweratransports.com', 'admin',
    'Executive Directorate', '/character2.jpg', NULL, NULL,
    'NETS', 'Admin', '2025-01-01', 'L1', 'Lagos',
    '12345678', NULL, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `email` = VALUES(`email`),
    `designation` = VALUES(`designation`),
    `company` = VALUES(`company`),
    `updatedAt` = NOW(3);

-- ------------------------------------------------------------------------------
-- 2. UPDATE / UPSERT ORGANIZATION RECORD (service_users)
-- ------------------------------------------------------------------------------
INSERT INTO `Organization` (
    `id`, `name`, `slug`, `ownerId`, `planTier`, `billingCycle`, `status`, `createdAt`, `updatedAt`
) VALUES (
    'org-01', 'New Era Transports', 'neweratransports', 'USR-001', 'GROWTH', 'MONTHLY', 'ACTIVE', NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `slug` = VALUES(`slug`),
    `ownerId` = VALUES(`ownerId`),
    `planTier` = VALUES(`planTier`),
    `status` = 'ACTIVE',
    `updatedAt` = NOW(3);

-- Update any legacy edusuite references
UPDATE `Organization` SET
    `name` = 'New Era Transports',
    `slug` = 'neweratransports',
    `ownerId` = 'USR-001',
    `updatedAt` = NOW(3)
WHERE `id` = 'org-01' OR `slug` IN ('edusuite-ng', 'edusuite');

-- ------------------------------------------------------------------------------
-- 3. UPSERT WORKSPACE MEMBER & SUBSCRIPTION (service_users)
-- ------------------------------------------------------------------------------
INSERT INTO `WorkspaceMember` (
    `id`, `organizationId`, `userId`, `role`, `createdAt`
) VALUES (
    'wm-org01-usr001', 'org-01', 'USR-001', 'TENANT_OWNER', NOW(3)
) ON DUPLICATE KEY UPDATE
    `role` = 'TENANT_OWNER';

INSERT INTO `Subscription` (
    `id`, `organizationId`, `planTier`, `status`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `createdAt`, `updatedAt`
) VALUES (
    'sub-org-01', 'org-01', 'GROWTH', 'ACTIVE', NOW(3), DATE_ADD(NOW(3), INTERVAL 30 DAY), FALSE, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `planTier` = 'GROWTH',
    `status` = 'ACTIVE',
    `updatedAt` = NOW(3);

-- ------------------------------------------------------------------------------
-- 4. ENSURE TENANT ACCESS CONTROL & ERP MODULE MATRIX (RBAC)
-- ------------------------------------------------------------------------------
INSERT INTO `TenantRolePermission` (`id`, `tenantId`, `role`, `moduleKey`, `isEnabled`, `createdAt`, `updatedAt`) VALUES
('trp-nets-admin-ai', 'neweratransports', 'admin', 'ai', 1, NOW(3), NOW(3)),
('trp-nets-admin-crm', 'neweratransports', 'admin', 'crm', 1, NOW(3), NOW(3)),
('trp-nets-admin-marketplace', 'neweratransports', 'admin', 'marketplace', 1, NOW(3), NOW(3)),
('trp-nets-admin-shop', 'neweratransports', 'admin', 'shop', 1, NOW(3), NOW(3)),
('trp-nets-admin-logistics', 'neweratransports', 'admin', 'logistics', 1, NOW(3), NOW(3)),
('trp-nets-admin-accounting', 'neweratransports', 'admin', 'accounting', 1, NOW(3), NOW(3)),
('trp-nets-admin-hr', 'neweratransports', 'admin', 'hr', 1, NOW(3), NOW(3)),
('trp-nets-admin-users', 'neweratransports', 'admin', 'users', 1, NOW(3), NOW(3)),
('trp-nets-admin-access_control', 'neweratransports', 'admin', 'access_control', 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `isEnabled` = 1, `updatedAt` = NOW(3);

SET FOREIGN_KEY_CHECKS = 1;
