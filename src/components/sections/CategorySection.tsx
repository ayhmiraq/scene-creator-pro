import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MapPin, Trophy, BookOpen, Briefcase } from 'lucide-react';

export const CategorySection: React.FC = () => {
  const { t } = useTranslation();

  const categories = [
    {
      id: 'technology',
      title: 'التكنولوجيا والبرمجة',
      description: 'فعاليات تقنية وورش برمجة',
      icon: BookOpen,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-600',
      count: 12
    },
    {
      id: 'business',
      title: 'الأعمال وريادة الأعمال',
      description: 'مؤتمرات وملتقيات الأعمال',
      icon: Briefcase,
      color: 'from-emerald-500/20 to-green-500/20',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-600',
      count: 8
    },
    {
      id: 'networking',
      title: 'التواصل والشبكات المهنية',
      description: 'فعاليات التواصل المهني',
      icon: Users,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-600',
      count: 15
    },
    {
      id: 'competitions',
      title: 'المسابقات والتحديات',
      description: 'مسابقات تقنية وإبداعية',
      icon: Trophy,
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-600',
      count: 6
    }
  ];

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">أقسام الفعاليات</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          استكشف مختلف أنواع الفعاليات المنظمة حسب المجالات والاهتمامات
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card 
              key={category.id}
              className={`relative overflow-hidden border-2 ${category.borderColor} bg-gradient-to-br ${category.color} hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/50 ${category.iconColor}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground bg-white/30 px-2 py-1 rounded-full">
                    {category.count} فعالية
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {category.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {category.description}
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white/20 border-white/30 hover:bg-white/30"
                >
                  استكشف الفعاليات
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};