export interface WorkItem {
  id: number;
  projectId: number;
  taskId?: number;
  dailyLogId?: number;
  organizationId: string;
  workItemTitle: string;
  workItemDescription?: string;
  workItemType: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  assignedTo?: string;
  assignedBy?: string;
  workDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  estimatedWorkHours?: number;
  actualWorkHours?: number;
  constructionLocation?: string;
  weather?: string;
  laborCount: number;
  materials?: string[];
  equipment?: string[];
  notes?: string;
  createdById?: string;
  updatedById?: string;
  version: number;
  deletedAt?: Date;
  deletedById?: string;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export type WorkItemType = 
  | 'concrete_work'
  | 'steel_work'
  | 'masonry'
  | 'finishing'
  | 'mep_installation'
  | 'inspection'
  | 'safety_check'
  | 'excavation'
  | 'foundation'
  | 'roofing'
  | 'plumbing'
  | 'electrical'
  | 'painting'
  | 'landscaping'
  | 'cleanup'
  | 'other';

export type WorkItemStatus = 
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export type WorkItemPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface CreateWorkItemRequest {
  projectId: number;
  taskId?: number;
  dailyLogId?: number;
  workItemTitle: string;
  workItemDescription?: string;
  workItemType: WorkItemType;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assignedTo?: string;
  workDate?: string;
  dueDate?: string;
  estimatedWorkHours?: number;
  constructionLocation?: string;
  weather?: string;
  laborCount?: number;
  materials?: string[];
  equipment?: string[];
  notes?: string;
}

export interface UpdateWorkItemRequest {
  workItemTitle?: string;
  workItemDescription?: string;
  workItemType?: WorkItemType;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assignedTo?: string;
  workDate?: string;
  dueDate?: string;
  estimatedWorkHours?: number;
  actualWorkHours?: number;
  constructionLocation?: string;
  weather?: string;
  laborCount?: number;
  materials?: string[];
  equipment?: string[];
  notes?: string;
}

export interface WorkItemFilters {
  search?: string;
  workItemType?: WorkItemType;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assignedTo?: string;
  workDateFrom?: string;
  workDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface WorkItemStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  averageProgress: number;
}

// Work Item Templates for import
export interface WorkItemTemplate {
  id: string;
  name: string;
  description: string;
  workItems: Omit<CreateWorkItemRequest, 'projectId'>[];
}

export const WORK_ITEM_TYPE_LABELS: Record<WorkItemType, string> = {
  concrete_work: 'Công tác bê tông',
  steel_work: 'Công tác thép',
  masonry: 'Công tác xây',
  finishing: 'Công tác hoàn thiện',
  mep_installation: 'Lắp đặt MEP',
  inspection: 'Kiểm tra',
  safety_check: 'Kiểm tra an toàn',
  excavation: 'Đào đất',
  foundation: 'Móng',
  roofing: 'Lợp mái',
  plumbing: 'Cấp thoát nước',
  electrical: 'Điện',
  painting: 'Sơn',
  landscaping: 'Cảnh quan',
  cleanup: 'Dọn dẹp',
  other: 'Khác',
};

export const WORK_ITEM_STATUS_LABELS: Record<WorkItemStatus, string> = {
  planned: 'Lên kế hoạch',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Hủy bỏ',
  on_hold: 'Tạm dừng',
};

export const WORK_ITEM_PRIORITY_LABELS: Record<WorkItemPriority, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  urgent: 'Khẩn cấp',
};

export const WORK_ITEM_STATUS_COLORS: Record<WorkItemStatus, string> = {
  planned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  on_hold: 'bg-gray-100 text-gray-800',
};

export const WORK_ITEM_PRIORITY_COLORS: Record<WorkItemPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};