# 🤖 CURSOR AI SETUP INSTRUCTIONS

## 📋 **QUICK CONTEXT FOR CURSOR AI**

Khi bạn clone project này từ GitHub, hãy đọc các file này để hiểu context:

1. **`CURSOR_AI_CONTEXT_GUIDE.md`** - Complete project context và architecture
2. **`DEVELOPMENT_STATUS.md`** - Current development status và next steps
3. **`ERP_COMPATIBILITY_UPGRADE.md`** - Detailed upgrade documentation

## 🎯 **CURRENT PROJECT STATUS**

**SiteFlow** là một SaaS platform quản lý dự án xây dựng đang được phát triển thành ERP system.

### **Current Phase**: MVP → ERP Transition (COMPLETED)
- ✅ **ERP Readiness Score**: 8.8/10
- ✅ **Database**: Enhanced với audit trail và ERP tables
- ✅ **API**: Versioned với rate limiting và caching
- ✅ **Frontend**: Zustand state management và error boundaries

### **Next Phase**: ERP Module Development (IN PROGRESS)
- 🔄 Financial Module UI
- 🔄 HR Module UI  
- 🔄 Supply Chain Module UI

## 🚀 **QUICK START COMMANDS**

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Configure database, Clerk, Cloudinary credentials

# 3. Setup database
npm run db:migrate
npm run db:seed

# 4. Start development
npm run dev

# 5. Open Drizzle Studio
npm run db:studio
```

## 🗄️ **DATABASE ARCHITECTURE**

### **MVP Tables:**
- `organization` - Multi-tenant organizations
- `project` - Construction projects  
- `daily_log` - Daily construction logs
- `project_photo` - Photos and documents
- `project_task` - Project tasks

### **ERP Tables (NEW):**
- `financial_account` - Chart of accounts
- `financial_transaction` - Financial transactions
- `employee` - Employee management
- `supplier` - Supplier management
- `inventory_item` - Inventory management

### **ERP Features:**
- **Audit Trail**: `created_by_id`, `updated_by_id`, `version` on all tables
- **Soft Delete**: `deleted_at`, `deleted_by_id` on all tables
- **Multi-tenancy**: All tables have `organization_id`

## 🔧 **KEY ARCHITECTURE PATTERNS**

### **API Response Format:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    version: string;
    timestamp: string;
    pagination?: PaginationMeta;
  };
}
```

### **State Management (Zustand):**
```typescript
// Global store với ERP modules
const useAppStore = create<AppState>((set, get) => ({
  // Core data
  user: null,
  organization: null,
  projects: [],
  
  // ERP modules
  financialAccounts: [],
  financialTransactions: [],
  employees: [],
  suppliers: [],
  inventoryItems: [],
  
  // Actions
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set(state => ({ 
    projects: [...state.projects, project] 
  })),
  // ... more actions
}));
```

### **Error Handling:**
```typescript
// Error Boundary usage
<ErrorBoundary level="page">
  <YourComponent />
</ErrorBoundary>

// Error Fallback usage
<ErrorFallback 
  type="network" 
  error={error} 
  resetError={resetError} 
/>
```

## 📁 **IMPORTANT FILES**

### **Database & Schema:**
- `src/models/Schema.ts` - Drizzle ORM schema
- `migrations/0005_zippy_goblin_queen.sql` - Latest ERP migration

### **API Layer:**
- `src/libs/ApiResponse.ts` - Standardized responses
- `src/libs/RateLimiter.ts` - Rate limiting
- `src/libs/Cache.ts` - Caching system
- `src/app/api/v1/` - Versioned API endpoints

### **State Management:**
- `src/store/useAppStore.ts` - Zustand global store
- `src/components/ErrorBoundary.tsx` - Error boundaries
- `src/components/ErrorFallback.tsx` - Error fallbacks

## 🎯 **DEVELOPMENT PRIORITIES**

### **Immediate (Next 1-2 weeks):**
1. **Financial Module UI**
   - Create `FinancialAccountList.tsx`
   - Create `FinancialAccountForm.tsx`
   - Create `TransactionList.tsx`
   - Create `TransactionForm.tsx`
   - Create `FinancialDashboard.tsx`

2. **Financial API Endpoints**
   - Complete financial API endpoints
   - Add financial data to Zustand store
   - Integrate with existing project system

### **Short-term (Next 1 month):**
1. **HR Module Development**
2. **Supply Chain Module Development**
3. **System Integration**
4. **Testing & Optimization**

## 🔧 **DEVELOPMENT GUIDELINES**

### **When Adding New Features:**
1. **Follow ERP Architecture**: Use audit trail, soft delete, multi-tenancy
2. **Use TypeScript**: All code must be fully typed
3. **Follow API Standards**: Use standardized response format
4. **Update State Management**: Add new data to Zustand store
5. **Implement Error Boundaries**: Wrap new components
6. **Add Rate Limiting**: Apply to new API endpoints
7. **Update Documentation**: Keep guides updated

### **Database Changes:**
1. Update `src/models/Schema.ts`
2. Run `npm run db:generate`
3. Run `npm run db:migrate`
4. Update API endpoints
5. Update frontend components

### **API Changes:**
1. Use versioned endpoints (`/api/v1/`)
2. Follow standardized response format
3. Add rate limiting
4. Add caching where appropriate
5. Update error handling

### **Frontend Changes:**
1. Add to Zustand store if needed
2. Use Error Boundaries
3. Follow existing component patterns
4. Add TypeScript types
5. Update documentation

## 🚨 **KNOWN ISSUES**

1. **Clerk Integration**: Some auth code commented out for development
2. **Database Indexes**: Need performance indexes
3. **Caching**: Currently in-memory, need Redis for production
4. **Testing**: Need comprehensive test coverage

## 📚 **LEARNING RESOURCES**

- **Next.js**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team/
- **Zustand**: https://zustand-demo.pmnd.rs/
- **Clerk**: https://clerk.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn UI**: https://ui.shadcn.com/

## 🎉 **SUCCESS METRICS**

- **ERP Readiness**: 8.8/10 (target: 9.5/10)
- **Module Completion**: 0/3 → 3/3 ERP modules
- **Performance**: No degradation from MVP
- **User Experience**: Seamless integration

---

**Remember**: This project is transitioning from MVP to full ERP system. Maintain the established patterns and architecture while building new features. Always consider multi-tenancy, audit trails, and error handling in your implementations.

**Good luck with the development! 🚀**
