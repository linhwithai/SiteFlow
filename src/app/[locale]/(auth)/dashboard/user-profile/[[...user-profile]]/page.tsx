'use client';

import { UserProfile } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Calendar, Edit, Mail, Shield, User, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getI18nPath } from '@/utils/Helpers';

// Types
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  createdAt: string;
  lastSignInAt: string;
  organizationMemberships: Array<{
    organization: {
      id: string;
      name: string;
      imageUrl: string;
      role: string;
    };
  }>;
};

const UserProfilePage = (props: { params: { locale: string } }) => {
  const t = useTranslations('UserProfile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="text-2xl font-semibold">{t('title_bar')}</div>
          <div className="text-sm font-medium text-muted-foreground">
            {t('title_bar_description')}
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="text-2xl font-semibold">{t('title_bar')}</div>
        <div className="text-sm font-medium text-muted-foreground">
          {t('title_bar_description')}
        </div>
      </div>

      {/* User Profile Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="organizations">Tổ chức</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* User Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <Avatar className="mx-auto h-24 w-24 mb-4">
                  <AvatarImage src={user?.imageUrl} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {user?.firstName} {user?.lastName}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tham gia:</span>
                  <span>{new Date(user?.createdAt || '').toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Lần đăng nhập cuối:</span>
                  <span>{new Date(user?.lastSignInAt || '').toLocaleDateString('vi-VN')}</span>
                </div>
                <Separator />
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa hồ sơ
                </Button>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin liên hệ</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin liên hệ của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Họ và tên</label>
                      <div className="flex items-center gap-2 p-3 border rounded-md">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.firstName} {user?.lastName}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="flex items-center gap-2 p-3 border rounded-md">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài khoản</CardTitle>
                  <CardDescription>
                    Chi tiết về tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ID người dùng</label>
                      <div className="p-3 border rounded-md font-mono text-sm">
                        {user?.id}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Trạng thái</label>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Hoạt động</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bảo mật tài khoản
              </CardTitle>
              <CardDescription>
                Quản lý mật khẩu và bảo mật tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu</label>
                <div className="flex items-center gap-2 p-3 border rounded-md">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">••••••••</span>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">Xác thực hai yếu tố</label>
                <div className="flex items-center gap-2 p-3 border rounded-md">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Chưa bật</span>
                  <Badge variant="secondary" className="ml-auto">Khuyến nghị</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tổ chức
              </CardTitle>
              <CardDescription>
                Các tổ chức bạn đang tham gia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user?.organizationMemberships?.map((membership) => (
                  <div key={membership.organization.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={membership.organization.imageUrl} alt={membership.organization.name} />
                      <AvatarFallback>
                        {membership.organization.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{membership.organization.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Vai trò: {membership.organization.role}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {membership.organization.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clerk UserProfile Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình nâng cao</CardTitle>
          <CardDescription>
            Sử dụng giao diện Clerk để cấu hình chi tiết
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserProfile
            routing="path"
            path={getI18nPath('/dashboard/user-profile', props.params.locale)}
            appearance={{
              elements: {
                rootBox: 'w-full',
                cardBox: 'w-full flex',
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
