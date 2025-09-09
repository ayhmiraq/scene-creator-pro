import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Trophy } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

export const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  const stats: StatItem[] = [
    {
      icon: <Calendar className="h-6 w-6" />,
      value: '150+',
      label: t('totalEvents'),
      color: 'text-blue-500',
    },
    {
      icon: <Users className="h-6 w-6" />,
      value: '2.5K+',
      label: t('activeUsers'),
      color: 'text-green-500',
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      value: '98%',
      label: t('successfulEvents'),
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
              <div className={`${stat.color} opacity-70`}>
                {stat.icon}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};