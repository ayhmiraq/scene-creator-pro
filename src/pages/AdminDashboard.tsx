import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Shield,
  Crown,
  Trash2,
  Edit,
  Eye,
  Upload,
  Image
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

interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  meta_keywords: string | null;
  logo_url: string | null;
  default_language: string;
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    site_name: '',
    site_description: '',
    meta_keywords: '',
    default_language: 'ar'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.membership_type === 'admin') {
      fetchData();
      fetchSiteSettings();
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

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSiteSettings(data);
        setSettingsForm({
          site_name: data.site_name,
          site_description: data.site_description,
          meta_keywords: data.meta_keywords || '',
          default_language: data.default_language
        });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    const fileName = `logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, logoFile);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSaveSettings = async () => {
    try {
      let logoUrl = siteSettings?.logo_url;
      
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const updates = {
        ...settingsForm,
        logo_url: logoUrl
      };

      const { error } = await supabase
        .from('site_settings')
        .update(updates)
        .eq('id', siteSettings?.id);

      if (error) throw error;

      toast.success(t('settingsUpdated'));
      fetchSiteSettings();
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('settingsError'));
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
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('siteSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Site Name */}
                  <div className="space-y-2">
                    <Label htmlFor="siteName">{t('siteName')}</Label>
                    <Input
                      id="siteName"
                      value={settingsForm.site_name}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, site_name: e.target.value }))}
                      placeholder={t('siteName')}
                    />
                  </div>

                  {/* Site Description */}
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">{t('siteDescription')}</Label>
                    <Textarea
                      id="siteDescription"
                      value={settingsForm.site_description}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, site_description: e.target.value }))}
                      placeholder={t('siteDescription')}
                      rows={3}
                    />
                  </div>

                  {/* Meta Keywords */}
                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">{t('metaKeywords')}</Label>
                    <Input
                      id="metaKeywords"
                      value={settingsForm.meta_keywords}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, meta_keywords: e.target.value }))}
                      placeholder="فعاليات، أحداث، عراق، منصة"
                    />
                  </div>

                  {/* Default Language */}
                  <div className="space-y-2">
                    <Label>{t('defaultLanguage')}</Label>
                    <Select 
                      value={settingsForm.default_language} 
                      onValueChange={(value) => setSettingsForm(prev => ({ ...prev, default_language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectLanguage')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <Label>{t('logoUpload')}</Label>
                    
                    {/* Current Logo */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        {logoPreview || siteSettings?.logo_url ? (
                          <img 
                            src={logoPreview || siteSettings?.logo_url || ''} 
                            alt="Logo" 
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Image className="h-8 w-8 mx-auto text-gray-400" />
                            <p className="text-xs text-gray-400 mt-1">{t('noLogo')}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="logoUpload" className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <Upload className="h-4 w-4" />
                            {t('uploadLogo')}
                          </div>
                        </Label>
                        <Input
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG حتى 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveSettings} className="px-8">
                      {t('save')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;