import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { EventCard } from '@/components/events/EventCard';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, User, Plus } from 'lucide-react';

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

const MyEventsPage = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [createdEvents, setCreatedEvents] = useState<EventWithDetails[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventWithDetails[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchMyEvents = async () => {
    if (!user) return;

    try {
      // Fetch events created by user
      const { data: createdData, error: createdError } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id (
            username,
            membership_type
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (createdError) throw createdError;

      // Fetch events user is attending
      const { data: attendingData, error: attendingError } = await supabase
        .from('event_attendees')
        .select(`
          event:events!event_id (
            *,
            creator:profiles!creator_id (
              username,
              membership_type
            )
          )
        `)
        .eq('user_id', user.id);

      if (attendingError) throw attendingError;

      // Process created events
      const createdEventsWithDetails = await Promise.all(
        (createdData || []).map(async (event) => {
          const { count: attendeeCount } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact' })
            .eq('event_id', event.id);

          return {
            ...event,
            creator: event.creator,
            attendee_count: attendeeCount || 0,
            user_is_attending: false, // User is the creator
          };
        })
      );

      // Process attending events
      const attendingEventsWithDetails = await Promise.all(
        (attendingData || []).map(async (item) => {
          const event = item.event;
          const { count: attendeeCount } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact' })
            .eq('event_id', event.id);

          return {
            ...event,
            creator: event.creator,
            attendee_count: attendeeCount || 0,
            user_is_attending: true,
          };
        })
      );

      setCreatedEvents(createdEventsWithDetails);
      setAttendingEvents(attendingEventsWithDetails);
    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const EventGrid: React.FC<{ events: EventWithDetails[]; showCreateButton?: boolean }> = ({ 
    events, 
    showCreateButton = false 
  }) => {
    if (fetchLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {showCreateButton ? 'لم تنشئ أي فعاليات بعد' : 'لم تنضم لأي فعاليات بعد'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {showCreateButton ? 'ابدأ بإنشاء أول فعالية لك' : 'استكشف الفعاليات المتاحة وانضم إليها'}
            </p>
            {showCreateButton && <CreateEventDialog onEventCreated={fetchMyEvents} />}
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
            onUpdate={fetchMyEvents}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">جاري التحميل...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 font-cairo">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">{t('myEventsPage')}</h1>
            </div>
            <CreateEventDialog onEventCreated={fetchMyEvents} />
          </div>
          <p className="text-muted-foreground text-lg">
            إدارة الفعاليات التي أنشأتها والفعاليات التي تشارك فيها
          </p>
        </div>

        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              الفعاليات التي أنشأتها
            </TabsTrigger>
            <TabsTrigger value="attending" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              الفعاليات المشارك فيها
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="created">
            <EventGrid events={createdEvents} showCreateButton={true} />
          </TabsContent>
          
          <TabsContent value="attending">
            <EventGrid events={attendingEvents} showCreateButton={false} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyEventsPage;