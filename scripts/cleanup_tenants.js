const { Pool } = require('@neondatabase/serverless');

const neonURL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_t6UQAzVEqBO4@ep-falling-star-b4lrdr76.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const NETS_ORG_ID = '1aa8c687-b71d-4188-9de2-371aa5dfa9e6';
const REED_ORG_ID = '2bb399db-3689-5129-9b64-e53f0419fa07';

async function runCleanup() {
  const pool = new Pool({ connectionString: neonURL });
  const client = await pool.connect();

  console.log('🔄 Starting tenant data cleanup...');

  try {
    await client.query('BEGIN');

    // 1. Update ADM001 for Reed Breed Systems
    console.log('1. Updating Ifeanyi Reed (ADM001)...');
    await client.query(`
      UPDATE "User" SET
        name = 'Ifeanyi Reed',
        role = 'TENANT_OWNER',
        company = 'Reed Breed Systems',
        "tenantSlug" = 'reedbreed'
      WHERE id = 'ADM001' OR email = 'ifeanyireed@gmail.com';
    `);

    // 2. Update ADM002 (David Mbacha)
    await client.query(`
      UPDATE "User" SET
        company = 'Reed Breed Systems',
        "tenantSlug" = 'reedbreed'
      WHERE id = 'ADM002' OR email = 'davidmbacha@gmail.com';
    `);

    // 3. Update Ifeanyi Felix and NETS users tenantSlug
    console.log('2. Tagging New Era Transports users...');
    await client.query(`
      UPDATE "User" SET
        "tenantSlug" = 'neweratransports'
      WHERE id = '1bb299db-2578-4018-8a53-e42e0308fa06'
         OR company = 'NETS'
         OR email ILIKE '%@neweratransports.com';
    `);

    // 4. Ensure New Era Transports exists with full details in Organization
    console.log('3. Upserting New Era Transports in Organization...');
    await client.query(`
      INSERT INTO "Organization" (
        id, name, slug, "ownerId", owner_id, "planTier", plan_tier,
        "billingCycle", billing_cycle, status, domain, logo,
        primary_color, secondary_color, created_at, updated_at
      ) VALUES (
        $1, 'New Era Transports', 'neweratransports',
        '1bb299db-2578-4018-8a53-e42e0308fa06', '1bb299db-2578-4018-8a53-e42e0308fa06',
        'ENTERPRISE', 'ENTERPRISE',
        'MONTHLY', 'MONTHLY',
        'ACTIVE', 'neweratransports.ofia.ng',
        'https://res.cloudinary.com/ihfqdysu/image/upload/v1790736847/ofia_ng_assets/emfgp9dinkhpkaevpnsx.png',
        '#1A56DB', '#0E9F6E',
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        "ownerId" = EXCLUDED."ownerId",
        owner_id = EXCLUDED.owner_id,
        "planTier" = EXCLUDED."planTier",
        plan_tier = EXCLUDED.plan_tier,
        "billingCycle" = EXCLUDED."billingCycle",
        billing_cycle = EXCLUDED.billing_cycle,
        status = EXCLUDED.status,
        domain = EXCLUDED.domain,
        logo = EXCLUDED.logo,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        updated_at = NOW();
    `, [NETS_ORG_ID]);

    // 5. Ensure Reed Breed Systems exists in Organization
    console.log('4. Upserting Reed Breed Systems in Organization...');
    await client.query(`
      INSERT INTO "Organization" (
        id, name, slug, "ownerId", owner_id, "planTier", plan_tier,
        "billingCycle", billing_cycle, status, domain, logo,
        primary_color, secondary_color, created_at, updated_at
      ) VALUES (
        $1, 'Reed Breed Systems', 'reedbreed',
        'ADM001', 'ADM001',
        'ENTERPRISE', 'ENTERPRISE',
        'MONTHLY', 'MONTHLY',
        'ACTIVE', 'reedbreed.cc',
        'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686456/ofia_ng_assets/rr1m5fkqj8ei3eao1qjm.jpg',
        '#1A56DB', '#9061F9',
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        "ownerId" = EXCLUDED."ownerId",
        owner_id = EXCLUDED.owner_id,
        "planTier" = EXCLUDED."planTier",
        plan_tier = EXCLUDED.plan_tier,
        "billingCycle" = EXCLUDED."billingCycle",
        billing_cycle = EXCLUDED.billing_cycle,
        status = EXCLUDED.status,
        domain = EXCLUDED.domain,
        logo = EXCLUDED.logo,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        updated_at = NOW();
    `, [REED_ORG_ID]);

    // 6. Reassign GTM records from org-01 to New Era Transports
    console.log('5. Reassigning GTM records from org-01 to New Era Transports...');
    const gtmTables = [
      'gtm_agent', 'gtm_approval', 'gtm_campaign', 'gtm_lead',
      'gtm_strategy', 'gtm_tenant_settings', 'gtm_email_dispatch_log',
      'gtm_email_reply', 'gtm_social_post_metrics'
    ];
    for (const tbl of gtmTables) {
      await client.query(`
        UPDATE "${tbl}" SET
          "organizationId" = $1,
          organization_id = $1
        WHERE "organizationId" = 'org-01' OR organization_id = 'org-01';
      `, [NETS_ORG_ID]);
    }

    // Update GTM tenant settings for New Era Transports
    await client.query(`
      UPDATE gtm_tenant_settings SET
        "emailFromAddress" = 'operations@neweratransports.com',
        email_from_address = 'operations@neweratransports.com',
        "emailFromName" = 'New Era Transports Operations',
        email_from_name = 'New Era Transports Operations',
        "sendingDomain" = 'neweratransports.com',
        sending_domain = 'neweratransports.com'
      WHERE "organizationId" = $1 OR organization_id = $1;
    `, [NETS_ORG_ID]);

    // 7. Clone GTM Agents for Reed Breed Systems
    console.log('6. Seeding GTM Agents for Reed Breed Systems...');
    await client.query(`
      INSERT INTO gtm_agent (
        id, "organizationId", organization_id, key, name, role, category,
        status, "currentTask", "taskProgress", "confidenceScore",
        "circuitBreakerActive", "createdAt", "updatedAt"
      )
      SELECT 
        'rb_' || id,
        $1,
        $1,
        key,
        name,
        role,
        category,
        status,
        "currentTask",
        "taskProgress",
        "confidenceScore",
        "circuitBreakerActive",
        NOW(),
        NOW()
      FROM gtm_agent
      WHERE ("organizationId" = $2 OR organization_id = $2)
      ON CONFLICT (id) DO NOTHING;
    `, [REED_ORG_ID, NETS_ORG_ID]);

    // Seed GTM Tenant Settings for Reed Breed Systems
    await client.query(`
      INSERT INTO gtm_tenant_settings (
        id, "organizationId", organization_id,
        "emailProvider", email_provider,
        "emailFromAddress", email_from_address,
        "emailFromName", email_from_name,
        "sendingDomain", sending_domain,
        "domainStatus", domain_status,
        "dailyEmailLimit", daily_email_limit,
        "autoPublishEnabled", auto_publish_enabled,
        "useTenantKeysOnly", use_tenant_keys_only,
        "createdAt", "updatedAt"
      ) VALUES (
        'ts_reedbreed_01', $1, $1,
        'AWS_SES', 'AWS_SES',
        'systems@reedbreed.cc', 'systems@reedbreed.cc',
        'Reed Breed Systems Operations', 'Reed Breed Systems Operations',
        'reedbreed.cc', 'reedbreed.cc',
        'VERIFIED', 'VERIFIED',
        2000, '2000',
        true, true,
        false, false,
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        "emailFromAddress" = EXCLUDED."emailFromAddress",
        email_from_address = EXCLUDED.email_from_address,
        "sendingDomain" = EXCLUDED."sendingDomain",
        sending_domain = EXCLUDED.sending_domain;
    `, [REED_ORG_ID]);

    // 8. Delete obsolete WorkspaceMembers
    console.log('7. Cleaning WorkspaceMembers...');
    await client.query(`
      DELETE FROM "WorkspaceMember"
      WHERE ("organizationId" NOT IN ($1, $2) AND "organization_id" NOT IN ($1, $2))
         OR ("organizationId" = '' AND "organization_id" = '');
    `, [NETS_ORG_ID, REED_ORG_ID]);

    // Insert active members for New Era Transports
    const netsMembers = [
      { id: 'wm-nets-owner', userId: '1bb299db-2578-4018-8a53-e42e0308fa06', role: 'TENANT_OWNER' },
      { id: 'wm-nets-acc', userId: 'ACC001', role: 'GROWTH_LEAD' },
      { id: 'wm-nets-mgr', userId: 'EMP006', role: 'SALES_REP' },
      { id: 'wm-nets-csr', userId: 'EMP001', role: 'VIEWER' },
    ];
    for (const m of netsMembers) {
      await client.query(`
        INSERT INTO "WorkspaceMember" (
          id, "organizationId", organization_id, "userId", user_id, role, "createdAt"
        ) VALUES (
          $1, $2, $2, $3, $3, $4, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
      `, [m.id, NETS_ORG_ID, m.userId, m.role]);
    }

    // Insert active members for Reed Breed Systems
    const reedMembers = [
      { id: 'wm-reed-owner', userId: 'ADM001', role: 'TENANT_OWNER' },
      { id: 'wm-reed-tech', userId: 'ADM002', role: 'GROWTH_LEAD' },
    ];
    for (const m of reedMembers) {
      await client.query(`
        INSERT INTO "WorkspaceMember" (
          id, "organizationId", organization_id, "userId", user_id, role, "createdAt"
        ) VALUES (
          $1, $2, $2, $3, $3, $4, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
      `, [m.id, REED_ORG_ID, m.userId, m.role]);
    }

    // 9. Delete obsolete organizations: org-01, org-02, org-03, org-04, and any other non-kept orgs
    console.log('8. Removing old tenants from Organization table...');
    await client.query(`
      DELETE FROM "Organization"
      WHERE id NOT IN ($1, $2)
         OR slug NOT IN ('neweratransports', 'reedbreed');
    `, [NETS_ORG_ID, REED_ORG_ID]);

    // 10. Tag PerformanceReviews & Quests with neweratransports
    console.log('9. Tagging reviews and quest items with neweratransports...');
    await client.query(`
      UPDATE "PerformanceReview" SET "tenantSlug" = 'neweratransports' WHERE "tenantSlug" = '' OR "tenantSlug" IS NULL;
      UPDATE "QuestChallenge" SET "tenantSlug" = 'neweratransports' WHERE "tenantSlug" = '' OR "tenantSlug" IS NULL;
      UPDATE "QuestScheduleItem" SET "tenantSlug" = 'neweratransports' WHERE "tenantSlug" = '' OR "tenantSlug" IS NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Cleanup transaction successfully committed!');

    // Verify current state
    const orgRes = await client.query('SELECT id, name, slug, domain, "planTier" FROM "Organization"');
    console.log('Active Organizations in Neon DB:', orgRes.rows);

    const memberRes = await client.query('SELECT count(*) as total_members FROM "WorkspaceMember"');
    console.log('Total Workspace Members:', memberRes.rows[0].total_members);

    const userRes = await client.query('SELECT "tenantSlug", count(*) FROM "User" GROUP BY "tenantSlug"');
    console.log('Users by Tenant:', userRes.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Cleanup failed, rolled back:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanup().catch(err => {
  console.error(err);
  process.exit(1);
});
