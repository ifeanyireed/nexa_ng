import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  try {
    const sql = await getTenantSql(tenantSlug);

    if (!sql) {
      return NextResponse.json({
        success: true,
        wallet: {
          availableBalance: 0,
          escrowBalance: 0,
          totalWithdrawn: 0,
          currency: "NGN",
          bankName: "",
          accountNumber: "",
          accountName: "",
        },
        transactions: [],
        payouts: [],
      });
    }

    // 1. Query wallet balance
    const walletRows = await sql`
      SELECT id, tenant_slug, COALESCE(tenant_id, '') as tenant_id,
             available_balance, escrow_balance, total_withdrawn,
             currency, COALESCE(bank_name, '') as bank_name,
             COALESCE(account_number, '') as account_number,
             COALESCE(account_name, '') as account_name,
             created_at, updated_at
      FROM tenant_wallets
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    // 2. Query transactions
    const txRows = await sql`
      SELECT id, tenant_slug, type, amount, reference, description,
             channel, is_escrow, status, created_at
      FROM tenant_wallet_transactions
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      ORDER BY created_at DESC
      LIMIT 30;
    `;

    // 3. Query payouts
    const payoutRows = await sql`
      SELECT id, tenant_slug, amount, bank_name, account_number,
             account_name, status, notes, created_at
      FROM tenant_payout_requests
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      ORDER BY created_at DESC
      LIMIT 20;
    `;

    const walletData = walletRows.length > 0 ? walletRows[0] : null;

    return NextResponse.json({
      success: true,
      tenantSlug,
      wallet: {
        id: walletData?.id || `wal-${tenantSlug}`,
        availableBalance: Number(walletData?.available_balance || 0),
        escrowBalance: Number(walletData?.escrow_balance || 0),
        totalWithdrawn: Number(walletData?.total_withdrawn || 0),
        currency: walletData?.currency || "NGN",
        bankName: walletData?.bank_name || "",
        accountNumber: walletData?.account_number || "",
        accountName: walletData?.account_name || "",
      },
      transactions: txRows.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        reference: tx.reference,
        description: tx.description,
        channel: tx.channel,
        isEscrow: Boolean(tx.is_escrow),
        status: tx.status,
        createdAt: tx.created_at,
      })),
      payouts: payoutRows.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        bankName: p.bank_name,
        accountNumber: p.account_number,
        accountName: p.account_name,
        status: p.status,
        notes: p.notes,
        createdAt: p.created_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tenant wallet: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawTenant = body.tenantSlug || request.headers.get("x-tenant-slug");

    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const amount = Number(body.amount);
    const bankName = (body.bankName || "").trim();
    const accountNumber = (body.accountNumber || "").trim();
    const accountName = (body.accountName || "").trim();
    const notes = body.notes || "Merchant withdrawal request";

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive withdrawal amount is required" },
        { status: 400 }
      );
    }

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { success: false, error: "Bank name, account number, and account name are required for payout" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    if (!sql) {
      return NextResponse.json(
        { success: false, error: "Failed to connect to tenant database" },
        { status: 500 }
      );
    }

    // 1. Verify current available balance
    const walletRows = await sql`
      SELECT available_balance, escrow_balance, total_withdrawn
      FROM tenant_wallets
      WHERE LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    const currentAvailable = walletRows.length > 0 ? Number(walletRows[0].available_balance) : 0;
    const currentEscrow = walletRows.length > 0 ? Number(walletRows[0].escrow_balance) : 0;

    if (currentAvailable < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient available balance (₦${currentAvailable.toLocaleString()} available). Note: ₦${currentEscrow.toLocaleString()} is locked in Escrow and will become available once customer delivery is verified.`,
        },
        { status: 400 }
      );
    }

    const payoutId = `PAYOUT-${Date.now().toString().slice(-8)}`;
    const txId = `tx-wd-${Date.now().toString().slice(-8)}`;

    // 2. Decrement available balance & increment total withdrawn
    await sql`
      UPDATE tenant_wallets
      SET available_balance = available_balance - ${amount},
          total_withdrawn = total_withdrawn + ${amount},
          bank_name = ${bankName},
          account_number = ${accountNumber},
          account_name = ${accountName},
          updated_at = NOW()
      WHERE LOWER(tenant_slug) = ${tenantSlug};
    `;

    // 3. Record payout request
    await sql`
      INSERT INTO tenant_payout_requests (
        id, tenant_slug, tenant_id, amount, bank_name, account_number, account_name,
        status, notes, created_at
      ) VALUES (
        ${payoutId}, ${tenantSlug}, ${body.tenantId || ""}, ${amount},
        ${bankName}, ${accountNumber}, ${accountName}, 'PROCESSED',
        ${notes}, NOW()
      );
    `;

    // 4. Record ledger transaction
    await sql`
      INSERT INTO tenant_wallet_transactions (
        id, tenant_slug, tenant_id, type, amount, reference, description,
        channel, is_escrow, status, created_at
      ) VALUES (
        ${txId}, ${tenantSlug}, ${body.tenantId || ""}, 'WITHDRAWAL', ${amount},
        ${payoutId}, ${`Bank transfer withdrawal of ₦${amount.toLocaleString()} to ${bankName} (${accountNumber}).`},
        'PAYOUT', FALSE, 'SUCCESS', NOW()
      );
    `;

    const newAvailable = currentAvailable - amount;

    return NextResponse.json({
      success: true,
      message: `Withdrawal of ₦${amount.toLocaleString()} successfully processed to ${bankName} (${accountNumber}). Funds will reflect in your account.`,
      payoutId,
      newAvailableBalance: newAvailable,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Withdrawal processing failed: " + err.message },
      { status: 500 }
    );
  }
}
