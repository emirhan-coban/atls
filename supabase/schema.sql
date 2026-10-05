-- ==============================================================================
-- ATLS TRAVEL PASSPORT - SUPABASE DATABASE SCHEMA (IDEMPOTENT & FAIL-SAFE)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  handle TEXT,
  avatar_initials TEXT,
  avatar_url TEXT,
  location TEXT DEFAULT 'Lisbon, Portugal',
  location_tr TEXT DEFAULT 'Lizbon, Portekiz',
  nationality TEXT DEFAULT 'Global Citizen',
  passport_no TEXT,
  issue_date TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY'),
  expiry_date TEXT DEFAULT 'LIFETIME',
  bio TEXT DEFAULT 'Partly local, mostly curious. Exploring the human experience across borders.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ensure all required columns exist (protects against existing tables from starter templates)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_initials TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Lisbon, Portugal';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_tr TEXT DEFAULT 'Lizbon, Portekiz';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Global Citizen';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS passport_no TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS issue_date TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expiry_date TEXT DEFAULT 'LIFETIME';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Partly local, mostly curious. Exploring the human experience across borders.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 3. User Countries (Stamped Passports)
CREATE TABLE IF NOT EXISTS public.user_countries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  country_id TEXT NOT NULL, -- e.g. 'TR', 'PT', 'JP', 'US', 'AR'
  name TEXT NOT NULL,
  name_tr TEXT,
  flag TEXT,
  continent TEXT,
  status TEXT CHECK (status IN ('visited', 'lived', 'want')) NOT NULL,
  visited_year TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, country_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_countries ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles (Drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- 6. RLS Policies for User Countries
DROP POLICY IF EXISTS "Users can view their own stamped countries" ON public.user_countries;
CREATE POLICY "Users can view their own stamped countries" 
  ON public.user_countries FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stamped countries" ON public.user_countries;
CREATE POLICY "Users can insert their own stamped countries" 
  ON public.user_countries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stamped countries" ON public.user_countries;
CREATE POLICY "Users can update their own stamped countries" 
  ON public.user_countries FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own stamped countries" ON public.user_countries;
CREATE POLICY "Users can delete their own stamped countries" 
  ON public.user_countries FOR DELETE 
  USING (auth.uid() = user_id);

-- 7. Trigger to automatically create a profile when a new user signs up in auth.users
-- Uses SECURITY DEFINER with explicit search_path and EXCEPTION block so user sign-up NEVER crashes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_name TEXT;
  v_handle TEXT;
  v_initials TEXT;
  v_passport_no TEXT;
  v_suffix TEXT;
BEGIN
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Traveler');
  v_suffix := SUBSTR(REPLACE(new.id::text, '-', ''), 1, 4);
  v_handle := '@' || LOWER(REGEXP_REPLACE(v_name, '[^a-zA-Z0-9]', '', 'g')) || '_' || v_suffix;
  v_initials := UPPER(SUBSTRING(v_name FROM 1 FOR 2));
  v_passport_no := 'AT-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0') || '-X';

  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      name,
      handle,
      avatar_initials,
      passport_no
    ) VALUES (
      new.id,
      new.email,
      v_name,
      v_handle,
      v_initials,
      v_passport_no
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Log warning but NEVER abort the auth transaction so user creation always succeeds!
    RAISE WARNING 'handle_new_user profile creation warning: %', SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Auto-Confirm Email (No mail confirmation needed)
-- Automatically mark any existing users as confirmed
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Automatically mark newly created users as confirmed at database level
CREATE OR REPLACE FUNCTION public.handle_auto_confirm_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auto_confirm_user();

