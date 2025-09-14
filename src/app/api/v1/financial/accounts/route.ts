/**
 * Financial Accounts API v1 endpoints
 * GET /api/v1/financial/accounts - List financial accounts
 * POST /api/v1/financial/accounts - Create new financial account
 */

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { financialAccountSchema } from '@/models/Schema';

// Validation schemas
const createAccountSchema = z.object({
  accountCode: z.string().min(1, 'Account code is required').max(20, 'Account code too long'),
  accountName: z.string().min(1, 'Account name is required').max(255, 'Account name too long'),
  accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  parentAccountId: z.number().optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']).optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = querySchema.parse(queryParams);

    const { page, limit, accountType, isActive, search } = validatedQuery;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(financialAccountSchema.organizationId, orgId),
    ];

    if (accountType) {
      whereConditions.push(eq(financialAccountSchema.accountType, accountType));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(financialAccountSchema.isActive, isActive));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(financialAccountSchema.accountCode, `%${search}%`),
          ilike(financialAccountSchema.accountName, `%${search}%`),
        )!,
      );
    }

    // Get database connection
    const database = await db;

    // Query accounts with pagination
    const [accounts, totalCount] = await Promise.all([
      database
        .select()
        .from(financialAccountSchema)
        .where(and(...whereConditions))
        .orderBy(desc(financialAccountSchema.createdAt))
        .limit(limit)
        .offset(offset),
      database
        .select({ count: sql`count(*)` })
        .from(financialAccountSchema)
        .where(and(...whereConditions))
        .then((result: any) => result[0]?.count || 0),
    ]);

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit);

    logger.info(`Financial accounts fetched for org ${orgId}`, {
      total,
      page,
      limit,
      filters: { accountType, isActive, search },
    });

    return NextResponse.json({
      success: true,
      data: {
        accounts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          accountType,
          isActive,
          search,
        },
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in GET /api/v1/financial/accounts:', error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors,
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    logger.error('Error fetching financial accounts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch financial accounts',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAccountSchema.parse(body);

    // Get database connection
    const database = await db;

    // Create financial account with ERP audit trail
    const [newAccount] = await database
      .insert(financialAccountSchema)
      .values({
        ...validatedData,
        organizationId: orgId,
        createdById: userId,
        updatedById: userId,
        version: 1,
      })
      .returning();

    logger.info(`Financial account created for org ${orgId}`, {
      accountId: newAccount.id,
      accountCode: newAccount.accountCode,
      accountName: newAccount.accountName,
      createdBy: userId,
    });

    return NextResponse.json({
      success: true,
      data: newAccount,
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in POST /api/v1/financial/accounts:', error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    logger.error('Error creating financial account:', error);
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create financial account',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
