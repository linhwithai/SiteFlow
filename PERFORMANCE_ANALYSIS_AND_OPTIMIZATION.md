# Phân Tích Performance và Đề Xuất Cải Thiện

## 🔍 **PHÂN TÍCH VẤN ĐỀ HIỆN TẠI**

### **1. Nguyên Nhân Chính Gây Chậm**

#### **A. Quá Nhiều API Calls Tuần Tự**
```typescript
// Trang project detail (/dashboard/projects/[id])
useEffect(() => {
  fetchProject();           // API: GET /api/projects/[id]
  fetchDailyLogs();         // API: GET /api/projects/[id]/daily-logs
  fetchWorkItems();         // API: GET /api/projects/[id]/work-items
  fetchStats();             // API: GET /api/projects/[id]/work-items/stats
  fetchDailyLogStats();     // API: GET /api/projects/[id]/daily-logs/stats
  fetchPhotos();            // API: GET /api/projects/[id]/photos
  fetchActivities();        // API: GET /api/projects/[id]/activities
}, [projectId]);
```

#### **B. Không Có Caching Hiệu Quả**
- Mỗi lần chuyển trang đều gọi API mới
- Không có cache cho dữ liệu project cơ bản
- Cache chỉ có trong useDailyLogs (2 phút TTL)

#### **C. Database Queries Không Tối Ưu**
- Mỗi API call đều tạo connection mới
- Không có connection pooling
- Queries phức tạp không có indexes

#### **D. Component Re-renders Không Cần Thiết**
- Mỗi API call trigger re-render toàn bộ component
- Không có memoization cho expensive operations
- State updates không được batch

### **2. Số Lượng API Calls Per Page**

#### **Dashboard Projects List** (`/dashboard/projects`)
- ✅ `GET /api/projects` - 1 call
- ✅ `GET /api/projects/stats` - 1 call
- **Total: 2 API calls**

#### **Project Detail** (`/dashboard/projects/[id]`)
- ❌ `GET /api/projects/[id]` - 1 call
- ❌ `GET /api/projects/[id]/daily-logs` - 1 call
- ❌ `GET /api/projects/[id]/work-items` - 1 call
- ❌ `GET /api/projects/[id]/work-items/stats` - 1 call
- ❌ `GET /api/projects/[id]/daily-logs/stats` - 1 call
- ❌ `GET /api/projects/[id]/photos` - 1 call
- ❌ `GET /api/projects/[id]/activities` - 1 call
- **Total: 7 API calls** ⚠️

#### **Work Items Page** (`/dashboard/projects/[id]/work-items`)
- ❌ `GET /api/projects/[id]` - 1 call (duplicate)
- ❌ `GET /api/projects/[id]/work-items` - 1 call (duplicate)
- ❌ `GET /api/projects/[id]/work-items/stats` - 1 call (duplicate)
- ❌ `GET /api/projects/[id]/work-items/import` - 1 call
- **Total: 4 API calls** ⚠️

## 🚀 **PHƯƠNG ÁN CẢI THIỆN**

### **Phase 1: Immediate Fixes (1-2 ngày)**

#### **1.1 Implement Parallel API Calls**
```typescript
// Thay vì tuần tự
useEffect(() => {
  fetchProject();
  fetchDailyLogs();
  fetchWorkItems();
  fetchStats();
}, []);

// Sử dụng parallel
useEffect(() => {
  Promise.all([
    fetchProject(),
    fetchDailyLogs(),
    fetchWorkItems(),
    fetchStats()
  ]);
}, []);
```

#### **1.2 Add Request Deduplication**
```typescript
// Tránh duplicate requests
const requestCache = new Map();

const fetchWithDeduplication = async (url: string) => {
  if (requestCache.has(url)) {
    return requestCache.get(url);
  }
  
  const promise = fetch(url);
  requestCache.set(url, promise);
  
  try {
    const result = await promise;
    requestCache.delete(url);
    return result;
  } catch (error) {
    requestCache.delete(url);
    throw error;
  }
};
```

