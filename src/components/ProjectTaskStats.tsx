'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  PlayCircle,
  // XCircle,
  TrendingUp,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ProjectTaskStats as TaskStats } from '@/types/Project';

type ProjectTaskStatsProps = {
  stats: TaskStats | null;
  loading?: boolean;
};

export function ProjectTaskStats({ stats, loading = false }: ProjectTaskStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-8 w-1/2 rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No statistics available</p>
        </CardContent>
      </Card>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  // const overdueRate = stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CheckCircle className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <PlayCircle className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="size-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Time Tracking */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Overall Completion</span>
                <span>
                  {completionRate}
                  %
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Average Progress</span>
                <span>
                  {stats.averageProgress}
                  %
                </span>
              </div>
              <Progress value={stats.averageProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated Hours</span>
              <span className="font-semibold">
                {stats.totalEstimatedHours}
                h
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actual Hours</span>
              <span className="font-semibold">
                {stats.totalActualHours}
                h
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Efficiency</span>
              <span className={`font-semibold ${
                stats.totalEstimatedHours > 0 && stats.totalActualHours > 0
                  ? stats.totalActualHours <= stats.totalEstimatedHours
                    ? 'text-green-600'
                    : 'text-red-600'
                  : 'text-gray-600'
              }`}
              >
                {stats.totalEstimatedHours > 0 && stats.totalActualHours > 0
                  ? `${Math.round((stats.totalEstimatedHours / stats.totalActualHours) * 100)}%`
                  : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-gray-400"></div>
                <span className="text-sm">To Do</span>
              </div>
              <span className="font-semibold">{stats.todo}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">In Progress</span>
              </div>
              <span className="font-semibold">{stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Review</span>
              </div>
              <span className="font-semibold">{stats.review}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Completed</span>
              </div>
              <span className="font-semibold">{stats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Cancelled</span>
              </div>
              <span className="font-semibold">{stats.cancelled}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Priority & Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Priority</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Urgent</span>
                  <span>{stats.priorityStats?.urgent || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High</span>
                  <span>{stats.priorityStats?.high || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium</span>
                  <span>{stats.priorityStats?.medium || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <span>{stats.priorityStats?.low || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Type</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Construction</span>
                  <span>{stats.typeStats?.construction || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inspection</span>
                  <span>{stats.typeStats?.inspection || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Maintenance</span>
                  <span>{stats.typeStats?.maintenance || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Safety</span>
                  <span>{stats.typeStats?.safety || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quality</span>
                  <span>{stats.typeStats?.quality || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Administrative</span>
                  <span>{stats.typeStats?.administrative || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Other</span>
                  <span>{stats.typeStats?.other || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
