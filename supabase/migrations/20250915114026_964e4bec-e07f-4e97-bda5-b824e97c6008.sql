-- Create a function to execute SQL statements (for data import)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function should only be used for safe INSERT operations
  -- In production, this would be more restricted
  EXECUTE sql;
END;
$$;