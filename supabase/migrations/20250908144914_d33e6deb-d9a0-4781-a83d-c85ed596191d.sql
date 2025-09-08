-- Fix security warnings by updating function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, membership_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing policies that allow anonymous access
DROP POLICY "Users can view all profiles" ON public.profiles;
DROP POLICY "Users can update own profile" ON public.profiles;
DROP POLICY "Users can view events" ON public.events;
DROP POLICY "Creators can update own events" ON public.events;
DROP POLICY "Creators can delete own events" ON public.events;
DROP POLICY "Users can view attendees" ON public.event_attendees;
DROP POLICY "Users can leave events" ON public.event_attendees;
DROP POLICY "Users can view own conversations" ON public.conversations;
DROP POLICY "Users can view conversation messages" ON public.messages;
DROP POLICY "Users can view own payments" ON public.payments;
DROP POLICY "System can update payments" ON public.payments;

-- Create new policies that only allow authenticated users
CREATE POLICY "Authenticated users can view profiles" ON public.profiles 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view events" ON public.events 
FOR SELECT TO authenticated USING (
  CASE 
    WHEN event_type = 'free' THEN true
    WHEN event_type = 'premium' THEN (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.membership_type IN ('premium', 'admin')
      )
    )
    WHEN event_type = 'admin_only' THEN (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.membership_type = 'admin'
      )
    )
  END
);

CREATE POLICY "Creators can update own events" ON public.events 
FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own events" ON public.events 
FOR DELETE TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Authenticated users can view attendees" ON public.event_attendees 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can leave events" ON public.event_attendees 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON public.conversations 
FOR SELECT TO authenticated USING (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

CREATE POLICY "Users can view conversation messages" ON public.messages 
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = conversation_id 
    AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
  )
);

CREATE POLICY "Users can view own payments" ON public.payments 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments" ON public.payments 
FOR ALL TO service_role USING (true) WITH CHECK (true);