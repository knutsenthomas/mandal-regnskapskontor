-- Add 'read' column to contact_messages table if it doesn't exist
ALTER TABLE public.contact_messages 
ADD COLUMN IF NOT EXISTS "read" BOOLEAN DEFAULT FALSE;

-- Update RLS policies if necessary (optional, depending on existing setup)
-- Ensure admin can update the 'read' status
-- (Assuming existing policies allow update for authenticated users or similar)
