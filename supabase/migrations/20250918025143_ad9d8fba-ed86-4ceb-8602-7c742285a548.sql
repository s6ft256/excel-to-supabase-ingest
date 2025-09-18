-- Add missing columns to incidents table to match Excel data structure
ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS time text,
ADD COLUMN IF NOT EXISTS critical_level text,
ADD COLUMN IF NOT EXISTS place text,
ADD COLUMN IF NOT EXISTS incident_name text;

-- Update existing incidents to have default values for new columns
UPDATE public.incidents 
SET 
  time = CASE 
    WHEN time IS NULL THEN '00:00' 
    ELSE time 
  END,
  critical_level = CASE 
    WHEN critical_level IS NULL THEN 
      CASE severity_level 
        WHEN 1 THEN 'Low'
        WHEN 2 THEN 'Medium' 
        WHEN 3 THEN 'High'
        WHEN 4 THEN 'Critical'
        ELSE 'Medium'
      END
    ELSE critical_level
  END,
  place = CASE 
    WHEN place IS NULL THEN 'Unknown'
    ELSE place
  END,
  incident_name = CASE 
    WHEN incident_name IS NULL THEN type
    ELSE incident_name
  END;