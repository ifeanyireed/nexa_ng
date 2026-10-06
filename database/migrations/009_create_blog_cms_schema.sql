-- ==============================================================================
-- MIGRATION 009: Ofia Blog CMS & Content Engine Schema
-- Target Database: Neon PostgreSQL
-- Microservices: user-subscription-service (:8081) & ofia_admin CMS
-- ==============================================================================

-- 1. Blog Categories
CREATE TABLE IF NOT EXISTS "BlogCategory" (
    "id" VARCHAR(191) PRIMARY KEY,
    "name" VARCHAR(191) NOT NULL UNIQUE,
    "slug" VARCHAR(191) NOT NULL UNIQUE,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Blog Tags
CREATE TABLE IF NOT EXISTS "BlogTag" (
    "id" VARCHAR(191) PRIMARY KEY,
    "name" VARCHAR(191) NOT NULL UNIQUE,
    "slug" VARCHAR(191) NOT NULL UNIQUE,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Blog Posts
CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" VARCHAR(191) PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "category_id" VARCHAR(191) REFERENCES "BlogCategory"("id") ON DELETE SET NULL,
    "tags" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "author_id" VARCHAR(191),
    "author_name" VARCHAR(191) DEFAULT 'Ofia Editorial Team',
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_post_slug ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS idx_blog_post_status ON "BlogPost"("status");
CREATE INDEX IF NOT EXISTS idx_blog_post_category ON "BlogPost"("category_id");

-- 4. Blog Comments
CREATE TABLE IF NOT EXISTS "BlogComment" (
    "id" VARCHAR(191) PRIMARY KEY,
    "post_id" VARCHAR(191) NOT NULL REFERENCES "BlogPost"("id") ON DELETE CASCADE,
    "user_name" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191),
    "content" TEXT NOT NULL,
    "parent_id" VARCHAR(191),
    "status" VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_comment_post ON "BlogComment"("post_id");
CREATE INDEX IF NOT EXISTS idx_blog_comment_status ON "BlogComment"("status");

-- 5. Blog Newsletter Subscribers
CREATE TABLE IF NOT EXISTS "BlogSubscriber" (
    "id" VARCHAR(191) PRIMARY KEY,
    "email" VARCHAR(191) NOT NULL UNIQUE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_subscriber_email ON "BlogSubscriber"("email");
