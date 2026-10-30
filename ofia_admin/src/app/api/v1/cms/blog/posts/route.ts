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
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

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
    const { searchParams, search } = new URL(request.url);
    const targetId = searchParams.get("id");
    const targetSlug = searchParams.get("slug");
    const sql = getUsersSql();

    if (sql) {
      await ensureBlogPostSchema(sql);
    }

    // 1. Fetch from microservice first
    let microserviceData: any = null;
    if (USER_BASE) {
      try {
        const res = await fetch(`${USER_BASE}/cms/blog/posts${search}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          microserviceData = await res.json().catch(() => null);
        }
      } catch (microErr) {
        console.warn("[Blog Posts API] Microservice fetch note:", microErr);
      }
    }

    // 2. Query Central Users DB directly to enrich with persistent SEO fields
    if (sql) {
      try {
        if (targetId || targetSlug) {
          const rows = await sql`
            SELECT id, title, slug, excerpt, content, cover_image, category_id, tags, status,
                   author_id, author_name, published_at, created_at, updated_at,
                   meta_title, meta_description, canonical_url, og_image, view_count
            FROM "BlogPost"
            WHERE id = ${targetId || ""} OR slug = ${targetSlug || targetId || ""}
            LIMIT 1;
          `;

          if (rows && rows.length > 0) {
            const dbPost = rows[0];
            const baseObj =
              microserviceData && !Array.isArray(microserviceData) && (microserviceData.id || microserviceData.title)
                ? microserviceData
                : {};

            const enrichedPost = {
              ...baseObj,
              id: dbPost.id,
              title: baseObj.title || dbPost.title || "",
              slug: baseObj.slug || dbPost.slug || "",
              excerpt: baseObj.excerpt || dbPost.excerpt || "",
              content: baseObj.content || dbPost.content || "",
              cover_image: baseObj.cover_image || dbPost.cover_image || "",
              category_id: baseObj.category_id || dbPost.category_id || "",
              tags: baseObj.tags || dbPost.tags || "",
              status: baseObj.status || dbPost.status || "DRAFT",
              author_id: baseObj.author_id || dbPost.author_id || "",
              author: baseObj.author || { full_name: dbPost.author_name || "Admin" },
              meta_title: dbPost.meta_title ?? baseObj.meta_title ?? "",
              meta_description: dbPost.meta_description ?? baseObj.meta_description ?? "",
              canonical_url: dbPost.canonical_url ?? baseObj.canonical_url ?? "",
              og_image: dbPost.og_image ?? baseObj.og_image ?? "",
              view_count: Number(dbPost.view_count || baseObj.view_count || 0),
              published_at: dbPost.published_at || baseObj.published_at,
              created_at: dbPost.created_at || baseObj.created_at,
              updated_at: dbPost.updated_at || baseObj.updated_at,
            };

            return NextResponse.json(enrichedPost);
          }
        } else {
          // List query
          const dbRows = await sql`
            SELECT id, title, slug, excerpt, content, cover_image, category_id, tags, status,
                   author_id, author_name, published_at, created_at, updated_at,
                   meta_title, meta_description, canonical_url, og_image, view_count
            FROM "BlogPost"
            ORDER BY created_at DESC;
          `;

          const dbMap = new Map<string, any>();
          if (Array.isArray(dbRows)) {
            for (const r of dbRows) {
              if (r.id) dbMap.set(r.id, r);
              if (r.slug) dbMap.set(r.slug, r);
            }
          }

          if (Array.isArray(microserviceData) && microserviceData.length > 0) {
            const merged = microserviceData.map((p: any) => {
              const matched = dbMap.get(p.id) || (p.slug ? dbMap.get(p.slug) : null);
              if (matched) {
                return {
                  ...p,
                  meta_title: matched.meta_title ?? p.meta_title ?? "",
                  meta_description: matched.meta_description ?? p.meta_description ?? "",
                  canonical_url: matched.canonical_url ?? p.canonical_url ?? "",
                  og_image: matched.og_image ?? p.og_image ?? "",
                  view_count: Number(matched.view_count || p.view_count || 0),
                };
              }
              return p;
            });
            return NextResponse.json(merged);
          } else if (dbRows && dbRows.length > 0) {
            const formatted = dbRows.map((r: any) => ({
              id: r.id,
              title: r.title,
              slug: r.slug,
              excerpt: r.excerpt,
              content: r.content,
              cover_image: r.cover_image,
              category_id: r.category_id,
              tags: r.tags,
              status: r.status,
              author_id: r.author_id,
              author: { full_name: r.author_name || "Admin" },
              meta_title: r.meta_title || "",
              meta_description: r.meta_description || "",
              canonical_url: r.canonical_url || "",
              og_image: r.og_image || "",
              view_count: Number(r.view_count || 0),
              published_at: r.published_at,
              created_at: r.created_at,
              updated_at: r.updated_at,
            }));
            return NextResponse.json(formatted);
          }
        }
      } catch (dbErr) {
        console.warn("[Blog Posts API] Database query error:", dbErr);
      }
    }

    if (microserviceData) {
      return NextResponse.json(microserviceData);
    }

    return NextResponse.json({ error: "Post not found" }, { status: 404 });
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

    // 1. Forward to microservice
    let createdPost: any = null;
    if (USER_BASE) {
      try {
        const res = await fetch(`${USER_BASE}/cms/blog/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: rawBody,
          signal: AbortSignal.timeout(8000),
        });
        createdPost = await res.json().catch(() => null);
      } catch (microErr) {
        console.warn("[Blog Posts API] Microservice POST note:", microErr);
      }
    }

    const postId = createdPost?.id || body.id || `post_${Date.now()}`;
    const cleanSlug = createdPost?.slug || body.slug || "";
    const cleanMetaTitle = (body.meta_title !== undefined ? String(body.meta_title) : "").trim();
    const cleanMetaDesc = (body.meta_description !== undefined ? String(body.meta_description) : "").trim();
    const cleanCanonical = (body.canonical_url !== undefined && body.canonical_url !== null ? String(body.canonical_url) : "").trim();
    const cleanOgImg = (body.og_image !== undefined && body.og_image !== null ? String(body.og_image) : "").trim();

    // 2. Ensure persistent SEO fields are saved to database
    if (sql && postId) {
      try {
        await sql`
          UPDATE "BlogPost"
          SET
            meta_title = ${cleanMetaTitle},
            meta_description = ${cleanMetaDesc},
            canonical_url = ${cleanCanonical},
            og_image = ${cleanOgImg},
            updated_at = NOW()
          WHERE id = ${postId};
        `;
      } catch (dbErr) {
        console.error("[Blog Posts API] Database post-create update error:", dbErr);
      }
    }

    const merged = {
      ...(createdPost || body),
      id: postId,
      slug: cleanSlug,
      meta_title: cleanMetaTitle,
      meta_description: cleanMetaDesc,
      canonical_url: cleanCanonical,
      og_image: cleanOgImg,
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
            cover_image = COALESCE(NULLIF(${cleanCoverImage}, ''), cover_image),
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
