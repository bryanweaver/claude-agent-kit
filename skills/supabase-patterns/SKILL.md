---
name: supabase-patterns
description: Supabase database patterns including RLS policies, migrations, Edge Functions, and TypeScript integration. Use when working with Supabase, writing database queries, creating migrations, implementing Row-Level Security, or building Edge Functions.
---

# Supabase Patterns

Comprehensive patterns for Supabase development including database design, security, and TypeScript integration.

## Quick Reference

### RLS Policy Patterns

**Basic owner-only access:**
```sql
-- Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Users can manage own data"
ON my_table FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Separate policies per operation:**
```sql
-- Read own data
CREATE POLICY "Users can view own data"
ON my_table FOR SELECT
USING (auth.uid() = user_id);

-- Insert with ownership
CREATE POLICY "Users can insert own data"
ON my_table FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update own data
CREATE POLICY "Users can update own data"
ON my_table FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Delete own data
CREATE POLICY "Users can delete own data"
ON my_table FOR DELETE
USING (auth.uid() = user_id);
```

**Role-based access:**
```sql
-- Check user role from profiles table
CREATE POLICY "Admins can view all"
ON my_table FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### Migration Best Practices

**Naming convention:**
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

**Migration template:**
```sql
-- Migration: Add user_profiles table
-- Description: Creates user profiles with RLS

-- Create table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### TypeScript Integration

**Type generation:**
```bash
supabase gen types typescript --local > src/types/database.types.ts
```

**Using generated types:**
```typescript
import { Database } from '@/types/database.types';

type Tables = Database['public']['Tables'];
type UserProfile = Tables['user_profiles']['Row'];
type UserProfileInsert = Tables['user_profiles']['Insert'];
type UserProfileUpdate = Tables['user_profiles']['Update'];
```

**Typed Supabase client:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Edge Functions

**Basic Edge Function:**
```typescript
// supabase/functions/hello-world/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();

  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

**Edge Function with Supabase client:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get user from auth header
  const authHeader = req.headers.get('Authorization')!;
  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (error || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  // Your logic here
  const { data, error: dbError } = await supabase
    .from('my_table')
    .select('*')
    .eq('user_id', user.id);

  return new Response(
    JSON.stringify({ data }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

## Additional Resources

For detailed patterns, see:
- [RLS-PATTERNS.md](RLS-PATTERNS.md) - Advanced RLS scenarios
- [MIGRATIONS.md](MIGRATIONS.md) - Migration strategies and rollbacks
- [EDGE-FUNCTIONS.md](EDGE-FUNCTIONS.md) - Edge Function patterns

## Common Commands

### Safe Commands (Local Development)
```bash
# Local Supabase
supabase start
supabase stop
supabase status

# Migrations (local)
supabase migration new <name>
supabase db push              # Apply to LOCAL database only

# Types
supabase gen types typescript --local > src/types/database.types.ts

# Edge Functions (local testing)
supabase functions serve <name>
```

### DANGEROUS Commands (Require User Approval)

**WARNING:** The following commands affect production data. The `database-admin` agent enforces approval requirements for these operations.

```bash
# DANGER: Destroys ALL local data - requires explicit user approval
supabase db reset

# DANGER: Deploys to PRODUCTION database - requires explicit user approval
supabase db push --linked

# DANGER: Deploys to PRODUCTION - requires explicit user approval
supabase functions deploy <name>

# DANGER: Can overwrite local work - use with caution
supabase db pull
```

**Always test locally first, then get user approval before any remote/production operations.**
