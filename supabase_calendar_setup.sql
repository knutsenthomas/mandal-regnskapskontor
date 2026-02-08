-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists, then create it afresh
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'calendar_events'
      AND policyname = 'Public events are viewable by everyone'
  ) THEN
    EXECUTE format('DROP POLICY "%s" ON %I.%I;', 'Public events are viewable by everyone', 'public', 'calendar_events');
  END IF;

  EXECUTE format($policy$
    CREATE POLICY "Public events are viewable by everyone"
      ON %I.%I
      FOR SELECT
      TO PUBLIC
      USING (true);
  $policy$, 'public', 'calendar_events');
END
$$;

-- Optional: create additional policies here (example template)
-- DO NOT create duplicate policy names for the same table.
-- Example:
/*
DO $$
BEGIN
IF NOT EXISTS (
SELECT 1 FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'calendar_events'
       AND policyname = 'Owners can modify their events'
   ) THEN
     EXECUTE $$
       CREATE POLICY "Owners can modify their events"
         ON public.calendar_events
         FOR ALL
         TO authenticated
         USING ((SELECT auth.uid()) = owner_id)
         WITH CHECK ((SELECT auth.uid()) = owner_id);
     $$;
   END IF;
 END
 $$;
*/

-- Verification: list policies for the table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'calendar_events';