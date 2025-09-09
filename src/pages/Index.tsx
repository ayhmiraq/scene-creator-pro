import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { EventCard } from '@/components/events/EventCard';
import { UserProfile } from '@/components/profile/UserProfile';
import { StatsSection } from '@/components/sections/StatsSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Crown, Sparkles, Calendar, Filter } from 'lucide-react';

interface EventWithDetails {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string;
  event_type: 'free' | 'premium' | 'admin_only';
  max_attendees: number | null;
  image_url: string | null;
  created_at: string;
  creator: {
    username: string;
    membership_type: 'free' | 'premium' | 'admin';
  };
  attendee_count: number;
  user_is_attending: boolean;
}

const Index = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      // Fetch events with creator info and attendee count
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id (
            username,
            membership_type
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get attendee counts and check if user is attending
      const eventsWithDetails = await Promise.all(
        (eventsData || []).map(async (event) => {
          // Get attendee count
          const { count: attendeeCount } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact' })
            .eq('event_id', event.id);

          // Check if current user is attending
          let userIsAttending = false;
          if (user) {
            const { data: attendeeData } = await supabase
              .from('event_attendees')
              .select('id')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .single();
            
            userIsAttending = !!attendeeData;
          }

          return {
            ...event,
            creator: event.creator,
            attendee_count: attendeeCount || 0,
            user_is_attending: userIsAttending,
          };
        })
      );

      setEvents(eventsWithDetails);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 font-cairo">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-3xl -z-10"></div>
          <div className="py-12 px-6">
            <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-primary via-primary to-blue-600 bg-clip-text text-transparent leading-tight">
              {t('welcome')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('discoverEvents')}
            </p>
            
            {profile?.membership_type === 'free' && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full px-6 py-3 mb-6">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  {t('upgradeToPremium')} - {t('unlockPremiumFeatures')}
                </span>
                <Sparkles className="h-4 w-4 text-yellow-600" />
              </div>
            )}
            
            {profile?.membership_type === 'admin' && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-6 py-2 text-sm mb-6">
                <Crown className="h-4 w-4 mr-2" />
                مرحباً بك أيها المدير - {profile.full_name}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <StatsSection />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Section - Only show when user is logged in */}
          {user && (
            <div className="lg:col-span-1">
              <UserProfile />
            </div>
          )}
          
          {/* Events Section */}
          <div className={user ? "lg:col-span-3" : "lg:col-span-4"}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">{t('activeEvents')}</h2>
              </div>
              {user && (
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createEvent')}
                </Button>
              )}
            </div>
            
            {/* Event Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  الكل
                </TabsTrigger>
                <TabsTrigger value="free" className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                  {t('freeEvents')}
                </TabsTrigger>
                <TabsTrigger value="premium" className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  {t('premiumEvents')}
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-yellow-500 rounded-full"></span>
                  {t('adminEvents')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <EventGrid events={events} loading={loading} />
              </TabsContent>
              
              <TabsContent value="free">
                <EventGrid events={events.filter(e => e.event_type === 'free')} loading={loading} />
              </TabsContent>
              
              <TabsContent value="premium">
                <EventGrid events={events.filter(e => e.event_type === 'premium')} loading={loading} />
              </TabsContent>
              
              <TabsContent value="admin">
                <EventGrid events={events.filter(e => e.event_type === 'admin_only')} loading={loading} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

const EventGrid: React.FC<{ events: EventWithDetails[]; loading: boolean }> = ({ events, loading }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl animate-pulse border border-border/50" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-muted/20 to-transparent rounded-2xl border border-border/50">
        <div className="mb-6">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">{t('noEventsYet')}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{t('beFirstToCreate')}</p>
        {user && (
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Plus className="h-4 w-4 mr-2" />
            {t('createEvent')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onUpdate={() => window.location.reload()}
        />
      ))}
    </div>
  );
};

export default Index;
