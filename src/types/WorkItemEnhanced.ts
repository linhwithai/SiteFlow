// ========================================
// ENHANCED WORK ITEM TYPES FOR CONSTRUCTION
// ========================================
// This file contains enhanced TypeScript interfaces for construction work items
// with comprehensive project management features

// ========================================
// 1. ENHANCED WORK ITEM INTERFACE
// ========================================

export interface WorkItemEnhanced {
  // Basic Information
  id: number;
  projectId: number;
  dailyLogId?: number;
  organizationId: string;
  
  // Work Item Basic Details
  workItemTitle: string;
  workItemDescription?: string;
  workItemType: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  
  // WBS (Work Breakdown Structure) Information
  phaseId?: number;
  subPhaseId?: number;
  workPackageId?: number;
  parentWorkItemId?: number;
  workItemLevel: number;
  workItemCode: string;
  
  // Assignment Information
  assignedTo?: string;
  assignedBy?: string;
  supervisorId?: string;
  foremanId?: string;
  crewMembers?: string[];
  
  // Scheduling Information
  workDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  startDate?: Date;
  endDate?: Date;
  
  // Time Tracking
  estimatedWorkHours?: number;
  actualWorkHours?: number;
  estimatedDurationDays?: number;
  actualDurationDays?: number;
  
  // Technical Information
  specification?: string;
  technicalRequirements?: string;
  qualityStandards?: string[];
  safetyRequirements?: string[];
  environmentalRequirements?: string[];
  buildingCode?: string;
  drawingNumber?: string;
  revisionNumber?: string;
  
  // Work Details
  constructionLocation?: string;
  weatherCondition?: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  weatherImpact?: string;
  
  // Resource Information
  laborCount: number;
  requiredSkills?: string[];
  certifications?: string[];
  materials?: string[];
  equipment?: string[];
  materialDetails?: MaterialDetail[];
  equipmentDetails?: EquipmentDetail[];
  
  // Cost and Budget Information
  estimatedCost?: number;
  actualCost?: number;
  budgetCode?: string;
  costCenter?: string;
  currency: string;
  laborCost?: number;
  materialCost?: number;
  equipmentCost?: number;
  overheadCost?: number;
  
  // Progress and KPI Information
  progress: number;
  physicalProgress?: number;
  financialProgress?: number;
  milestones?: Milestone[];
  kpis?: KPI[];
  performanceMetrics?: PerformanceMetric[];
  
  // Risk and Issue Management
  risks?: Risk[];
  issues?: Issue[];
  mitigationPlans?: string[];
  contingencyPlans?: string[];
  
  // Dependencies and Links
  dependencies?: Dependency[];
  predecessors?: number[];
  successors?: number[];
  criticalPath: boolean;
  floatDays?: number;
  
  // Quality and Inspection
  inspectionRequired: boolean;
  inspectionDate?: Date;
  inspectorId?: string;
  inspectionResult?: string;
  qualityChecklist?: QualityCheck[];
  approvalRequired: boolean;
  approverId?: string;
  approvalDate?: Date;
  approvalStatus?: string;
  
  // Safety Information
  safetyLevel: SafetyLevel;
  safetyEquipment?: string[];
  safetyProcedures?: string[];
  safetyIncidents?: SafetyIncident[];
  safetyTraining?: string[];
  
  // Regulatory Compliance
  regulatoryCompliance?: string[];
  permits?: Permit[];
  licenses?: License[];
  certifications?: Certification[];
  
  // Document Management
  documents?: Document[];
  photos?: Photo[];
  videos?: Video[];
  drawings?: Drawing[];
  specifications?: Specification[];
  
  // Additional Information
  notes?: string;
  tags?: string[];
  
  // ERP Audit Trail Fields
  createdById?: string;
  updatedById?: string;
  version: number;
  
  // ERP Soft Delete Fields
  deletedAt?: Date;
  deletedById?: string;
  
  // System Fields
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
}

// ========================================
// 2. SUPPORTING INTERFACES
// ========================================

export interface MaterialDetail {
  id: string;
  name: string;
  type: string;
  specification?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalCost?: number;
  supplier?: string;
  deliveryDate?: Date;
  quality?: string;
  batchNumber?: string;
  status: 'ordered' | 'delivered' | 'used' | 'wasted';
}

export interface EquipmentDetail {
  id: string;
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  quantity: number;
  unit: string;
  dailyRate?: number;
  totalCost?: number;
  availability: 'available' | 'unavailable' | 'maintenance';
  operatorId?: string;
  maintenanceDate?: Date;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'pending' | 'completed' | 'overdue';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface KPI {
  id: string;
  name: string;
  description?: string;
  targetValue: number;
  actualValue?: number;
  unit: string;
  measurementDate?: Date;
  status: 'pending' | 'achieved' | 'not_achieved';
}

export interface PerformanceMetric {
  id: string;
  name: string;
  description?: string;
  value: number;
  unit: string;
  measurementDate: Date;
  benchmark?: number;
  status: 'good' | 'average' | 'poor';
}

export interface Risk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigationPlan?: string;
  owner?: string;
  status: 'open' | 'mitigated' | 'closed';
  identifiedDate: Date;
  targetMitigationDate?: Date;
  actualMitigationDate?: Date;
}

