import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Calendar, 
  MessageSquare, 
  User, 
  LogOut,
  Crown,
  Shield
} from 'lucide-react';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();

  const getMembershipIcon = (membershipType: string) => {
    switch (membershipType) {
      case 'premium':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getMembershipBadge = (membershipType: string) => {
    switch (membershipType) {
      case 'premium':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300">
            <Crown className="h-3 w-3 mr-1" />
            {t('premiumMember')}
          </Badge>
        );
      case 'admin':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
            <Shield className="h-3 w-3 mr-1" />
            {t('adminMember')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t('freeMember')}
          </Badge>
        );
    }
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-primary">
              ✨ {t('events')}
            </Link>
            
            {user && (
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  to="/events"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  {t('events')}
                </Link>
                <Link
                  to="/my-events"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  {t('myEvents')}
                </Link>
                {profile?.membership_type === 'premium' || profile?.membership_type === 'admin' ? (
                  <Link
                    to="/messages"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {t('messages')}
                  </Link>
                ) : null}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {user && profile ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-bold">
                      {profile.full_name?.charAt(0) || profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {profile.full_name || profile.username}
                    </span>
                    {getMembershipBadge(profile.membership_type)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">{t('login')}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth?tab=signup">{t('signup')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};