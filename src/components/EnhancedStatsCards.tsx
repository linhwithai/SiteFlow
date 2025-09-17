'use client';

import { AlertCircle, Building2, CheckCircle, Clock, DollarSign, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ProjectStats = {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  cancelled: number;
  planning: number;
  totalBudget: number;
  averageBudget: number;
};

type EnhancedStatsCardsProps = {
  stats: ProjectStats | null;
  isLoading?: boolean;
};

// Mock data for charts - sẽ được thay thế bằng API thực
const projectTrendData = [
  { month: 'T1', projects: 12, completed: 8 },
  { month: 'T2', projects: 15, completed: 10 },
  { month: 'T3', projects: 18, completed: 12 },
  { month: 'T4', projects: 22, completed: 15 },
  { month: 'T5', projects: 25, completed: 18 },
  { month: 'T6', projects: 28, completed: 20 },
];

const budgetData = [
  { name: 'Đã sử dụng', value: 65, color: '#ef4444' },
  { name: 'Còn lại', value: 35, color: '#22c55e' },
];

export function EnhancedStatsCards({ stats, isLoading = false }: EnhancedStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  // Calculate trends (mock data - sẽ được thay thế bằng API thực)
  const totalTrend = 12.5; // +12.5%
  const completedTrend = 8.3; // +8.3%
  const activeTrend = -2.1; // -2.1%
  const budgetTrend = 15.2; // +15.2%

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng dự án</p>
                <p className="text-3xl font-bold">{stats.total}</p>
                <div className="flex items-center text-xs mt-2">
                  {totalTrend > 0 ? (
                    <TrendingUp className="mr-1 size-3 text-green-600" />
                  ) : (
                    <TrendingDown className="mr-1 size-3 text-red-600" />
                  )}
                  <span className={totalTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(totalTrend)}% tháng này
                  </span>
                </div>
              </div>
              <Building2 className="size-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Completed Projects */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-3xl font-bold">{stats.completed}</p>
                <div className="flex items-center text-xs mt-2">
                  <TrendingUp className="mr-1 size-3 text-green-600" />
                  <span className="text-green-600">
                    {completedTrend}% tháng này
                  </span>
                </div>
              </div>
              <CheckCircle className="size-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang thực hiện</p>
                <p className="text-3xl font-bold">{stats.active}</p>
                <div className="flex items-center text-xs mt-2">
                  <TrendingDown className="mr-1 size-3 text-orange-600" />
                  <span className="text-orange-600">
                    {Math.abs(activeTrend)}% tháng này
                  </span>
                </div>
              </div>
              <Clock className="size-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng ngân sách</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact',
                  }).format(stats.totalBudget)}
                </p>
                <div className="flex items-center text-xs mt-2">
                  <TrendingUp className="mr-1 size-3 text-purple-600" />
                  <span className="text-purple-600">
                    {budgetTrend}% tháng này
                  </span>
                </div>
              </div>
              <DollarSign className="size-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Project Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng dự án</CardTitle>
            <CardDescription>
              Số lượng dự án mới và hoàn thành theo tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projectTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="projects"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Dự án mới"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="2"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.6}
                  name="Hoàn thành"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ trạng thái dự án</CardTitle>
            <CardDescription>
              Tỷ lệ các dự án theo trạng thái hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Bars */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Hoàn thành</span>
                  </div>
                  <span className="text-sm font-medium">{stats.completed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Đang thực hiện</span>
                  </div>
                  <span className="text-sm font-medium">{stats.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(stats.active / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Tạm dừng</span>
                  </div>
                  <span className="text-sm font-medium">{stats.onHold}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(stats.onHold / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Lập kế hoạch</span>
                  </div>
                  <span className="text-sm font-medium">{stats.planning}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(stats.planning / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

