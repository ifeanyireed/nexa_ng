-- ==============================================================================
-- MULTI-TENANT QUEST & CHAMPIONSHIP SERVICE SCHEMA MIGRATION
-- Database: u721451974_nexa_db (MySQL / MariaDB Compatible)
-- Microservices: service_erp / hr_quests
-- Tenant Isolation: Filtered by tenantSlug with Composite Indexes
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. QUEST INSTANCE TABLE (Championship Tournament Blueprint)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestInstance` (
    `id` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `coverImage` VARCHAR(255) DEFAULT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- DRAFT, ACTIVE, COMPLETED, ARCHIVED
    `grandPrize` VARCHAR(100) DEFAULT '₦500,000',
    `currency` VARCHAR(20) DEFAULT 'NGN',
    `prizesJson` LONGTEXT DEFAULT NULL,
    `totalMaxPoints` INT(11) NOT NULL DEFAULT 850,
    `location` VARCHAR(191) DEFAULT NULL,
    `startsAt` VARCHAR(100) DEFAULT NULL,
    `endsAt` VARCHAR(100) DEFAULT NULL,
    `participationType` VARCHAR(50) DEFAULT 'BOTH', -- TEAM, INDIVIDUAL, BOTH
    `autoBalance` BOOLEAN DEFAULT TRUE,
    `enableStageTV` BOOLEAN DEFAULT TRUE,
    `allowManualAdjustments` BOOLEAN DEFAULT TRUE,
    `primaryColor` VARCHAR(50) DEFAULT '#1A56DB',
    `accentColor` VARCHAR(50) DEFAULT '#F59E0B',
    `scoringMode` VARCHAR(100) DEFAULT 'AUTOMATIC_WITH_JUDGE_OVERRIDE',
    `conceptLockEnabled` BOOLEAN DEFAULT TRUE,
    `createdBy` VARCHAR(191) DEFAULT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_quest_tenant_slug` (`tenantSlug`, `slug`),
    INDEX `idx_quest_tenant` (`tenantSlug`),
    INDEX `idx_quest_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. QUEST PRIZE TABLE (Podium & Special Category Cash/Trophy Allocations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestPrize` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `prizeRank` INT(11) DEFAULT NULL, -- 1 for 1st, 2 for 2nd, null for special categories
    `title` VARCHAR(191) NOT NULL, -- e.g. "1st Place Grand Championship Winner"
    `awardType` VARCHAR(50) NOT NULL DEFAULT 'CASH', -- CASH, TROPHY, GIFT, CERTIFICATE
    `amount` VARCHAR(100) NOT NULL, -- e.g. "₦500,000"
    `description` TEXT DEFAULT NULL,
    `icon` VARCHAR(50) DEFAULT '🏆',
    `orderIndex` INT(11) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_prize_quest` (`questId`),
    INDEX `idx_prize_tenant` (`tenantSlug`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. QUEST TEAM TABLE (Championship Squads: Team A through Team J)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestTeam` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `name` VARCHAR(191) NOT NULL,
    `customName` VARCHAR(191) DEFAULT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(100) DEFAULT '🏆',
    `color` VARCHAR(50) DEFAULT '#3B82F6',
    `initial` VARCHAR(10) DEFAULT 'T',
    `motto` VARCHAR(255) DEFAULT NULL,
    `totalPoints` INT(11) NOT NULL DEFAULT 0,
    `teamRank` INT(11) NOT NULL DEFAULT 1,
    `captainId` VARCHAR(191) DEFAULT NULL,
    `memberCount` INT(11) NOT NULL DEFAULT 0,
    `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE (Standby)
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_team_quest` (`questId`),
    INDEX `idx_team_tenant` (`tenantSlug`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. QUEST PARTICIPANT TABLE (Cross-Department Staff Pool Members)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `teamId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `userEmail` VARCHAR(191) DEFAULT NULL,
    `department` VARCHAR(191) DEFAULT NULL,
    `avatar` VARCHAR(255) DEFAULT '/character1.jpg',
    `role` VARCHAR(50) NOT NULL DEFAULT 'member', -- captain, member
    `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_participant_quest_user` (`questId`, `userId`),
    INDEX `idx_participant_quest` (`questId`),
    INDEX `idx_participant_team` (`teamId`),
    INDEX `idx_participant_user` (`userId`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. QUEST CHALLENGE TABLE (Scoring Engines: Rubrics, Quiz, Participation, Ranks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestChallenge` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `day` VARCHAR(20) NOT NULL DEFAULT 'Day 1',
    `category` VARCHAR(100) NOT NULL, -- Challenge, Sports, Trivia, Awards, Icebreaker
    `engineType` VARCHAR(50) NOT NULL, -- QUIZ, RUBRIC, RANK_TO_POINTS, PARTICIPATION, CONCEPT_AND_RUBRIC
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `instructions` TEXT DEFAULT NULL,
    `maxScore` INT(11) NOT NULL DEFAULT 50,
    `status` VARCHAR(50) NOT NULL DEFAULT 'LOCKED', -- LOCKED, OPEN, IN_PROGRESS, SUBMITTED, VERIFIED, COMPLETED
    `rubricJson` LONGTEXT DEFAULT NULL,
    `settingsJson` LONGTEXT DEFAULT NULL,
    `submissionsCount` INT(11) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_challenge_quest` (`questId`),
    INDEX `idx_challenge_day` (`day`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. QUEST SCHEDULE ITEM TABLE (Itinerary, Calendar, Locations & Status)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestScheduleItem` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `day` VARCHAR(50) NOT NULL,
    `startTime` VARCHAR(50) NOT NULL,
    `endTime` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `category` VARCHAR(50) NOT NULL, -- Arrival, Ceremony, Challenge, Meal, Sports, Awards
    `location` VARCHAR(255) NOT NULL,
    `challengeId` VARCHAR(191) DEFAULT NULL,
    `maxScore` INT(11) DEFAULT 0,
    `facilitatorNotes` TEXT DEFAULT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'UPCOMING', -- UPCOMING, LIVE, COMPLETED
    `orderIndex` INT(11) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_schedule_quest` (`questId`),
    INDEX `idx_schedule_day` (`day`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. QUEST CONCEPT TABLE (Performance Pitch Registration & Duplicate Locking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestConcept` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `challengeId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `teamName` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `format` VARCHAR(100) DEFAULT NULL, -- Drama, Comedy, Musical, Debate, Pitch
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    `lockedBy` VARCHAR(191) DEFAULT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_concept_quest` (`questId`),
    INDEX `idx_concept_team` (`teamId`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. QUEST SCORE LEDGER TABLE (Transactional Immutable Score Entries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestScoreLedger` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `challengeId` VARCHAR(191) NOT NULL,
    `challengeName` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `teamName` VARCHAR(191) NOT NULL,
    `points` INT(11) NOT NULL,
    `maxPoints` INT(11) NOT NULL,
    `scoredBy` VARCHAR(191) NOT NULL,
    `reason` TEXT DEFAULT NULL,
    `source` VARCHAR(50) DEFAULT 'MANUAL', -- MANUAL, QUIZ_AUTO, RUBRIC, PARTICIPATION
    `status` VARCHAR(50) NOT NULL DEFAULT 'VALID', -- VALID, REVERSED
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_score_quest` (`questId`),
    INDEX `idx_score_team` (`teamId`),
    INDEX `idx_score_challenge` (`challengeId`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. QUEST SCORE AUDIT TABLE (Facilitator Score Overrides & Changes Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestScoreAudit` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `challengeId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `previousScore` INT(11) NOT NULL,
    `newScore` INT(11) NOT NULL,
    `reason` TEXT DEFAULT NULL,
    `modifiedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_audit_quest` (`questId`),
    INDEX `idx_audit_team` (`teamId`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. QUEST ANNOUNCEMENT TABLE (Live Stage & Facilitator Broadcasts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `QuestAnnouncement` (
    `id` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `tenantSlug` VARCHAR(191) NOT NULL DEFAULT '',
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `mediaUrl` VARCHAR(255) DEFAULT NULL,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_announcement_quest` (`questId`),
    FOREIGN KEY (`questId`) REFERENCES `QuestInstance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