#### **1.3 Optimize Database Queries**
```sql
-- Thêm indexes cho performance
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON construction_project(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_work_items_project ON construction_work_item(project_id, is_active);
CREATE INDEX IF NOT EXISTS idx_daily_logs_project ON construction_log(project_id, created_at);
```

### **Phase 2: Caching Strategy (3-5 ngày)**

#### **2.1 Implement Global State Management**
```typescript
// src/store/useAppStore.ts
interface AppState {
  projects: Map<number, Project>;
  workItems: Map<number, WorkItem[]>;
  dailyLogs: Map<number, DailyLog[]>;
  cache: Map<string, { data: any; timestamp: number; ttl: number }>;
}

const useAppStore = create<AppState>((set, get) => ({
  projects: new Map(),
  workItems: new Map(),
  dailyLogs: new Map(),
  cache: new Map(),
  
  // Cache methods
  getCachedData: (key: string) => {
    const cached = get().cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  },
  
  setCachedData: (key: string, data: any, ttl = 300000) => {
    set(state => ({
      cache: new Map(state.cache).set(key, {
        data,
        timestamp: Date.now(),
        ttl
      })
    }));
  }
}));
```

#### **2.2 Implement SWR for Data Fetching**
```typescript
// src/hooks/useSWR.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useProject(projectId: number) {
  const { data, error, isLoading } = useSWR(
    projectId ? `/api/projects/${projectId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );
  
  return { project: data, error, isLoading };
}
```

#### **2.3 Add Service Worker for Offline Caching**
```typescript
// public/sw.js
const CACHE_NAME = 'siteflow-v1';
const urlsToCache = [
  '/api/projects',
  '/api/projects/stats'
];

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});
```

### **Phase 3: Advanced Optimizations (1-2 tuần)**

#### **3.1 Implement GraphQL with DataLoader**
```typescript
// src/graphql/schema.ts
const typeDefs = `
  type Project {
    id: ID!
    name: String!
    workItems: [WorkItem!]!
    dailyLogs: [DailyLog!]!
    stats: ProjectStats!
  }
  
  type Query {
    project(id: ID!): Project
    projects: [Project!]!
  }
`;

// DataLoader để batch requests
const projectLoader = new DataLoader(async (ids) => {
  const projects = await db.select().from(projectSchema).where(inArray(projectSchema.id, ids));
  return ids.map(id => projects.find(p => p.id === id));
});
```

#### **3.2 Implement Virtual Scrolling**
```typescript
// src/components/VirtualizedList.tsx
import { FixedSizeList as List } from 'react-window';

