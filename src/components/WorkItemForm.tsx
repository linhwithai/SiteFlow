'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, WrenchIcon, FileTextIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { WorkItem, CreateWorkItemRequest, UpdateWorkItemRequest, WorkItemType, WorkItemStatus, WorkItemPriority } from '@/types/WorkItem';
import { WORK_ITEM_TYPE_LABELS, WORK_ITEM_STATUS_LABELS, WORK_ITEM_PRIORITY_LABELS } from '@/types/WorkItem';

const workItemFormSchema = z.object({
  workItemTitle: z.string().min(1, 'Tên hạng mục là bắt buộc').max(255, 'Tên hạng mục quá dài'),
  workItemDescription: z.string().max(1000, 'Mô tả quá dài').optional(),
  workItemType: z.enum([
    'concrete_work',
    'steel_work',
    'masonry',
    'finishing',
    'mep_installation',
    'inspection',
    'safety_check',
    'excavation',
    'foundation',
    'roofing',
    'plumbing',
    'electrical',
    'painting',
    'landscaping',
    'cleanup',
    'other',
  ]),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'on_hold']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedTo: z.string().optional(),
  workDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedWorkHours: z.number().min(0, 'Số giờ ước tính phải >= 0').optional(),
  actualWorkHours: z.number().min(0, 'Số giờ thực tế phải >= 0').optional(),
  constructionLocation: z.string().max(255, 'Vị trí thi công quá dài').optional(),
  weather: z.string().max(100, 'Thông tin thời tiết quá dài').optional(),
  laborCount: z.number().min(0, 'Số lao động phải >= 0').optional(),
  materials: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  notes: z.string().max(1000, 'Ghi chú quá dài').optional(),
});

type WorkItemFormData = z.infer<typeof workItemFormSchema>;

interface WorkItemFormProps {
  workItem?: WorkItem;
  onSubmit: (data: CreateWorkItemRequest | UpdateWorkItemRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkItemForm({ workItem, onSubmit, onCancel, isLoading = false }: WorkItemFormProps) {
  const [materialsInput, setMaterialsInput] = useState('');
  const [equipmentInput, setEquipmentInput] = useState('');

  const form = useForm<WorkItemFormData>({
    resolver: zodResolver(workItemFormSchema),
    defaultValues: {
      workItemTitle: workItem?.workItemTitle || '',
      workItemDescription: workItem?.workItemDescription || '',
      workItemType: workItem?.workItemType || 'concrete_work',
      status: workItem?.status || 'planned',
      priority: workItem?.priority || 'medium',
      assignedTo: workItem?.assignedTo || '',
      workDate: workItem?.workDate ? new Date(workItem.workDate).toISOString().split('T')[0] : '',
      dueDate: workItem?.dueDate ? new Date(workItem.dueDate).toISOString().split('T')[0] : '',
      estimatedWorkHours: workItem?.estimatedWorkHours || undefined,
      actualWorkHours: workItem?.actualWorkHours || undefined,
      constructionLocation: workItem?.constructionLocation || '',
      weather: workItem?.weather || '',
      laborCount: workItem?.laborCount || 0,
      materials: workItem?.materials || [],
      equipment: workItem?.equipment || [],
      notes: workItem?.notes || '',
    },
  });

  const handleSubmit = async (data: WorkItemFormData) => {
    const formData = {
      ...data,
      materials: data.materials || [],
      equipment: data.equipment || [],
    };

    await onSubmit(formData);
  };

  const addMaterial = () => {
    if (materialsInput.trim()) {
      const currentMaterials = form.getValues('materials') || [];
      form.setValue('materials', [...currentMaterials, materialsInput.trim()]);
      setMaterialsInput('');
    }
  };

  const removeMaterial = (index: number) => {
    const currentMaterials = form.getValues('materials') || [];
    form.setValue('materials', currentMaterials.filter((_, i) => i !== index));
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      const currentEquipment = form.getValues('equipment') || [];
      form.setValue('equipment', [...currentEquipment, equipmentInput.trim()]);
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index: number) => {
    const currentEquipment = form.getValues('equipment') || [];
    form.setValue('equipment', currentEquipment.filter((_, i) => i !== index));
  };

  const workItemTypes = Object.entries(WORK_ITEM_TYPE_LABELS) as [WorkItemType, string][];
  const statuses = Object.entries(WORK_ITEM_STATUS_LABELS) as [WorkItemStatus, string][];
  const priorities = Object.entries(WORK_ITEM_PRIORITY_LABELS) as [WorkItemPriority, string][];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="size-5" />
          {workItem ? 'Chỉnh sửa hạng mục công việc' : 'Tạo hạng mục công việc mới'}
        </CardTitle>
        <CardDescription>
          {workItem ? 'Cập nhật thông tin hạng mục công việc' : 'Thêm hạng mục công việc mới vào dự án'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
              
              <FormField
                control={form.control}
                name="workItemTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hạng mục *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên hạng mục công việc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workItemDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả chi tiết về hạng mục công việc"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="workItemType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại hạng mục *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại hạng mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workItemTypes.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statuses.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Độ ưu tiên</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn độ ưu tiên" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Assignment & Scheduling */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Phân công & Lịch trình</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người phụ trách</FormLabel>
                      <FormControl>
                        <Input placeholder="ID người phụ trách" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày thực hiện</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày hoàn thành dự kiến</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="laborCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lao động</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Time Tracking */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Theo dõi thời gian</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedWorkHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số giờ ước tính</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualWorkHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số giờ thực tế</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Work Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chi tiết công việc</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="constructionLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vị trí thi công</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Tầng 1, Khu A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời tiết</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Nắng, mưa, âm u" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Materials */}
              <div className="space-y-2">
                <FormLabel>Vật liệu</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập vật liệu"
                    value={materialsInput}
                    onChange={(e) => setMaterialsInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                  />
                  <Button type="button" onClick={addMaterial} size="sm">
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('materials')?.map((material, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {material}
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-2">
                <FormLabel>Thiết bị</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập thiết bị"
                    value={equipmentInput}
                    onChange={(e) => setEquipmentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                  />
                  <Button type="button" onClick={addEquipment} size="sm">
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('equipment')?.map((equipment, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {equipment}
                      <button
                        type="button"
                        onClick={() => removeEquipment(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ghi chú bổ sung về hạng mục công việc"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : (workItem ? 'Cập nhật' : 'Tạo mới')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}







