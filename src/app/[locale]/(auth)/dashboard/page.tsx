import { AlertCircle, Building2, CheckCircle, Clock, ListIcon, Search, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

import { ProjectDeleteWarning } from '@/components/ProjectDeleteWarning';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Section - Tino Style */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Dự án
          </h1>
          <div className="mx-3 h-6 w-px bg-gray-300" />
          <p className="text-sm text-gray-600">
            Trung tâm quản lý dự án
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm">
            Tất cả
          </Button>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm dự án"
              className="w-64 rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
          </div>
          <div className="flex rounded-md border border-gray-300">
            <Button variant="ghost" size="sm" className="rounded-r-none">
              <ListIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-l-none border-l border-gray-300">
              <Building2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Project Delete Warning */}
      <ProjectDeleteWarning />

      {/* Key Metrics - Compact Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dự án</p>
                <p className="text-2xl font-bold">19</p>
              </div>
              <Building2 className="size-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 size-3" />
              +12% tháng này
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 size-3" />
              +5% tháng này
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang thực hiện</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Clock className="size-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <AlertCircle className="mr-1 size-3" />
              2 cần chú ý
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thành viên</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Users className="size-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <Users className="mr-1 size-3" />
              Hoạt động tích cực
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table - Tino Style */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tên dự án
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Địa điểm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ngày bắt đầu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {/* Mock Project 1 */}
                <tr className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-blue-100">
                        <Building2 className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Tòa nhà văn phòng ABC</div>
                        <div className="text-sm text-gray-500">Dự án xây dựng</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    Quận 1, TP.HCM
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-16 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    15/01/2024
                  </td>
                </tr>

                {/* Mock Project 2 */}
                <tr className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-green-100">
                        <Building2 className="size-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Khu dân cư XYZ</div>
                        <div className="text-sm text-gray-500">Dự án nhà ở</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    Quận 7, TP.HCM
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge className="bg-yellow-100 text-yellow-800">Đang thực hiện</Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-16 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-green-600" style={{ width: '90%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">90%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    20/02/2024
                  </td>
                </tr>

                {/* Mock Project 3 */}
                <tr className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-purple-100">
                        <Building2 className="size-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Trung tâm thương mại DEF</div>
                        <div className="text-sm text-gray-500">Dự án thương mại</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    Quận 3, TP.HCM
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge className="bg-red-100 text-red-800">Tạm dừng</Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-16 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-red-600" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">30%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    10/03/2024
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Organization Info - Bottom Right */}
      <div className="flex justify-end">
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-lg">Thiết Kế Kiến Trúc</CardTitle>
            <CardDescription>@tkkt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Logo tổ chức</span>
                <span className="text-gray-900">Có logo tổ chức</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Thành viên</span>
                <span className="text-gray-900">1 thành viên</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tạo ngày</span>
                <span className="text-gray-900">10/9/2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trạng thái</span>
                <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
              </div>
              <div className="flex gap-2 pt-2">
                <Link href="/dashboard/organization">
                  <Button variant="outline" size="sm" className="flex-1">
                    Quản lý tổ chức
                  </Button>
                </Link>
                <Link href="/dashboard/organization-profile/organization-members">
                  <Button variant="outline" size="sm" className="flex-1">
                    Mời thành viên
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
