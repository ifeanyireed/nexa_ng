-- ==============================================================================
-- MIGRATION 017: Add Author Customization Fields to Blog Posts
-- Target Database: Neon PostgreSQL
-- ==============================================================================

-- 1. Add configurable author profile fields
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "author_role" VARCHAR(191) DEFAULT 'Author';
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "author_avatar" TEXT DEFAULT '';
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "author_bio" TEXT DEFAULT '';
