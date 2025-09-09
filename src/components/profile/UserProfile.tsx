import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, User, Calendar, MapPin, Settings } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const { profile, user } = useAuth();

  if (!profile || !user) return null;

  const getMembershipBadge = (type: string) => {
    switch (type) {
      case 'admin':
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            {t('admin')}
          </Badge>
        );
      case 'premium':
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            {t('premium')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            {t('free')}
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-0 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-20 w-20 ring-4 ring-primary/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl font-bold">
              {profile.full_name?.charAt(0) || profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              {profile.full_name || profile.username}
            </h3>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {getMembershipBadge(profile.membership_type)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {profile.bio}
          </p>
        )}
        
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{t('memberSince')} {new Date(profile.created_at).toLocaleDateString('ar-SA')}</span>
        </div>
        
        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            {t('editProfile')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};