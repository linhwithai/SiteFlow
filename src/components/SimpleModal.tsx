'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoIcon, ImageIcon } from 'lucide-react';

type SimpleModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SimpleModal({ isOpen, onClose }: SimpleModalProps) {
  console.log('🔍 SimpleModal rendered, isOpen:', isOpen);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test Modal với Tabs</DialogTitle>
          <DialogDescription>
            Modal này để test xem tabs có hoạt động không
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <InfoIcon className="size-4" />
                Thông tin cơ bản
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <ImageIcon className="size-4" />
                Hình ảnh
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">Tab Thông tin cơ bản</h3>
                <p className="text-blue-700">Nếu bạn thấy tab này, tabs đang hoạt động!</p>
              </div>
            </TabsContent>

            <TabsContent value="photos" className="mt-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900">Tab Hình ảnh</h3>
                <p className="text-green-700">Nếu bạn thấy tab này, tabs đang hoạt động!</p>
                <input type="file" accept="image/*" multiple className="mt-2" />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

