/**
 * Global State Management using Zustand
 * 
 * This store manages the global application state for the ERP system
 * including user, organization, projects, financial data, and UI state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status: string;
  projectManagerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAccount {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentAccountId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialTransaction {
  id: number;
  projectId?: number;
  transactionDate: string;
  amount: number;
  currency: string;
  description?: string;
  referenceNumber?: string;
  accountDebitId?: number;
  accountCreditId?: number;
  createdAt: string;
}

export interface Employee {
  id: number;
  clerkUserId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  salary?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Supplier {
  id: number;
  supplierCode: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  itemCode: string;
  itemName: string;
  category?: string;
  unitOfMeasure?: string;
  unitCost?: number;
  currentStock: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: string;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  loading: boolean;
  error: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Store interface
interface AppState {
  // User & Organization
  user: User | null;
  organization: Organization | null;
  
  // Core Data
  projects: Project[];
  financialAccounts: FinancialAccount[];
  financialTransactions: FinancialTransaction[];
  employees: Employee[];
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  
  // UI State
  ui: UIState;
  
  // Actions - User & Organization
  setUser: (user: User | null) => void;
  setOrganization: (organization: Organization | null) => void;
  
  // Actions - Projects
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: number, updates: Partial<Project>) => void;
  removeProject: (id: number) => void;
  
  // Actions - Financial
  setFinancialAccounts: (accounts: FinancialAccount[]) => void;
  addFinancialAccount: (account: FinancialAccount) => void;
  updateFinancialAccount: (id: number, updates: Partial<FinancialAccount>) => void;
  removeFinancialAccount: (id: number) => void;
  
  setFinancialTransactions: (transactions: FinancialTransaction[]) => void;
  addFinancialTransaction: (transaction: FinancialTransaction) => void;
  updateFinancialTransaction: (id: number, updates: Partial<FinancialTransaction>) => void;
  removeFinancialTransaction: (id: number) => void;
  
  // Actions - HR
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: number, updates: Partial<Employee>) => void;
  removeEmployee: (id: number) => void;
  
  // Actions - Supply Chain
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: number, updates: Partial<Supplier>) => void;
  removeSupplier: (id: number) => void;
  
  setInventoryItems: (items: InventoryItem[]) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: number, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: number) => void;
  
  // Actions - UI
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Actions - Reset
  resetStore: () => void;
}

// Initial state
const initialState = {
  user: null,
  organization: null,
  projects: [],
  financialAccounts: [],
  financialTransactions: [],
  employees: [],
  suppliers: [],
  inventoryItems: [],
  ui: {
    sidebarOpen: true,
    theme: 'system' as const,
    loading: false,
    error: null,
    notifications: [],
  },
};

// Store implementation
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, _get) => ({
        ...initialState,
        
        // User & Organization actions
        setUser: (user) => set({ user }, false, 'setUser'),
        setOrganization: (organization) => set({ organization }, false, 'setOrganization'),
        
        // Project actions
        setProjects: (projects) => set({ projects }, false, 'setProjects'),
        addProject: (project) => set(
          (state) => ({ projects: [...state.projects, project] }),
          false,
          'addProject'
        ),
        updateProject: (id, updates) => set(
          (state) => ({
            projects: state.projects.map(project =>
              project.id === id ? { ...project, ...updates } : project
            ),
          }),
          false,
          'updateProject'
        ),
        removeProject: (id) => set(
          (state) => ({
            projects: state.projects.filter(project => project.id !== id),
          }),
          false,
          'removeProject'
        ),
        
        // Financial Account actions
        setFinancialAccounts: (accounts) => set({ financialAccounts: accounts }, false, 'setFinancialAccounts'),
        addFinancialAccount: (account) => set(
          (state) => ({ financialAccounts: [...state.financialAccounts, account] }),
          false,
          'addFinancialAccount'
        ),
        updateFinancialAccount: (id, updates) => set(
          (state) => ({
            financialAccounts: state.financialAccounts.map(account =>
              account.id === id ? { ...account, ...updates } : account
            ),
          }),
          false,
          'updateFinancialAccount'
        ),
        removeFinancialAccount: (id) => set(
          (state) => ({
            financialAccounts: state.financialAccounts.filter(account => account.id !== id),
          }),
          false,
          'removeFinancialAccount'
        ),
        
        // Financial Transaction actions
        setFinancialTransactions: (transactions) => set({ financialTransactions: transactions }, false, 'setFinancialTransactions'),
        addFinancialTransaction: (transaction) => set(
          (state) => ({ financialTransactions: [...state.financialTransactions, transaction] }),
          false,
          'addFinancialTransaction'
        ),
        updateFinancialTransaction: (id, updates) => set(
          (state) => ({
            financialTransactions: state.financialTransactions.map(transaction =>
              transaction.id === id ? { ...transaction, ...updates } : transaction
            ),
          }),
          false,
          'updateFinancialTransaction'
        ),
        removeFinancialTransaction: (id) => set(
          (state) => ({
            financialTransactions: state.financialTransactions.filter(transaction => transaction.id !== id),
          }),
          false,
          'removeFinancialTransaction'
        ),
        
        // Employee actions
        setEmployees: (employees) => set({ employees }, false, 'setEmployees'),
        addEmployee: (employee) => set(
          (state) => ({ employees: [...state.employees, employee] }),
          false,
          'addEmployee'
        ),
        updateEmployee: (id, updates) => set(
          (state) => ({
            employees: state.employees.map(employee =>
              employee.id === id ? { ...employee, ...updates } : employee
            ),
          }),
          false,
          'updateEmployee'
        ),
        removeEmployee: (id) => set(
          (state) => ({
            employees: state.employees.filter(employee => employee.id !== id),
          }),
          false,
          'removeEmployee'
        ),
        
        // Supplier actions
        setSuppliers: (suppliers) => set({ suppliers }, false, 'setSuppliers'),
        addSupplier: (supplier) => set(
          (state) => ({ suppliers: [...state.suppliers, supplier] }),
          false,
          'addSupplier'
        ),
        updateSupplier: (id, updates) => set(
          (state) => ({
            suppliers: state.suppliers.map(supplier =>
              supplier.id === id ? { ...supplier, ...updates } : supplier
            ),
          }),
          false,
          'updateSupplier'
        ),
        removeSupplier: (id) => set(
          (state) => ({
            suppliers: state.suppliers.filter(supplier => supplier.id !== id),
          }),
          false,
          'removeSupplier'
        ),
        
        // Inventory Item actions
        setInventoryItems: (items) => set({ inventoryItems: items }, false, 'setInventoryItems'),
        addInventoryItem: (item) => set(
          (state) => ({ inventoryItems: [...state.inventoryItems, item] }),
          false,
          'addInventoryItem'
        ),
        updateInventoryItem: (id, updates) => set(
          (state) => ({
            inventoryItems: state.inventoryItems.map(inventoryItem =>
              inventoryItem.id === id ? { ...inventoryItem, ...updates } : inventoryItem
            ),
          }),
          false,
          'updateInventoryItem'
        ),
        removeInventoryItem: (id) => set(
          (state) => ({
            inventoryItems: state.inventoryItems.filter(item => item.id !== id),
          }),
          false,
          'removeInventoryItem'
        ),
        
        // UI actions
        setSidebarOpen: (open) => set(
          (state) => ({ ui: { ...state.ui, sidebarOpen: open } }),
          false,
          'setSidebarOpen'
        ),
        setTheme: (theme) => set(
          (state) => ({ ui: { ...state.ui, theme } }),
          false,
          'setTheme'
        ),
        setLoading: (loading) => set(
          (state) => ({ ui: { ...state.ui, loading } }),
          false,
          'setLoading'
        ),
        setError: (error) => set(
          (state) => ({ ui: { ...state.ui, error } }),
          false,
          'setError'
        ),
        addNotification: (notification) => set(
          (state) => ({
            ui: {
              ...state.ui,
              notifications: [
                ...state.ui.notifications,
                {
                  ...notification,
                  id: Date.now().toString(),
                  timestamp: new Date().toISOString(),
                  read: false,
                },
              ],
            },
          }),
          false,
          'addNotification'
        ),
        removeNotification: (id) => set(
          (state) => ({
            ui: {
              ...state.ui,
              notifications: state.ui.notifications.filter(notification => notification.id !== id),
            },
          }),
          false,
          'removeNotification'
        ),
        markNotificationAsRead: (id) => set(
          (state) => ({
            ui: {
              ...state.ui,
              notifications: state.ui.notifications.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
              ),
            },
          }),
          false,
          'markNotificationAsRead'
        ),
        clearNotifications: () => set(
          (state) => ({ ui: { ...state.ui, notifications: [] } }),
          false,
          'clearNotifications'
        ),
        
        // Reset action
        resetStore: () => set(initialState, false, 'resetStore'),
      }),
      {
        name: 'siteflow-erp-store',
        partialize: (state) => ({
          user: state.user,
          organization: state.organization,
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            theme: state.ui.theme,
          },
        }),
      }
    ),
    {
      name: 'siteflow-erp-store',
    }
  )
);

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useOrganization = () => useAppStore((state) => state.organization);
export const useProjects = () => useAppStore((state) => state.projects);
export const useFinancialAccounts = () => useAppStore((state) => state.financialAccounts);
export const useFinancialTransactions = () => useAppStore((state) => state.financialTransactions);
export const useEmployees = () => useAppStore((state) => state.employees);
export const useSuppliers = () => useAppStore((state) => state.suppliers);
export const useInventoryItems = () => useAppStore((state) => state.inventoryItems);
export const useUI = () => useAppStore((state) => state.ui);
export const useNotifications = () => useAppStore((state) => state.ui.notifications);