export interface Issue {
  id: string;
  description: string;
  type: 'technical' | 'safety' | 'quality' | 'schedule' | 'cost' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  reportedBy?: string;
  reportedDate: Date;
  resolvedDate?: Date;
  resolution?: string;
}

export interface Dependency {
  id: string;
  predecessorId: number;
  successorId: number;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag: number; // in days
  description?: string;
}

export interface QualityCheck {
  id: string;
  description: string;
  standard: string;
  method: string;
  result?: 'pass' | 'fail' | 'pending';
  inspector?: string;
  date?: Date;
  notes?: string;
  photos?: string[];
}

export interface SafetyIncident {
  id: string;
  description: string;
  type: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reportedBy?: string;
  reportedDate: Date;
  resolvedDate?: Date;
  resolution?: string;
  photos?: string[];
}

export interface Permit {
  id: string;
  name: string;
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  renewalRequired: boolean;
  renewalDate?: Date;
}

export interface License {
  id: string;
  name: string;
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  holderId: string;
}

export interface Certification {
  id: string;
  name: string;
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  holderId: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedDate: Date;
  version: string;
  description?: string;
}

export interface Photo {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  takenBy: string;
  takenDate: Date;
  location?: string;
  description?: string;
  tags?: string[];
}

export interface Video {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  recordedBy: string;
  recordedDate: Date;
  location?: string;
  description?: string;
  tags?: string[];
}

export interface Drawing {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  version: string;
  revision: string;
  uploadedBy: string;
  uploadedDate: Date;
  description?: string;
  drawingNumber?: string;
}

export interface Specification {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  version: string;
  uploadedBy: string;
  uploadedDate: Date;
  description?: string;
  specificationNumber?: string;
}

// ========================================
// 3. ENHANCED ENUMS
// ========================================

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

export type SafetyLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

// ========================================
// 4. REQUEST/RESPONSE INTERFACES
// ========================================

export interface CreateWorkItemEnhancedRequest {
  projectId: number;
  dailyLogId?: number;
  workItemTitle: string;
  workItemDescription?: string;
  workItemType: WorkItemType;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  
  // WBS Information
  phaseId?: number;
  subPhaseId?: number;
  workPackageId?: number;
  parentWorkItemId?: number;
  workItemLevel?: number;
  workItemCode: string;
  
  // Assignment
  assignedTo?: string;
  supervisorId?: string;
  foremanId?: string;
  crewMembers?: string[];
  
  // Scheduling
  workDate?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  
  // Time Tracking
  estimatedWorkHours?: number;
  estimatedDurationDays?: number;
  
  // Technical Information
  specification?: string;
  technicalRequirements?: string;
  qualityStandards?: string[];
  safetyRequirements?: string[];
  environmentalRequirements?: string[];
  buildingCode?: string;
  drawingNumber?: string;
  revisionNumber?: string;
  
  // Work Details
  constructionLocation?: string;
  weatherCondition?: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  weatherImpact?: string;
  
  // Resources
  laborCount?: number;
  requiredSkills?: string[];
  certifications?: string[];
  materials?: string[];
  equipment?: string[];
  materialDetails?: MaterialDetail[];
  equipmentDetails?: EquipmentDetail[];
  
  // Cost and Budget
  estimatedCost?: number;
  budgetCode?: string;
  costCenter?: string;
  currency?: string;
  laborCost?: number;
  materialCost?: number;
  equipmentCost?: number;
  overheadCost?: number;
  
  // Progress
  progress?: number;
  physicalProgress?: number;
  financialProgress?: number;
  milestones?: Milestone[];
  kpis?: KPI[];
  performanceMetrics?: PerformanceMetric[];
  
  // Risk and Issue Management
  risks?: Risk[];
  issues?: Issue[];
  mitigationPlans?: string[];
  contingencyPlans?: string[];
  
  // Dependencies
  dependencies?: Dependency[];
  predecessors?: number[];
  successors?: number[];
  criticalPath?: boolean;
  floatDays?: number;
  
  // Quality and Inspection
  inspectionRequired?: boolean;
  inspectionDate?: string;
  inspectorId?: string;
  approvalRequired?: boolean;
  approverId?: string;
  
  // Safety
  safetyLevel?: SafetyLevel;
  safetyEquipment?: string[];
  safetyProcedures?: string[];
  safetyTraining?: string[];
  
