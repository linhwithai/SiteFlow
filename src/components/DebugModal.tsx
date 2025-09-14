'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoIcon, ImageIcon } from 'lucide-react';

export function DebugModal() {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Debug Modal Test</h2>
      
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

        <TabsContent value="basic" className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium">Basic Info Tab</h3>
            <p>This is the basic information tab content.</p>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-medium">Photos Tab</h3>
            <p>This is the photos upload tab content.</p>
            <div className="mt-2 p-2 bg-yellow-100 rounded">
              <strong>Debug Info:</strong> Tabs are working correctly!
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

