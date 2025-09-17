export type EnumValues<Type> = Type[keyof Type];

export const CONSTRUCTION_PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const CONSTRUCTION_TASK_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const CONSTRUCTION_TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const CONSTRUCTION_TASK_TYPE = {
  FOUNDATION: 'FOUNDATION',           // Móng
  STRUCTURE: 'STRUCTURE',             // Kết cấu
  FINISHING: 'FINISHING',             // Hoàn thiện
  MEP: 'MEP',                         // Cơ điện
  INSPECTION: 'INSPECTION',           // Kiểm tra
  SAFETY: 'SAFETY',                   // An toàn
  QUALITY: 'QUALITY',                 // Chất lượng
  ADMINISTRATIVE: 'ADMINISTRATIVE',   // Hành chính
} as const;

export const CONSTRUCTION_WORK_ITEM_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const CONSTRUCTION_WORK_ITEM_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const CONSTRUCTION_WORK_ITEM_TYPE = {
  CONCRETE_WORK: 'CONCRETE_WORK',         // Công tác bê tông
  STEEL_WORK: 'STEEL_WORK',               // Công tác thép
  MASONRY: 'MASONRY',                     // Công tác xây
  FINISHING: 'FINISHING',                 // Công tác hoàn thiện
  MEP_INSTALLATION: 'MEP_INSTALLATION',   // Lắp đặt cơ điện
  INSPECTION: 'INSPECTION',               // Kiểm tra
  SAFETY_CHECK: 'SAFETY_CHECK',           // Kiểm tra an toàn
} as const;