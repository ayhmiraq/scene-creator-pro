-- Add sample events for demonstration
INSERT INTO public.events (title, description, location, start_date, end_date, event_type, max_attendees, creator_id, image_url) VALUES 
(
  'ورشة تطوير الويب المتقدمة',
  'تعلم أحدث تقنيات تطوير الويب مع React و TypeScript. ورشة شاملة للمطورين من جميع المستويات.',
  'مركز الابتكار التقني - الرياض',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
  'premium',
  50,
  (SELECT id FROM profiles LIMIT 1),
  'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=500&h=300&fit=crop'
),
(
  'مؤتمر الذكاء الاصطناعي 2025',
  'أكبر تجمع لخبراء الذكاء الاصطناعي في المنطقة. محاضرات، ورش عمل، ومعارض تقنية.',
  'مركز الملك عبدالعزيز للمؤتمرات - جدة',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '16 days',
  'free',
  200,
  (SELECT id FROM profiles LIMIT 1),
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop'
),
(
  'دورة تصميم الجرافيك الاحترافية',
  'دورة مكثفة في تصميم الجرافيك باستخدام أدوات Adobe الحديثة. مناسبة للمبتدئين والمحترفين.',
  'أكاديمية التصميم الرقمي - دبي',
  NOW() + INTERVAL '21 days',
  NOW() + INTERVAL '23 days',
  'premium',
  30,
  (SELECT id FROM profiles LIMIT 1),
  'https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&h=300&fit=crop'
),
(
  'ملتقى رواد الأعمال',
  'لقاء شهري لرواد الأعمال والمستثمرين لتبادل الخبرات والفرص الاستثمارية.',
  'مساحة العمل المشتركة - الكويت',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
  'free',
  80,
  (SELECT id FROM profiles LIMIT 1),
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=300&fit=crop'
),
(
  'حفل إطلاق منتج تقني جديد',
  'حدث حصري لإطلاق أحدث الابتكارات التقنية. مدعو فقط كبار الشخصيات والخبراء.',
  'فندق الفيصلية - الرياض',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '10 days' + INTERVAL '2 hours',
  'admin_only',
  25,
  (SELECT id FROM profiles LIMIT 1),
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop'
);

-- Upgrade the first user to admin status
UPDATE public.profiles 
SET membership_type = 'admin', 
    full_name = 'المدير العام',
    bio = 'مدير منصة الفعاليات ومنظم الأحداث الرئيسية'
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);