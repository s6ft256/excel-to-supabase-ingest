-- Update RLS policies to allow anonymous access for viewing data

-- Drop existing restrictive policies and create new ones that allow anonymous read access
DROP POLICY IF EXISTS "Users can view all incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can view all incident details" ON public.incident_details;
DROP POLICY IF EXISTS "Users can view all inspections" ON public.inspections;
DROP POLICY IF EXISTS "Users can view all training sessions" ON public.training_sessions;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policies that allow anonymous read access
CREATE POLICY "Anyone can view incidents" 
ON public.incidents 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view incident details" 
ON public.incident_details 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view inspections" 
ON public.inspections 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view training sessions" 
ON public.training_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Keep insert/update policies requiring authentication
-- (existing policies for INSERT/UPDATE remain unchanged)