-- ==============================================================================
-- SHARED DATABASE MIGRATION FOR u721451974_nexa_db
-- Microservices: user-subscription-service & ai-gtm-service
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. USER & MULTI-TENANT WORKSPACE TABLES (user-subscription-service)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL UNIQUE,
    `ownerId` VARCHAR(191) NOT NULL,
    `planTier` VARCHAR(50) NOT NULL DEFAULT 'STARTER',
    `billingCycle` VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_org_owner` (`ownerId`),
    INDEX `idx_org_plan` (`planTier`, `status`),
    FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `WorkspaceMember` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `org_user_uniq` (`organizationId`, `userId`),
    INDEX `idx_wm_user` (`userId`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `planTier` VARCHAR(50) NOT NULL,
    `paystackSubscriptionCode` VARCHAR(191) NULL,
    `paystackCustomerCode` VARCHAR(191) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    `currentPeriodStart` DATETIME(3) NOT NULL,
    `currentPeriodEnd` DATETIME(3) NOT NULL,
    `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `org_sub_uniq` (`organizationId`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `OrganizationUsage` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `period` VARCHAR(7) NOT NULL,
    `leadsResearched` INT NOT NULL DEFAULT 0,
    `emailsSent` INT NOT NULL DEFAULT 0,
    `whatsAppMessagesSent` INT NOT NULL DEFAULT 0,
    `aiTokensUsed` BIGINT NOT NULL DEFAULT 0,
    `aiCostUSD` DOUBLE NOT NULL DEFAULT 0.0,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `org_period_uniq` (`organizationId`, `period`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. AI GTM SWARM & EXECUTION ENGINE TABLES (ai-gtm-service)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `gtm_agent` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ONLINE',
    `currentTask` TEXT NULL,
    `taskProgress` INT NOT NULL DEFAULT 0,
    `confidenceScore` DOUBLE NOT NULL DEFAULT 95.0,
    `recommendation` TEXT NULL,
    `circuitBreakerActive` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `org_agent_key_uniq` (`organizationId`, `key`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gtm_strategy` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `targetTAM` VARCHAR(191) NULL,
    `valueProposition` TEXT NOT NULL,
    `strategyGraphJson` JSON NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gtm_campaign` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `targetAudience` TEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    `channelsJson` JSON NOT NULL,
    `prospectsCount` INT NOT NULL DEFAULT 0,
    `sentCount` INT NOT NULL DEFAULT 0,
    `repliesCount` INT NOT NULL DEFAULT 0,
    `meetingsCount` INT NOT NULL DEFAULT 0,
    `pipelineValue` DOUBLE NOT NULL DEFAULT 0.0,
    `startDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_camp_org_status` (`organizationId`, `status`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gtm_lead` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NOT NULL,
    `contactTitle` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `contactPhone` VARCHAR(191) NULL,
    `icpFitScore` INT NOT NULL DEFAULT 50,
    `buyingSignalsJson` JSON NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'IDENTIFIED',
    `assignedAgentKey` VARCHAR(50) NULL,
    `lastActivity` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_lead_org_status` (`organizationId`, `status`),
    INDEX `idx_lead_email` (`contactEmail`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`campaignId`) REFERENCES `gtm_campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gtm_approval` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `creatorAgentKey` VARCHAR(50) NOT NULL,
    `riskLevel` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    `targetChannel` VARCHAR(50) NOT NULL,
    `previewDataJson` JSON NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `authorizedByUserId` VARCHAR(191) NULL,
    `authorizedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_approval_org_status` (`organizationId`, `status`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gtm_observability_trace` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `agentKey` VARCHAR(50) NOT NULL,
    `modelProvider` VARCHAR(50) NOT NULL,
    `modelName` VARCHAR(100) NOT NULL,
    `promptTokens` INT NOT NULL DEFAULT 0,
    `completionTokens` INT NOT NULL DEFAULT 0,
    `totalCostUSD` DOUBLE NOT NULL DEFAULT 0.0,
    `latencyMs` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_trace_org_agent` (`organizationId`, `agentKey`),
    FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
