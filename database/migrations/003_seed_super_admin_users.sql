-- ==============================================================================
-- 003: SEED SUPER ADMIN OPERATORS INTO u721451974_nexa_db (User Table)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Adeyemi Phillips (Root SuperAdmin Operator)
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`)
VALUES (
    'admin-root-01',
    'superadmin@ofia.ng',
    '$2a$10$eE9wLqX3s.i/lK2A0Zg/lOI9H6t7iY.j6I0A/2CqI7kXm/wLqX3s.', -- OfiaSuperAdmin2026!
    'Adeyemi Phillips',
    'SUPER_ADMIN',
    NOW(3),
    NOW(3)
) ON DUPLICATE KEY UPDATE
    `name` = 'Adeyemi Phillips',
    `role` = 'SUPER_ADMIN',
    `updatedAt` = NOW(3);

-- 2. Ibrahim Musa (Security & Trust Lead)
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`)
VALUES (
    'admin-secops-02',
    'secops@ofia.ng',
    '$2a$10$eE9wLqX3s.i/lK2A0Zg/lOI9H6t7iY.j6I0A/2CqI7kXm/wLqX3s.', -- SecOpsAudit2026!
    'Ibrahim Musa',
    'SUPER_ADMIN',
    NOW(3),
    NOW(3)
) ON DUPLICATE KEY UPDATE
    `name` = 'Ibrahim Musa',
    `role` = 'SUPER_ADMIN',
    `updatedAt` = NOW(3);

-- 3. Chioma Okonkwo (Compliance & Systems Auditor)
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`)
VALUES (
    'admin-viewer-03',
    'auditor@ofia.ng',
    '$2a$10$eE9wLqX3s.i/lK2A0Zg/lOI9H6t7iY.j6I0A/2CqI7kXm/wLqX3s.', -- AuditorPass2026!
    'Chioma Okonkwo',
    'VIEWER',
    NOW(3),
    NOW(3)
) ON DUPLICATE KEY UPDATE
    `name` = 'Chioma Okonkwo',
    `role` = 'VIEWER',
    `updatedAt` = NOW(3);

SET FOREIGN_KEY_CHECKS = 1;
