'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';
import type { Project, UpdateProjectRequest } from '@/types/Project';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type EditProjectModalProps = {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateProjectRequest) => Promise<void>;
  isLoading?: boolean;
};

export function EditProjectModal({
  project,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: EditProjectModalProps) {
  const [formData, setFormData] = useState<UpdateProjectRequest>({
    name: '',
    workItemDescription: '',
    address: '',
    city: '',
    province: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: CONSTRUCTION_PROJECT_STATUS.PLANNING,
    isActive: true,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        workItemDescription: project.workItemDescription || '',
        address: project.address || '',
        city: project.city || '',
        province: project.province || '',
        startDate: project.startDate && project.startDate !== null ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate && project.endDate !== null ? new Date(project.endDate).toISOString().split('T')[0] : '',
        budget: project.budget || 0,
        projectManagerId: project.projectManagerId || '',
        status: project.status || CONSTRUCTION_PROJECT_STATUS.PLANNING,
        isActive: project.isActive ?? true,
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out empty strings and convert to proper types
      const cleanedData: UpdateProjectRequest = {
        name: formData.name || undefined,
        workItemDescription: formData.workItemDescription || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        budget: formData.budget || undefined,
        projectManagerId: formData.projectManagerId === 'none' ? undefined : formData.projectManagerId || undefined,
        status: formData.status || undefined,
        isActive: formData.isActive,
      };

      // console.log('Modal form data:', cleanedData);
      await onSave(cleanedData);
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleInputChange = (field: keyof UpdateProjectRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen || !project) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Chỉnh sửa dự án</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="size-8 p-0"
          >
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên dự án *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên dự án"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="workItemDescription">Mô tả</Label>
              <Textarea
                id="workItemDescription"
                value={formData.workItemDescription}
                onChange={e => handleInputChange('workItemDescription', e.target.value)}
                placeholder="Nhập mô tả dự án"
                rows={3}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                placeholder="Nhập địa chỉ dự án"
              />
            </div>

            {/* City and Province */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  placeholder="Nhập thành phố"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Tỉnh/Thành phố</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={e => handleInputChange('province', e.target.value)}
                  placeholder="Nhập tỉnh/thành phố"
                />
              </div>
            </div>

            {/* Start and End Date */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={e => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Ngân sách (VNĐ)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={e => handleInputChange('budget', Number(e.target.value))}
                placeholder="Nhập ngân sách dự án"
                min="0"
              />
            </div>

            {/* Project Manager */}
            <div className="space-y-2">
              <Label htmlFor="projectManagerId">Quản lý dự án</Label>
              <Select
                value={formData.projectManagerId || 'none'}
                onValueChange={value => handleInputChange('projectManagerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingUsers ? 'Đang tải...' : 'Chọn quản lý dự án'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                      {' '}
                      (
                      {user.role}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={value => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CONSTRUCTION_PROJECT_STATUS.PLANNING}>Lập kế hoạch</SelectItem>
                  <SelectItem value={CONSTRUCTION_PROJECT_STATUS.ACTIVE}>Đang thực hiện</SelectItem>
                  <SelectItem value={CONSTRUCTION_PROJECT_STATUS.ON_HOLD}>Tạm dừng</SelectItem>
                  <SelectItem value={CONSTRUCTION_PROJECT_STATUS.COMPLETED}>Hoàn thành</SelectItem>
                  <SelectItem value={CONSTRUCTION_PROJECT_STATUS.CANCELLED}>Hủy bỏ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={e => handleInputChange('isActive', e.target.checked)}
                className="size-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">Dự án đang hoạt động</Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
