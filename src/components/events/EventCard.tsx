import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Calendar,
  MapPin,
  Users,
  Crown,
  Lock,
  Shield,
  Clock
} from 'lucide-react';

interface EventCardProps {
  event: {
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
  };
  onUpdate?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onUpdate }) => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const canAccessEvent = () => {
    if (event.event_type === 'free') return true;
    if (event.event_type === 'premium') {
      return profile?.membership_type === 'premium' || profile?.membership_type === 'admin';
    }
    if (event.event_type === 'admin_only') {
      return profile?.membership_type === 'admin';
    }
    return false;
  };

  const getEventTypeIcon = () => {
    switch (event.event_type) {
      case 'premium':
        return <Crown className="h-3 w-3" />;
      case 'admin_only':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getEventTypeBadge = () => {
    switch (event.event_type) {
      case 'premium':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300">
            <Crown className="h-3 w-3 mr-1" />
            {t('premiumEvent')}
          </Badge>
        );
      case 'admin_only':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
            <Shield className="h-3 w-3 mr-1" />
            {t('adminOnlyEvent')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t('freeEvent')}
          </Badge>
        );
    }
  };

  const handleJoinEvent = async () => {
    if (!user || !canAccessEvent()) return;

    try {
      if (event.user_is_attending) {
        // Leave event
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: t('success'),
          description: t('leftEvent'),
        });
      } else {
        // Join event
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: event.id,
            user_id: user.id,
          });

        if (error) throw error;
        
        toast({
          title: t('success'),
          description: t('joinedEvent'),
        });
      }
      
      onUpdate?.();
    } catch (error) {
      console.error('Error updating event attendance:', error);
      toast({
        title: t('error'),
        description: t('errorOccurred'),
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!canAccessEvent()) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {getEventTypeBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Lock className="h-4 w-4" />
            <span className="text-sm">{t('upgradeToAccess')}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            {t('restricted')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {event.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
          {getEventTypeBadge()}
        </div>
        
        {event.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {event.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.start_date)}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {event.attendee_count} {t('attendees')}
            {event.max_attendees && ` / ${event.max_attendees}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{t('createdOn')} {formatDate(event.created_at)}</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {t('createdBy')}: {event.creator.username}
        </div>
      </CardContent>

      <CardFooter>
        {user ? (
          <Button
            onClick={handleJoinEvent}
            variant={event.user_is_attending ? 'outline' : 'default'}
            className="w-full"
          >
            {event.user_is_attending ? t('leaveEvent') : t('joinEvent')}
          </Button>
        ) : (
          <Button asChild className="w-full">
            <a href="/auth">{t('loginToJoin')}</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};