  // Regulatory Compliance
  regulatoryCompliance?: string[];
  permits?: Permit[];
  licenses?: License[];
  certifications?: Certification[];
  
  // Additional Information
  notes?: string;
  tags?: string[];
}

export interface UpdateWorkItemEnhancedRequest {
  workItemTitle?: string;
  workItemDescription?: string;
  workItemType?: WorkItemType;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  
  // WBS Information
  phaseId?: number;
  subPhaseId?: number;
  workPackageId?: number;
  parentWorkItemId?: number;
  workItemLevel?: number;
  workItemCode?: string;
  
  // Assignment
  assignedTo?: string;
  supervisorId?: string;
  foremanId?: string;
  crewMembers?: string[];
  
  // Scheduling
  workDate?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  
  // Time Tracking
  estimatedWorkHours?: number;
  actualWorkHours?: number;
  estimatedDurationDays?: number;
  actualDurationDays?: number;
  
  // Technical Information
  specification?: string;
  technicalRequirements?: string;
  qualityStandards?: string[];
  safetyRequirements?: string[];
  environmentalRequirements?: string[];
  buildingCode?: string;
  drawingNumber?: string;
  revisionNumber?: string;
  
  // Work Details
  constructionLocation?: string;
  weatherCondition?: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  weatherImpact?: string;
  
  // Resources
  laborCount?: number;
  requiredSkills?: string[];
  certifications?: string[];
  materials?: string[];
  equipment?: string[];
  materialDetails?: MaterialDetail[];
  equipmentDetails?: EquipmentDetail[];
  
  // Cost and Budget
  estimatedCost?: number;
  actualCost?: number;
  budgetCode?: string;
  costCenter?: string;
  currency?: string;
  laborCost?: number;
  materialCost?: number;
  equipmentCost?: number;
  overheadCost?: number;
  
  // Progress
  progress?: number;
  physicalProgress?: number;
  financialProgress?: number;
  milestones?: Milestone[];
  kpis?: KPI[];
  performanceMetrics?: PerformanceMetric[];
  
  // Risk and Issue Management
  risks?: Risk[];
  issues?: Issue[];
  mitigationPlans?: string[];
  contingencyPlans?: string[];
  
  // Dependencies
  dependencies?: Dependency[];
  predecessors?: number[];
  successors?: number[];
  criticalPath?: boolean;
  floatDays?: number;
  
  // Quality and Inspection
  inspectionRequired?: boolean;
  inspectionDate?: string;
  inspectorId?: string;
  inspectionResult?: string;
  qualityChecklist?: QualityCheck[];
  approvalRequired?: boolean;
  approverId?: string;
  approvalDate?: string;
  approvalStatus?: string;
  
  // Safety
  safetyLevel?: SafetyLevel;
  safetyEquipment?: string[];
  safetyProcedures?: string[];
  safetyIncidents?: SafetyIncident[];
  safetyTraining?: string[];
  
  // Regulatory Compliance
  regulatoryCompliance?: string[];
  permits?: Permit[];
  licenses?: License[];
  certifications?: Certification[];
  
  // Document Management
  documents?: Document[];
  photos?: Photo[];
  videos?: Video[];
  drawings?: Drawing[];
  specifications?: Specification[];
  
  // Additional Information
  notes?: string;
  tags?: string[];
}

// ========================================
// 5. FILTER AND SEARCH INTERFACES
// ========================================

export interface WorkItemEnhancedFilters {
  search?: string;
  workItemType?: WorkItemType;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assignedTo?: string;
  supervisorId?: string;
  foremanId?: string;
  workDateFrom?: string;
  workDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  phaseId?: number;
  subPhaseId?: number;
  workPackageId?: number;
  workItemLevel?: number;
  criticalPath?: boolean;
  inspectionRequired?: boolean;
  approvalRequired?: boolean;
  safetyLevel?: SafetyLevel;
  progressFrom?: number;
  progressTo?: number;
  tags?: string[];
}

// ========================================
// 6. STATISTICS AND ANALYTICS INTERFACES
// ========================================

export interface WorkItemEnhancedStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  onHold: number;
  overdue: number;
  criticalPath: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  averageProgress: number;
  averagePhysicalProgress: number;
  averageFinancialProgress: number;
  byPhase: Record<string, number>;
  byPriority: Record<string, number>;
  bySafetyLevel: Record<string, number>;
  byWorkItemType: Record<string, number>;
}

// ========================================
// 7. LABELS AND COLORS
// ========================================

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

export const SAFETY_LEVEL_LABELS: Record<SafetyLevel, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  very_high: 'Rất cao',
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

export const SAFETY_LEVEL_COLORS: Record<SafetyLevel, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  very_high: 'bg-red-100 text-red-800',
};

