import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Crown } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('welcome')}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {t('discoverEvents')}
          </p>
          
          {profile?.membership_type === 'free' && (
            <Badge variant="outline" className="mb-4">
              <Crown className="h-4 w-4 mr-2" />
              {t('upgradeToPremium')} - {t('unlockPremiumFeatures')}
            </Badge>
          )}
        </div>

        {/* Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{t('activeEvents')}</h2>
            {user && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('createEvent')}
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onUpdate={fetchEvents}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">{t('noEventsYet')}</h3>
              <p className="text-muted-foreground mb-4">{t('beFirstToCreate')}</p>
              {user && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createEvent')}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
