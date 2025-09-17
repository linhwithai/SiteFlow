'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Filter,
  Download
} from 'lucide-react';
// Simple Gantt Chart component for work items

interface WorkItemForGantt {
  id: number;
  workItemTitle: string;
  status: string;
  priority: string;
  assignedTo?: string;
  startDate?: Date;
  endDate?: Date;
  progress: number;
  criticalPath: boolean;
}

interface MilestoneForGantt {
  id: number;
  milestoneName: string;
  targetDate: Date;
  status: string;
  importance: string;
}

interface GanttChartProps {
  workItems: WorkItemForGantt[];
  milestones: MilestoneForGantt[];
  startDate: Date;
  endDate: Date;
  onItemUpdate?: (item: WorkItemForGantt) => void;
  onItemMove?: (item: WorkItemForGantt, newStart: Date, newEnd: Date) => void;
  onMilestoneUpdate?: (milestone: MilestoneForGantt) => void;
}

export function GanttChart({
  workItems,
  milestones,
  startDate,
  endDate,
  onItemUpdate,
  onItemMove,
  onMilestoneUpdate
}: GanttChartProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDependencies, setShowDependencies] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(true);

  // Calculate timeline data
  const timelineData = useMemo(() => {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const days = [];
    
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, [startDate, endDate]);

  // Get status color
  const getStatusColor = (status: string, criticalPath: boolean) => {
    if (criticalPath) return 'bg-red-500';
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'planned': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Calculate item position and width
  const getItemStyle = (item: WorkItemForGantt) => {
    if (!item.startDate || !item.endDate) return {};
    
    const startOffset = Math.max(0, (item.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = (item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  // Filter work items based on current view
  const filteredWorkItems = useMemo(() => {
    return workItems.filter(item => {
      if (showCriticalPath && !item.criticalPath) return false;
      return true;
    });
  }, [workItems, showCriticalPath]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bảng Tiến Độ Dự Án
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Ngày
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Tuần
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Tháng
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Thời gian: {formatDate(startDate)} - {formatDate(endDate)}</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showDependencies}
                  onChange={(e) => setShowDependencies(e.target.checked)}
                  className="rounded"
                />
                Hiển thị phụ thuộc
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCriticalPath}
                  onChange={(e) => setShowCriticalPath(e.target.checked)}
                  className="rounded"
                />
                Đường găng
              </label>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="space-y-2">
          {filteredWorkItems.map((item) => (
            <div key={item.id} className="relative">
              <div className="flex items-center gap-4 py-2">
                {/* Work Item Info */}
                <div className="w-64 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{item.workItemTitle}</h4>
                    {item.criticalPath && (
                      <Badge variant="destructive" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        Găng
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getPriorityColor(item.priority)} variant="secondary">
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {item.assignedTo || 'Chưa phân công'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 relative">
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    {/* Timeline Grid */}
                    <div className="absolute inset-0 flex">
                      {timelineData.map((date, index) => (
                        <div
                          key={index}
                          className="flex-1 border-r border-gray-200"
                          style={{ minWidth: '20px' }}
                        />
                      ))}
                    </div>

                    {/* Work Item Bar */}
                    {item.startDate && item.endDate && (
                      <div
                        className={`absolute top-1 h-6 rounded ${getStatusColor(item.status, item.criticalPath)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                        style={getItemStyle(item)}
                        onClick={() => onItemUpdate?.(item)}
                      >
                        <div className="flex items-center justify-between px-2 h-full text-white text-xs">
                          <span className="truncate">{item.workItemTitle}</span>
                          <span>{item.progress}%</span>
                        </div>
                      </div>
                    )}

                    {/* Progress Indicator */}
                    {item.startDate && item.endDate && (
                      <div
                        className={`absolute top-1 h-6 rounded-l ${getStatusColor(item.status, item.criticalPath)} opacity-60`}
                        style={{
                          ...getItemStyle(item),
                          width: `${(getItemStyle(item).width as string).replace('%', '') * item.progress / 100}%`
                        }}
                      />
                    )}

                    {/* Current Date Line */}
                    <div
                      className="absolute top-0 h-8 w-0.5 bg-red-500 z-10"
                      style={{
                        left: `${((currentDate.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100}%`
                      }}
                    />
                  </div>

                  {/* Date Labels */}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{item.startDate ? formatDate(item.startDate) : 'Chưa xác định'}</span>
                    <span>{item.endDate ? formatDate(item.endDate) : 'Chưa xác định'}</span>
                  </div>
                </div>

                {/* Progress Percentage */}
                <div className="w-20 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.progress}%</div>
                    <Progress value={item.progress} className="h-2 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Các Mốc Quan Trọng</h3>
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-4 py-2">
                  <div className="w-64 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{milestone.milestoneName}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">
                      {formatDate(milestone.targetDate)}
                    </div>
                  </div>
                  <div className="w-20 flex-shrink-0">
                    <Badge
                      className={
                        milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                        milestone.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {milestone.status === 'completed' ? 'Hoàn thành' :
                       milestone.status === 'overdue' ? 'Quá hạn' :
                       'Chờ thực hiện'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Hoàn thành</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Đang thực hiện</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span>Lên kế hoạch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Đường găng</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
