-- ==============================================================================
-- MIGRATION 016: Add View Count and SEO Optimization Fields to Blog Posts
-- Target Database: Neon PostgreSQL
-- ==============================================================================

-- 1. Add view count tracking column
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "view_count" BIGINT DEFAULT 0 NOT NULL;

-- 2. Add SEO metadata optimization columns
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "meta_title" VARCHAR(255);
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "meta_description" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "canonical_url" VARCHAR(500);
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "og_image" TEXT;

-- 3. Composite and single-column indexes for fast sorting and queries
CREATE INDEX IF NOT EXISTS idx_blog_post_view_count ON "BlogPost"("view_count" DESC);
CREATE INDEX IF NOT EXISTS idx_blog_post_published_views ON "BlogPost"("status", "view_count" DESC);
