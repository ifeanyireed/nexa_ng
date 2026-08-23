-- ==============================================================================
-- TENANT ROLE-BASED ACCESS CONTROL (RBAC) & MODULE VISIBILITY SCHEMA
-- Microservices: user-subscription-service & service_erp
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TENANT MODULE PERMISSION MATRIX
-- Controls which modules and navigation items are visible for each user role
-- within a specific tenant workspace.
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `TenantRolePermission` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `moduleKey` VARCHAR(50) NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `allowedActions` JSON NULL, -- e.g. ["read", "write", "approve", "export"]
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `tenant_role_module_uniq` (`tenantId`, `role`, `moduleKey`),
    INDEX `idx_tenant_role` (`tenantId`, `role`),
    INDEX `idx_tenant_module` (`tenantId`, `moduleKey`),
    FOREIGN KEY (`tenantId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TENANT CUSTOM USER ROLES
-- Allows tenants to define customized user personas with custom badges and scopes
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `TenantCustomRole` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `roleKey` VARCHAR(50) NOT NULL,
    `displayName` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `badgeColor` VARCHAR(30) NOT NULL DEFAULT '#1A56DB',
    `isSystemRole` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `tenant_custom_role_uniq` (`tenantId`, `roleKey`),
    INDEX `idx_tenant_roles` (`tenantId`),
    FOREIGN KEY (`tenantId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. AUDIT LOGS FOR ACCESS CONTROL CHANGES
-- Records who changed role permissions, timestamps, and previous state
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `TenantPermissionAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `actorUserId` VARCHAR(191) NOT NULL,
    `targetRole` VARCHAR(50) NOT NULL,
    `moduleKey` VARCHAR(50) NOT NULL,
    `previousState` BOOLEAN NOT NULL,
    `newState` BOOLEAN NOT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_audit_tenant` (`tenantId`, `createdAt`),
    FOREIGN KEY (`tenantId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
