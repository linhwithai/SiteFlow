// ========================================
// PROGRESS TRACKING TYPES FOR CONSTRUCTION
// ========================================
// This file contains TypeScript interfaces for progress tracking
// with Gantt chart, critical path, and milestone management

// ========================================
// 1. ENHANCED WORK ITEM WITH PROGRESS TRACKING
// ========================================

export interface WorkItemWithProgress {
  // Basic Information
  id: number;
  projectId: number;
  organizationId: string;
  workItemTitle: string;
  workItemDescription?: string;
  workItemType: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  
  // Assignment
  assignedTo?: string;
  assignedBy?: string;
  
  // Enhanced Scheduling
  startDate?: Date;
  endDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  duration: number; // in days
  actualDuration?: number; // in days
  bufferDays: number;
  
  // Progress Tracking
  progress: number; // 0-100
  physicalProgress?: number; // 0-100
  financialProgress?: number; // 0-100
  
  // Critical Path Analysis
  criticalPath: boolean;
  floatDays: number;
  lagDays: number;
  
  // Cost Tracking
  estimatedCost?: number;
  actualCost?: number;
  budgetCode?: string;
  costCenter?: string;
  
  // Baseline
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  baselineDuration?: number;
  
  // Work Details
  constructionLocation?: string;
  weather?: string;
  laborCount: number;
  materials?: string[];
  equipment?: string[];
  notes?: string;
  
  // Audit Trail
  createdById?: string;
  updatedById?: string;
  version: number;
  deletedAt?: Date;
  deletedById?: string;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
}

// ========================================
// 2. DEPENDENCY MANAGEMENT
// ========================================

