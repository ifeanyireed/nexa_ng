import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  process.env.USERS_API_URL ||
  process.env.NEXT_PUBLIC_USERS_API ||
  "";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl ? (cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`) : "";

const USERS_DB_URL =
  process.env.USERS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "";

function getUsersSql() {
  if (!USERS_DB_URL) return null;
  return neon(USERS_DB_URL);
}

function getMasterSql() {
  const masterUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!masterUrl) return null;
  return neon(masterUrl);
}

/**
 * Ensures SEO and custom analytics columns exist in BlogPost.
 */
let isSchemaEnsured = false;
async function ensureBlogPostSchema(sql: any) {
  if (isSchemaEnsured || !sql) return;
  try {
    await sql`
      ALTER TABLE "BlogPost" 
      ADD COLUMN IF NOT EXISTS "meta_title" VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS "meta_description" TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS "canonical_url" TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS "og_image" TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS "view_count" BIGINT DEFAULT 0;
    `;
    isSchemaEnsured = true;
  } catch (err: any) {
    // Non-fatal if table doesn't exist or already configured
    console.warn("[Blog Posts API] Note ensuring schema:", err.message);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("id");
    const targetSlug = searchParams.get("slug");
    const sql = getUsersSql();

    // 1. Direct Lakebase Neon database query (highest priority & reliability)
    if (sql) {
      try {
        if (targetId || targetSlug) {
          const cleanTarget = (targetId || targetSlug || "").trim();
          const rows = await sql`
            SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.category_id, p.tags, p.status,
                   p.author_id, p.author_name, p.published_at, p.created_at, p.updated_at,
                   p.meta_title, p.meta_description, p.canonical_url, p.og_image, p.view_count,
                   c.name as category
            FROM "BlogPost" p
            LEFT JOIN "BlogCategory" c ON p.category_id = c.id
            WHERE p.id = ${cleanTarget} 
               OR p.slug = ${cleanTarget}
               OR LOWER(p.slug) = LOWER(${cleanTarget})
               OR LOWER(p.id) = LOWER(${cleanTarget})
            LIMIT 1;
          `;

          if (rows && rows.length > 0) {
            const dbPost = rows[0];
            return NextResponse.json({
              ...dbPost,
              category: dbPost.category || "Commerce & AI",
              author: { full_name: dbPost.author_name || "Admin" },
              meta_title: dbPost.meta_title || "",
              meta_description: dbPost.meta_description || "",
              canonical_url: dbPost.canonical_url || "",
              og_image: dbPost.og_image || "",
              view_count: Number(dbPost.view_count || 0),
            });
          }
        } else {
          // List query
          const dbRows = await sql`
            SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.category_id, p.tags, p.status,
                   p.author_id, p.author_name, p.published_at, p.created_at, p.updated_at,
                   p.meta_title, p.meta_description, p.canonical_url, p.og_image, p.view_count,
                   c.name as category
            FROM "BlogPost" p
            LEFT JOIN "BlogCategory" c ON p.category_id = c.id
            ORDER BY COALESCE(p.published_at, p.created_at) DESC;
          `;

          if (dbRows && dbRows.length > 0) {
            const formatted = dbRows.map((r: any) => ({
              ...r,
              category: r.category || "Commerce & AI",
              author: { full_name: r.author_name || "Admin" },
              meta_title: r.meta_title || "",
              meta_description: r.meta_description || "",
              canonical_url: r.canonical_url || "",
              og_image: r.og_image || "",
              view_count: Number(r.view_count || 0),
            }));
            return NextResponse.json(formatted);
          }
        }
      } catch (dbErr) {
        console.warn("[Blog Posts API] Database query error:", dbErr);
      }
    }

    // 2. Microservice fallback if database has no rows or is unavailable
    let microserviceData: any = null;
    if (USER_BASE) {
      try {
        const { search } = new URL(request.url);
        const res = await fetch(`${USER_BASE}/cms/blog/posts${search}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          microserviceData = await res.json().catch(() => null);
        }
      } catch (microErr) {
        // Expected when microservice is cold or spun down
      }
    }

    if (microserviceData) {
      return NextResponse.json(microserviceData);
    }

    if (targetId || targetSlug) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json([]);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error fetching blog posts: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {}

    const sql = getUsersSql();
    if (sql) {
      await ensureBlogPostSchema(sql);
    }

    // 1. Forward to microservice (non-blocking)
    let createdPost: any = null;
    if (USER_BASE) {
      try {
        const res = await fetch(`${USER_BASE}/cms/blog/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: rawBody,
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          createdPost = await res.json().catch(() => null);
        }
      } catch (microErr) {
        console.warn("[Blog Posts API] Microservice POST note:", microErr);
      }
    }

    const postId = createdPost?.id || body.id || `post_${Date.now()}`;
    const cleanTitle = (body.title || "").trim();
    const cleanSlug = (createdPost?.slug || body.slug || "").trim() || `post-${Date.now()}`;
    const cleanExcerpt = (body.excerpt || "").trim();
    const cleanContent = body.content || "";
    const cleanCoverImage = (body.cover_image || "").trim();
    const cleanCategoryId = body.category_id || null;
    const cleanTags = body.tags || "";
    const cleanStatus = body.status || "DRAFT";
    const cleanAuthorId = body.author_id || "admin";
    const cleanAuthorName = body.author_name || "Ofia Editorial Team";
    const cleanMetaTitle = (body.meta_title !== undefined ? String(body.meta_title) : "").trim();
    const cleanMetaDesc = (body.meta_description !== undefined ? String(body.meta_description) : "").trim();
    const cleanCanonical = (body.canonical_url !== undefined && body.canonical_url !== null ? String(body.canonical_url) : "").trim();
    const cleanOgImg = (body.og_image !== undefined && body.og_image !== null ? String(body.og_image) : "").trim();
    const publishedAt = cleanStatus === "PUBLISHED" ? (body.published_at || new Date().toISOString()) : null;

    // 2. Direct persistence into Central Users DB (UPSERT so it never fails even if microservice was asleep)
    if (sql) {
      try {
        await sql`
          INSERT INTO "BlogPost" (
            id, title, slug, excerpt, content, cover_image, category_id, tags, status,
            author_id, author_name, published_at, created_at, updated_at,
            meta_title, meta_description, canonical_url, og_image, view_count
          )
          VALUES (
            ${postId},
            ${cleanTitle},
            ${cleanSlug},
            ${cleanExcerpt},
            ${cleanContent},
            ${cleanCoverImage || null},
            ${cleanCategoryId},
            ${cleanTags},
            ${cleanStatus},
            ${cleanAuthorId},
            ${cleanAuthorName},
            ${publishedAt},
            NOW(),
            NOW(),
            ${cleanMetaTitle},
            ${cleanMetaDesc},
            ${cleanCanonical},
            ${cleanOgImg},
            0
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            excerpt = EXCLUDED.excerpt,
            content = EXCLUDED.content,
            cover_image = EXCLUDED.cover_image,
            category_id = EXCLUDED.category_id,
            tags = EXCLUDED.tags,
            status = EXCLUDED.status,
            meta_title = EXCLUDED.meta_title,
            meta_description = EXCLUDED.meta_description,
            canonical_url = EXCLUDED.canonical_url,
            og_image = EXCLUDED.og_image,
            published_at = COALESCE("BlogPost".published_at, EXCLUDED.published_at),
            updated_at = NOW();
        `;
      } catch (dbErr) {
        console.error("[Blog Posts API] Database post insert/update error:", dbErr);
      }
    }

    const merged = {
      ...(createdPost || body),
      id: postId,
      slug: cleanSlug,
      title: cleanTitle,
      status: cleanStatus,
      meta_title: cleanMetaTitle,
      meta_description: cleanMetaDesc,
      canonical_url: cleanCanonical,
      og_image: cleanOgImg,
      published_at: publishedAt,
    };

    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create blog post: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {}

    const targetId = body.id;
    if (!targetId) {
      return NextResponse.json({ error: "Post ID is required for PUT update" }, { status: 400 });
    }

    const sql = getUsersSql();
    if (sql) {
      await ensureBlogPostSchema(sql);
    }

    // 1. Forward to microservice
    let microserviceRes: any = null;
    if (USER_BASE) {
      try {
        const res = await fetch(`${USER_BASE}/cms/blog/posts`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: rawBody,
          signal: AbortSignal.timeout(8000),
        });
        microserviceRes = await res.json().catch(() => null);
      } catch (microErr) {
        console.warn("[Blog Posts API] Microservice PUT note:", microErr);
      }
    }

    // 2. Direct persistence into Central Users DB
    const cleanMetaTitle = (body.meta_title !== undefined ? String(body.meta_title) : "").trim();
    const cleanMetaDesc = (body.meta_description !== undefined ? String(body.meta_description) : "").trim();
    const cleanCanonical = (body.canonical_url !== undefined && body.canonical_url !== null ? String(body.canonical_url) : "").trim();
    const cleanOgImg = (body.og_image !== undefined && body.og_image !== null ? String(body.og_image) : "").trim();
    const cleanTitle = (body.title || "").trim();
    const cleanExcerpt = (body.excerpt || "").trim();
    const cleanContent = body.content || "";
    const cleanCoverImage = (body.cover_image || "").trim();
    const cleanCategoryId = body.category_id || null;
    const cleanTags = body.tags || "";
    const cleanStatus = body.status || "DRAFT";
    const cleanSlug = body.slug ? String(body.slug).trim() : null;

    if (sql) {
      try {
        await sql`
          UPDATE "BlogPost"
          SET
            meta_title = ${cleanMetaTitle},
            meta_description = ${cleanMetaDesc},
            canonical_url = ${cleanCanonical},
            og_image = ${cleanOgImg},
            title = COALESCE(NULLIF(${cleanTitle}, ''), title),
            excerpt = COALESCE(NULLIF(${cleanExcerpt}, ''), excerpt),
            content = COALESCE(NULLIF(${cleanContent}, ''), content),
            cover_image = CASE WHEN ${body.cover_image !== undefined} THEN ${cleanCoverImage || null} ELSE cover_image END,
            category_id = COALESCE(${cleanCategoryId}, category_id),
            tags = COALESCE(NULLIF(${cleanTags}, ''), tags),
            status = COALESCE(NULLIF(${cleanStatus}, ''), status),
            slug = COALESCE(${cleanSlug}, slug),
            updated_at = NOW()
          WHERE id = ${targetId};
        `;
      } catch (dbErr) {
        console.error("[Blog Posts API] Database update error:", dbErr);
      }
    }

    // 3. Also update master DB if exists
    const masterSql = getMasterSql();
    if (masterSql && process.env.DATABASE_URL !== process.env.USERS_DATABASE_URL) {
      try {
        await masterSql`
          UPDATE blog_posts
          SET
            meta_title = ${cleanMetaTitle},
            meta_description = ${cleanMetaDesc},
            canonical_url = ${cleanCanonical},
            og_image = ${cleanOgImg},
            cover_image = CASE WHEN ${body.cover_image !== undefined} THEN ${cleanCoverImage || null} ELSE cover_image END,
            updated_at = NOW()
          WHERE id = ${targetId} OR slug = ${cleanSlug || ""};
        `.catch(() => null);
      } catch {}
    }

    const merged = {
      ...(microserviceRes || {}),
      id: targetId,
      meta_title: cleanMetaTitle,
      meta_description: cleanMetaDesc,
      canonical_url: cleanCanonical,
      og_image: cleanOgImg,
      slug: cleanSlug || microserviceRes?.slug,
      status: cleanStatus,
    };

    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update blog post: " + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    if (USER_BASE) {
      try {
        await fetch(`${USER_BASE}/cms/blog/posts?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          signal: AbortSignal.timeout(8000),
        });
      } catch {}
    }

    const sql = getUsersSql();
    if (sql) {
      try {
        await sql`
          DELETE FROM "BlogPost" WHERE id = ${id};
        `;
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete post: " + err.message },
      { status: 500 }
    );
  }
}