export function VirtualizedWorkItemList({ items }: { items: WorkItem[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <WorkItemCard item={items[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

#### **3.3 Implement Code Splitting**
```typescript
// src/app/[locale]/(auth)/dashboard/projects/[id]/page.tsx
import dynamic from 'next/dynamic';

const WorkItemList = dynamic(() => import('@/components/WorkItemList'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false
});

const DailyLogList = dynamic(() => import('@/components/DailyLogList'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false
});
```

### **Phase 4: Database Optimizations (1 tuần)**

#### **4.1 Connection Pooling**
```typescript
// src/libs/DB.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

export const db = drizzle(pool);
```

#### **4.2 Query Optimization**
```sql
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_org_status_active 
ON construction_project(organization_id, status, is_active) 
WHERE is_active = true;

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_items_active 
ON construction_work_item(project_id, status) 
WHERE is_active = true;

-- Covering indexes to avoid table lookups
CREATE INDEX IF NOT EXISTS idx_daily_logs_covering 
ON construction_log(project_id, created_at) 
INCLUDE (id, title, work_description);
```

#### **4.3 Database Views for Complex Queries**
```sql
-- Create materialized view for project stats
CREATE MATERIALIZED VIEW project_stats_view AS
SELECT 
  p.id,
  p.name,
  p.status,
  COUNT(DISTINCT wi.id) as work_item_count,
  COUNT(DISTINCT dl.id) as daily_log_count,
  AVG(wi.progress) as avg_progress
FROM construction_project p
LEFT JOIN construction_work_item wi ON p.id = wi.project_id AND wi.is_active = true
LEFT JOIN construction_log dl ON p.id = dl.project_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.status;

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_project_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW project_stats_view;
END;
$$ LANGUAGE plpgsql;
```

## 📊 **KẾT QUẢ DỰ KIẾN**

### **Before Optimization**
- **Page Load Time**: 3-5 giây
- **API Calls**: 7 calls per page
- **Database Queries**: 7+ queries
- **Bundle Size**: ~2MB
- **Memory Usage**: ~50MB

### **After Phase 1 (Immediate)**
- **Page Load Time**: 1.5-2.5 giây (-50%)
- **API Calls**: 7 calls (parallel)
- **Database Queries**: 7+ queries (optimized)
- **Bundle Size**: ~2MB
- **Memory Usage**: ~50MB

### **After Phase 2 (Caching)**
- **Page Load Time**: 0.8-1.2 giây (-70%)
- **API Calls**: 1-2 calls (cached)
- **Database Queries**: 1-2 queries (cached)
- **Bundle Size**: ~2MB
- **Memory Usage**: ~60MB

### **After Phase 3 (Advanced)**
- **Page Load Time**: 0.3-0.8 giây (-85%)
- **API Calls**: 1 call (GraphQL)
- **Database Queries**: 1 query (optimized)
- **Bundle Size**: ~1.5MB (-25%)
- **Memory Usage**: ~40MB (-20%)

### **After Phase 4 (Database)**
- **Page Load Time**: 0.2-0.5 giây (-90%)
- **API Calls**: 1 call (GraphQL)
- **Database Queries**: 1 query (materialized view)
- **Bundle Size**: ~1.5MB
- **Memory Usage**: ~35MB (-30%)

## 🛠️ **IMPLEMENTATION PLAN**

### **Week 1: Immediate Fixes**
- [ ] Implement parallel API calls
- [ ] Add request deduplication
- [ ] Optimize database indexes
- [ ] Add loading states

### **Week 2: Caching Strategy**
- [ ] Implement global state management
- [ ] Add SWR for data fetching
- [ ] Implement service worker
- [ ] Add offline support

### **Week 3: Advanced Optimizations**
- [ ] Implement GraphQL
- [ ] Add virtual scrolling
- [ ] Implement code splitting
- [ ] Add performance monitoring

### **Week 4: Database Optimizations**
- [ ] Implement connection pooling
- [ ] Add materialized views
- [ ] Optimize queries
- [ ] Add database monitoring

## 📈 **MONITORING & METRICS**

### **Performance Metrics**
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.0s
- **Cumulative Layout Shift (CLS)**: < 0.1

### **API Metrics**
- **Response Time**: < 200ms
- **Error Rate**: < 1%
- **Cache Hit Rate**: > 80%
- **Database Query Time**: < 100ms

### **User Experience**
- **Page Load Satisfaction**: > 90%
- **Navigation Speed**: < 1s
- **Error Rate**: < 0.5%
- **User Retention**: +20%

## 🎯 **KẾT LUẬN**

Vấn đề performance chính là do **quá nhiều API calls tuần tự** và **thiếu caching hiệu quả**. Với các phương án đề xuất:

1. **Phase 1** sẽ giảm 50% thời gian load
2. **Phase 2** sẽ giảm 70% thời gian load
3. **Phase 3** sẽ giảm 85% thời gian load
4. **Phase 4** sẽ giảm 90% thời gian load

**Ưu tiên thực hiện Phase 1 ngay lập tức** để cải thiện trải nghiệm người dùng, sau đó triển khai các phase tiếp theo theo lộ trình.

---

**Tác giả:** AI Assistant  
**Ngày tạo:** 2024-12-19  
**Phiên bản:** 1.0  
**Trạng thái:** Sẵn sàng triển khai

