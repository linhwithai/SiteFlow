/**
 * Bot Webhook API endpoint
 * POST /api/webhooks/bot - Receive data from n8n workflow and Telegram/Zalo bots
 */

import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { dailyLogSchema, projectSchema } from '@/models/Schema';

// Validation schemas
const botWebhookSchema = z.object({
  source: z.enum(['telegram', 'zalo', 'n8n']),
  userId: z.string().min(1, 'User ID is required'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  type: z.enum(['daily_log', 'project_update', 'photo_upload', 'status_update']),
  data: z.record(z.any()),
  timestamp: z.string().datetime().optional(),
  messageId: z.string().optional(),
});

const dailyLogBotDataSchema = z.object({
  projectId: z.number().int().positive('Project ID must be positive'),
  title: z.string().min(1, 'Title is required'),
  workDescription: z.string().min(1, 'Work description is required'),
  weather: z.string().optional(),
  temperature: z.number().int().optional(),
  workHours: z.number().int().min(0).max(24).default(8),
  workersCount: z.number().int().min(0).default(0),
  issues: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(), // Array of photo URLs
});

const projectUpdateBotDataSchema = z.object({
  projectId: z.number().int().positive('Project ID must be positive'),
  status: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = botWebhookSchema.parse(body);

    const { source, userId, organizationId, type, data, timestamp, messageId } = validatedData;

    logger.info(`Bot webhook received from ${source}`, {
      type,
      userId,
      organizationId,
      messageId,
    });

    // Get database connection
    const database = await db;

    let result: any = {};

    switch (type) {
      case 'daily_log': {
        const logData = dailyLogBotDataSchema.parse(data);
        
        // Create daily log
        const [newDailyLog] = await database
          .insert(dailyLogSchema)
          .values({
            projectId: logData.projectId,
            organizationId,
            title: logData.title,
            logDate: timestamp ? new Date(timestamp) : new Date(),
            weather: logData.weather,
            temperature: logData.temperature,
            workDescription: logData.workDescription,
            workHours: logData.workHours,
            workersCount: logData.workersCount,
            issues: logData.issues,
            notes: logData.notes,
            createdById: userId,
          })
          .returning();

        result = {
          type: 'daily_log_created',
          dailyLogId: newDailyLog.id,
          message: 'Daily log created successfully',
        };

        // TODO: Process photos if provided
        if (logData.photos && logData.photos.length > 0) {
          logger.info(`Processing ${logData.photos.length} photos for daily log ${newDailyLog.id}`);
          // Photo processing logic would go here
        }

        break;
      }

      case 'project_update': {
        const updateData = projectUpdateBotDataSchema.parse(data);
        
        // Update project
        const [updatedProject] = await database
          .update(projectSchema)
          .set({
            status: updateData.status,
            updatedAt: new Date(),
          })
          .where(
            projectSchema.id === updateData.projectId && 
            projectSchema.organizationId === organizationId
          )
          .returning();

        if (!updatedProject) {
          return NextResponse.json(
            { error: 'Project not found or access denied' },
            { status: 404 }
          );
        }

        result = {
          type: 'project_updated',
          projectId: updatedProject.id,
          message: 'Project updated successfully',
        };

        break;
      }

      case 'photo_upload': {
        // Handle photo upload from bot
        const { projectId, dailyLogId, photoUrls } = data;
        
        if (!projectId && !dailyLogId) {
          return NextResponse.json(
            { error: 'Project ID or Daily Log ID is required' },
            { status: 400 }
          );
        }

        // TODO: Process and save photos
        logger.info(`Processing photo upload for project ${projectId || 'N/A'}, daily log ${dailyLogId || 'N/A'}`);

        result = {
          type: 'photos_uploaded',
          message: 'Photos processed successfully',
          count: photoUrls?.length || 0,
        };

        break;
      }

      case 'status_update': {
        const { projectId, status, message } = data;
        
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }

        // Update project status
        const [updatedProject] = await database
          .update(projectSchema)
          .set({
            status,
            updatedAt: new Date(),
          })
          .where(
            projectSchema.id === projectId && 
            projectSchema.organizationId === organizationId
          )
          .returning();

        if (!updatedProject) {
          return NextResponse.json(
            { error: 'Project not found or access denied' },
            { status: 404 }
          );
        }

        result = {
          type: 'status_updated',
          projectId: updatedProject.id,
          newStatus: status,
          message: message || 'Status updated successfully',
        };

        break;
      }

      default:
        return NextResponse.json(
          { error: 'Unknown webhook type' },
          { status: 400 }
        );
    }

    logger.info(`Bot webhook processed successfully`, {
      source,
      type,
      result,
    });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error in bot webhook:', error.errors);
      return NextResponse.json(
        { error: 'Invalid webhook data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Error processing bot webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: 'POST /api/webhooks/bot',
      health: 'GET /api/webhooks/bot',
    },
    supportedTypes: ['daily_log', 'project_update', 'photo_upload', 'status_update'],
  });
}

