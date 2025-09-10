import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Shield,
  Crown,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  full_name: string | null;
  membership_type: 'free' | 'premium' | 'admin';
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  event_type: 'free' | 'premium' | 'admin_only';
  is_active: boolean;
  creator: {
    username: string;
  };
  attendee_count: number;
  created_at: string;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { profile, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    premiumUsers: 0
  });

  useEffect(() => {
    if (profile?.membership_type === 'admin') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          premiumUsers: usersData.filter(u => u.membership_type === 'premium' || u.membership_type === 'admin').length
        }));
      }

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id (username)
        `)
        .order('created_at', { ascending: false });

      if (eventsData) {
        const eventsWithCounts = await Promise.all(
          eventsData.map(async (event) => {
            const { count } = await supabase
              .from('event_attendees')
              .select('*', { count: 'exact' })
              .eq('event_id', event.id);

            return {
              ...event,
              attendee_count: count || 0
            };
          })
        );

        setEvents(eventsWithCounts);
        setStats(prev => ({
          ...prev,
          totalEvents: eventsWithCounts.length,
          activeEvents: eventsWithCounts.filter(e => e.is_active).length
        }));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">جاري التحميل...</div>
    </div>;
  }

  if (!profile || profile.membership_type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 font-cairo">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{t('adminPanel')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            إدارة شاملة لجميع عناصر المنصة والمستخدمين
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">المستخدمون الكل</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">الفعاليات الكل</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">الفعاليات النشطة</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.activeEvents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">الأعضاء المميزين</CardTitle>
              <Crown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{stats.premiumUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('userManagement')}
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('eventManagement')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('siteSettings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{user.full_name || user.username}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                        <Badge 
                          variant={user.membership_type === 'admin' ? 'default' : 'secondary'}
                          className={user.membership_type === 'admin' ? 'bg-purple-600' : ''}
                        >
                          {user.membership_type === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                          {user.membership_type === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                          {user.membership_type === 'admin' ? 'مدير' : 
                           user.membership_type === 'premium' ? 'مميز' : 'مجاني'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الفعاليات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            بواسطة {event.creator.username} • {event.attendee_count} مشارك
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={event.event_type === 'free' ? 'default' : 'secondary'}>
                            {event.event_type === 'free' ? 'مجاني' : 
                             event.event_type === 'premium' ? 'مميز' : 'إداري'}
                          </Badge>
                          <Badge variant={event.is_active ? 'default' : 'destructive'}>
                            {event.is_active ? 'نشط' : 'معطل'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الموقع</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">إعدادات الموقع قادمة قريباً...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;