export interface WorkItemDependency {
  id: number;
  projectId: number;
  organizationId: string;
  predecessorId: number;
  successorId: number;
  dependencyType: DependencyType;
  lagDays: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DependencyType = 
  | 'finish_to_start'  // FS: Predecessor must finish before successor starts
  | 'start_to_start'   // SS: Both must start at the same time
  | 'finish_to_finish' // FF: Both must finish at the same time
  | 'start_to_finish'; // SF: Successor must finish before predecessor starts

export interface DependencyInfo {
  predecessor: WorkItemWithProgress;
  successor: WorkItemWithProgress;
  dependency: WorkItemDependency;
}

// ========================================
// 3. MILESTONE MANAGEMENT
// ========================================

export interface WorkItemMilestone {
  id: number;
  workItemId: number;
  projectId: number;
  organizationId: string;
  milestoneName: string;
  milestoneDescription?: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  importance: MilestoneImportance;
  completionPercentage: number; // 0-100
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MilestoneStatus = 
  | 'pending'
  | 'completed'
  | 'overdue'
  | 'cancelled';

export type MilestoneImportance = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

// ========================================
// 4. BASELINE MANAGEMENT
// ========================================

export interface WorkItemBaseline {
  id: number;
  workItemId: number;
  projectId: number;
  organizationId: string;
  baselineName: string;
  baselineVersion: number;
  baselineStartDate: Date;
  baselineEndDate: Date;
  baselineDuration: number;
  baselineCost?: number;
  baselineNotes?: string;
  createdById?: string;
  createdAt: Date;
}

// ========================================
// 5. RISK MANAGEMENT
// ========================================

export interface WorkItemRisk {
  id: number;
  workItemId: number;
  projectId: number;
  organizationId: string;
  riskName: string;
  riskDescription?: string;
  riskCategory: RiskCategory;
  probability: RiskProbability;
  impact: RiskImpact;
  severity: RiskSeverity;
  status: RiskStatus;
  mitigationPlan?: string;
  contingencyPlan?: string;
  ownerId?: string;
  identifiedDate: Date;
  targetMitigationDate?: Date;
  actualMitigationDate?: Date;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RiskCategory = 
  | 'technical'
  | 'financial'
  | 'schedule'
  | 'resource'
  | 'external';

export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'open' | 'mitigated' | 'closed' | 'accepted';

// ========================================
// 6. ISSUE MANAGEMENT
// ========================================

export interface WorkItemIssue {
  id: number;
  workItemId: number;
  projectId: number;
  organizationId: string;
  issueTitle: string;
  issueDescription?: string;
  issueType: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  assignedToId?: string;
  reportedById?: string;
  reportedDate: Date;
  resolvedDate?: Date;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IssueType = 
  | 'technical'
  | 'safety'
  | 'quality'
  | 'schedule'
  | 'cost'
  | 'resource';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// ========================================
// 7. RESOURCE ALLOCATION
// ========================================

export interface WorkItemResourceAllocation {
  id: number;
  workItemId: number;
  projectId: number;
  organizationId: string;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  allocatedQuantity: number;
  allocatedUnit: string;
  startDate?: Date;
  endDate?: Date;
  costPerUnit?: number;
  totalCost?: number;
  status: ResourceStatus;
  notes?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ResourceType = 'human' | 'equipment' | 'material' | 'external';
export type ResourceStatus = 'allocated' | 'active' | 'completed' | 'cancelled';

// ========================================
// 8. GANTT CHART TYPES
// ========================================

export interface GanttItem {
  id: number;
  title: string;
  start: Date;
  end: Date;
  progress: number;
  criticalPath: boolean;
  dependencies: number[];
  color?: string;
  type: 'work_item' | 'milestone';
}

export interface GanttChartProps {
  workItems: WorkItemWithProgress[];
  milestones: WorkItemMilestone[];
  dependencies: WorkItemDependency[];
  startDate: Date;
  endDate: Date;
  viewMode: GanttViewMode;
  showDependencies: boolean;
  showCriticalPath: boolean;
  onItemUpdate: (item: WorkItemWithProgress) => void;
  onItemMove: (item: WorkItemWithProgress, newStart: Date, newEnd: Date) => void;
  onMilestoneUpdate: (milestone: WorkItemMilestone) => void;
}

export type GanttViewMode = 'day' | 'week' | 'month' | 'quarter' | 'year';

// ========================================
// 9. CRITICAL PATH ANALYSIS
// ========================================

export interface CriticalPathAnalysis {
  workItemId: number;
  workItemTitle: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  floatDays: number;
  isCritical: boolean;
  predecessors: number[];
  successors: number[];
}

export interface CriticalPathResult {
  projectId: number;
  projectName: string;
  criticalPathItems: CriticalPathAnalysis[];
  totalDuration: number;
  criticalPathDuration: number;
  calculatedAt: Date;
}

// ========================================
// 10. PROGRESS TRACKING DASHBOARD
// ========================================

export interface ProgressStats {
  totalWorkItems: number;
  completedWorkItems: number;
  inProgressWorkItems: number;
  plannedWorkItems: number;
  overdueWorkItems: number;
  averageProgress: number;
  criticalPathItems: number;
  totalMilestones: number;
  completedMilestones: number;
  overdueMilestones: number;
  totalRisks: number;
  openRisks: number;
  highRisks: number;
  totalIssues: number;
  openIssues: number;
  criticalIssues: number;
}

export interface ProgressDashboardProps {
  project: Project;
  workItems: WorkItemWithProgress[];
  milestones: WorkItemMilestone[];
  risks: WorkItemRisk[];
  issues: WorkItemIssue[];
  stats: ProgressStats;
  onFilterChange: (filters: ProgressFilters) => void;
  onExport: (format: ExportFormat) => void;
  onRefresh: () => void;
}

// ========================================
// 11. FILTERS AND SEARCH
// ========================================

export interface ProgressFilters {
  search?: string;
  status?: WorkItemStatus[];
  priority?: WorkItemPriority[];
  workItemType?: string[];
  assignedTo?: string[];
  criticalPath?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  progressRange?: {
    min: number;
    max: number;
  };
  milestoneStatus?: MilestoneStatus[];
  riskSeverity?: RiskSeverity[];
  issueSeverity?: IssueSeverity[];
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

// ========================================
// 12. API REQUEST/RESPONSE TYPES
// ========================================

export interface CreateWorkItemDependencyRequest {
  projectId: number;
  predecessorId: number;
  successorId: number;
  dependencyType: DependencyType;
  lagDays?: number;
  description?: string;
}

export interface UpdateWorkItemDependencyRequest {
  dependencyType?: DependencyType;
  lagDays?: number;
  description?: string;
}

export interface CreateMilestoneRequest {
  workItemId: number;
  projectId: number;
  milestoneName: string;
  milestoneDescription?: string;
  targetDate: string;
  importance?: MilestoneImportance;
}

export interface UpdateMilestoneRequest {
  milestoneName?: string;
  milestoneDescription?: string;
  targetDate?: string;
  actualDate?: string;
  status?: MilestoneStatus;
  importance?: MilestoneImportance;
  completionPercentage?: number;
}

export interface CreateRiskRequest {
  workItemId: number;
  projectId: number;
  riskName: string;
  riskDescription?: string;
  riskCategory: RiskCategory;
  probability: RiskProbability;
  impact: RiskImpact;
  mitigationPlan?: string;
  contingencyPlan?: string;
  ownerId?: string;
  targetMitigationDate?: string;
}

export interface UpdateRiskRequest {
  riskName?: string;
  riskDescription?: string;
  riskCategory?: RiskCategory;
  probability?: RiskProbability;
  impact?: RiskImpact;
  severity?: RiskSeverity;
  status?: RiskStatus;
  mitigationPlan?: string;
  contingencyPlan?: string;
  ownerId?: string;
  targetMitigationDate?: string;
  actualMitigationDate?: string;
}

export interface CreateIssueRequest {
  workItemId: number;
  projectId: number;
  issueTitle: string;
  issueDescription?: string;
  issueType: IssueType;
  severity: IssueSeverity;
  assignedToId?: string;
}

export interface UpdateIssueRequest {
  issueTitle?: string;
  issueDescription?: string;
  issueType?: IssueType;
  severity?: IssueSeverity;
  status?: IssueStatus;
  assignedToId?: string;
  resolution?: string;
}

// ========================================
// 13. LABELS AND COLORS
// ========================================

export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  finish_to_start: 'Kết thúc → Bắt đầu',
  start_to_start: 'Bắt đầu → Bắt đầu',
  finish_to_finish: 'Kết thúc → Kết thúc',
  start_to_finish: 'Bắt đầu → Kết thúc',
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending: 'Chờ thực hiện',
  completed: 'Hoàn thành',
  overdue: 'Quá hạn',
  cancelled: 'Hủy bỏ',
};

export const MILESTONE_IMPORTANCE_LABELS: Record<MilestoneImportance, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Quan trọng',
};

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  technical: 'Kỹ thuật',
  financial: 'Tài chính',
  schedule: 'Tiến độ',
  resource: 'Tài nguyên',
  external: 'Bên ngoài',
};

export const RISK_PROBABILITY_LABELS: Record<RiskProbability, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};

export const RISK_IMPACT_LABELS: Record<RiskImpact, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};

export const RISK_SEVERITY_LABELS: Record<RiskSeverity, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Nghiêm trọng',
};

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  open: 'Mở',
  mitigated: 'Đã giảm thiểu',
  closed: 'Đóng',
  accepted: 'Chấp nhận',
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  technical: 'Kỹ thuật',
  safety: 'An toàn',
  quality: 'Chất lượng',
  schedule: 'Tiến độ',
  cost: 'Chi phí',
  resource: 'Tài nguyên',
};

export const ISSUE_SEVERITY_LABELS: Record<IssueSeverity, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Nghiêm trọng',
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Mở',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đóng',
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  human: 'Nhân lực',
  equipment: 'Thiết bị',
  material: 'Vật liệu',
  external: 'Bên ngoài',
};

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  allocated: 'Đã phân bổ',
  active: 'Đang hoạt động',
  completed: 'Hoàn thành',
  cancelled: 'Hủy bỏ',
};

// ========================================
// 14. COLOR SCHEMES
// ========================================

export const DEPENDENCY_TYPE_COLORS: Record<DependencyType, string> = {
  finish_to_start: 'text-blue-600',
  start_to_start: 'text-green-600',
  finish_to_finish: 'text-orange-600',
  start_to_finish: 'text-red-600',
};

export const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const MILESTONE_IMPORTANCE_COLORS: Record<MilestoneImportance, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const RISK_SEVERITY_COLORS: Record<RiskSeverity, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const ISSUE_SEVERITY_COLORS: Record<IssueSeverity, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const RESOURCE_STATUS_COLORS: Record<ResourceStatus, string> = {
  allocated: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

