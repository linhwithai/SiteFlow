'use client';

import { 
  Calendar, 
  CheckCircle, 
  FileText, 
  Plus, 
  User, 
  Clock,
  Building2,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type ActivityType = 'project_created' | 'project_completed' | 'task_created' | 'task_completed' | 'user_joined' | 'budget_updated' | 'deadline_approaching';

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  project?: {
    id: number;
    name: string;
  };
  metadata?: Record<string, any>;
};

type RecentActivitiesProps = {
  activities?: Activity[];
  maxItems?: number;
};

// Mock activities - sẽ được thay thế bằng API thực
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'project_completed',
    title: 'Dự án hoàn thành',
    description: 'Đã hoàn thành dự án "Tòa nhà văn phòng A"',
    timestamp: '2 phút trước',
    user: {
      name: 'Nguyễn Văn A',
      initials: 'NA'
    },
    project: {
      id: 1,
      name: 'Tòa nhà văn phòng A'
    }
  },
  {
    id: '2',
    type: 'task_created',
    title: 'Task mới được tạo',
    description: 'Tạo task "Kiểm tra hệ thống điện" trong dự án',
    timestamp: '15 phút trước',
    user: {
      name: 'Trần Thị B',
      initials: 'TB'
    },
    project: {
      id: 2,
      name: 'Cải tạo nhà xưởng'
    }
  },
  {
    id: '3',
    type: 'user_joined',
    title: 'Thành viên mới',
    description: 'Lê Văn C đã tham gia team dự án',
    timestamp: '1 giờ trước',
    user: {
      name: 'Lê Văn C',
      initials: 'LC'
    }
  },
  {
    id: '4',
    type: 'budget_updated',
    title: 'Cập nhật ngân sách',
    description: 'Ngân sách dự án được tăng lên 2.5 tỷ VND',
    timestamp: '2 giờ trước',
    user: {
      name: 'Phạm Thị D',
      initials: 'PD'
    },
    project: {
      id: 3,
      name: 'Xây dựng trường học'
    }
  },
  {
    id: '5',
    type: 'deadline_approaching',
    title: 'Deadline sắp tới',
    description: 'Dự án "Cầu đường mới" có deadline trong 3 ngày',
    timestamp: '3 giờ trước',
    user: {
      name: 'Hệ thống',
      initials: 'HS'
    },
    project: {
      id: 4,
      name: 'Cầu đường mới'
    }
  },
  {
    id: '6',
    type: 'project_created',
    title: 'Dự án mới',
    description: 'Tạo dự án "Khu dân cư cao cấp"',
    timestamp: '1 ngày trước',
    user: {
      name: 'Vũ Văn E',
      initials: 'VE'
    },
    project: {
      id: 5,
      name: 'Khu dân cư cao cấp'
    }
  }
];

const activityIcons = {
  project_created: Plus,
  project_completed: CheckCircle,
  task_created: FileText,
  task_completed: CheckCircle,
  user_joined: User,
  budget_updated: DollarSign,
  deadline_approaching: Calendar,
};

const activityColors = {
  project_created: 'text-blue-600 bg-blue-100',
  project_completed: 'text-green-600 bg-green-100',
  task_created: 'text-purple-600 bg-purple-100',
  task_completed: 'text-green-600 bg-green-100',
  user_joined: 'text-orange-600 bg-orange-100',
  budget_updated: 'text-yellow-600 bg-yellow-100',
  deadline_approaching: 'text-red-600 bg-red-100',
};

export function RecentActivities({ 
  activities = mockActivities, 
  maxItems = 5 
}: RecentActivitiesProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          Hoạt động gần đây
        </CardTitle>
        <CardDescription>
          Các hoạt động mới nhất trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có hoạt động nào</p>
          </div>
        ) : (
          displayActivities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            const content = (
              <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                      {activity.project && (
                        <Link 
                          href={`/dashboard/projects/${activity.project.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                        >
                          {activity.project.name}
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {activity.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="size-6">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">{activity.user.name}</span>
                  </div>
                </div>
              </div>
            );

            return (
              <div key={activity.id}>
                {content}
                {index < displayActivities.length - 1 && <Separator />}
              </div>
            );
          })
        )}
        
        {activities.length > maxItems && (
          <>
            <Separator />
            <div className="text-center">
              <Link 
                href="/dashboard/activities"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Xem tất cả hoạt động ({activities.length})
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

