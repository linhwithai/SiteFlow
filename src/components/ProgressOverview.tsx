'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';

interface Project {
  id: number;
  name: string;
  status: string;
  progress?: number;
}

interface ProgressOverviewProps {
  projects: Project[];
}

export function ProgressOverview({ projects }: ProgressOverviewProps) {
  const activeProjects = projects.filter(p => p.status === CONSTRUCTION_PROJECT_STATUS.ACTIVE);
  const totalProgress = activeProjects.length > 0 
    ? activeProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / activeProjects.length 
    : 0;

  const completedProjects = projects.filter(p => p.status === CONSTRUCTION_PROJECT_STATUS.COMPLETED).length;
  const totalProjects = projects.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tổng quan tiến độ</CardTitle>
        <CardDescription>
          Tiến độ trung bình của các dự án đang thực hiện
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tiến độ trung bình</span>
              <span className="text-sm font-bold">{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </div>

          {/* Project Statistics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-gray-500">Dự án đang thực hiện:</span>
              <span className="ml-2 font-medium text-blue-600">{activeProjects.length}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500">Hoàn thành:</span>
              <span className="ml-2 font-medium text-green-600">{completedProjects}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500">Tổng dự án:</span>
              <span className="ml-2 font-medium text-gray-600">{totalProjects}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500">Tỷ lệ hoàn thành:</span>
              <span className="ml-2 font-medium text-emerald-600">
                {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Progress by Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Phân bổ theo trạng thái</h4>
            <div className="space-y-2">
              {[
                { status: CONSTRUCTION_PROJECT_STATUS.ACTIVE, label: 'Đang thực hiện', color: 'bg-green-500' },
                { status: CONSTRUCTION_PROJECT_STATUS.COMPLETED, label: 'Hoàn thành', color: 'bg-gray-500' },
                { status: CONSTRUCTION_PROJECT_STATUS.PLANNING, label: 'Lập kế hoạch', color: 'bg-blue-500' },
                { status: CONSTRUCTION_PROJECT_STATUS.ON_HOLD, label: 'Tạm dừng', color: 'bg-yellow-500' },
                { status: CONSTRUCTION_PROJECT_STATUS.CANCELLED, label: 'Hủy bỏ', color: 'bg-red-500' },
              ].map(({ status, label, color }) => {
                const count = projects.filter(p => p.status === status).length;
                const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="text-gray-600">{label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{count}</span>
                      <span className="text-gray-400">({Math.round(percentage)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
