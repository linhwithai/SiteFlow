'use client';

import { Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Activity {
  id: string;
  description: string;
  timestamp: string;
  type: 'project' | 'work_item' | 'daily_log' | 'system';
  user?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
  maxItems?: number;
}

export function RecentActivities({ activities, maxItems = 5 }: RecentActivitiesProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
        <CardDescription>
          Các thay đổi và cập nhật mới nhất trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Chưa có hoạt động nào</p>
            </div>
          ) : (
            displayActivities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-400">bởi {activity.user}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}