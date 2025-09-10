import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { EventCard } from '@/components/events/EventCard';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Filter, Crown } from 'lucide-react';

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

const EventsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
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

      const eventsWithDetails = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count: attendeeCount } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact' })
            .eq('event_id', event.id);

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

  const EventGrid: React.FC<{ events: EventWithDetails[] }> = ({ events }) => {
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
        <Card className="text-center py-16">
          <CardContent>
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-foreground mb-3">{t('noEventsYet')}</h3>
            <p className="text-muted-foreground mb-6">{t('beFirstToCreate')}</p>
            {user && <CreateEventDialog onEventCreated={fetchEvents} />}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onUpdate={fetchEvents}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 font-cairo">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">{t('activeEventsPage')}</h1>
            </div>
            {user && <CreateEventDialog onEventCreated={fetchEvents} />}
          </div>
          <p className="text-muted-foreground text-lg">
            استكشف جميع الفعاليات النشطة وانضم إلى التي تهمك
          </p>
        </div>

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
            <EventGrid events={events} />
          </TabsContent>
          
          <TabsContent value="free">
            <EventGrid events={events.filter(e => e.event_type === 'free')} />
          </TabsContent>
          
          <TabsContent value="premium">
            <EventGrid events={events.filter(e => e.event_type === 'premium')} />
          </TabsContent>
          
          <TabsContent value="admin">
            <EventGrid events={events.filter(e => e.event_type === 'admin_only')} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EventsPage;