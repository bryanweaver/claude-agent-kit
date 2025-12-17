# Migration Strategies

## Safe Migration Patterns

### Adding columns (safe)
```sql
-- Adding nullable column is always safe
ALTER TABLE users ADD COLUMN bio TEXT;

-- Adding column with default is safe
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
```

### Adding NOT NULL columns
```sql
-- Step 1: Add nullable column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN;

-- Step 2: Backfill data
UPDATE users SET email_verified = false WHERE email_verified IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

-- Step 4: Add default for future rows
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
```

### Renaming columns (careful)
```sql
-- Option 1: Create new, migrate, drop old (safest)
ALTER TABLE users ADD COLUMN display_name TEXT;
UPDATE users SET display_name = name;
-- Update application code
ALTER TABLE users DROP COLUMN name;

-- Option 2: Use view for backwards compatibility
CREATE VIEW users_v2 AS
SELECT id, name AS display_name, email FROM users;
```

### Changing column types
```sql
-- Safe: Widening types
ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(12,2);

-- Careful: Use USING for conversions
ALTER TABLE logs ALTER COLUMN level TYPE INTEGER USING level::INTEGER;
```

## Rollback Strategies

### Reversible migrations
```sql
-- up.sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  theme TEXT DEFAULT 'light',
  notifications BOOLEAN DEFAULT true
);

-- down.sql (keep in comments or separate file)
-- DROP TABLE user_preferences;
```

### Data preservation rollback
```sql
-- Before destructive change, backup
CREATE TABLE _backup_users AS SELECT * FROM users;

-- After verifying, clean up
DROP TABLE _backup_users;
```

## Zero-Downtime Migrations

### Column addition pattern
```sql
-- 1. Add column (instant, no lock)
ALTER TABLE orders ADD COLUMN total_v2 DECIMAL(12,2);

-- 2. Backfill in batches (application does this)
-- UPDATE orders SET total_v2 = total WHERE id BETWEEN x AND y;

-- 3. Switch reads to new column (application change)

-- 4. Stop writes to old column (application change)

-- 5. Drop old column (next migration)
ALTER TABLE orders DROP COLUMN total;
ALTER TABLE orders RENAME COLUMN total_v2 TO total;
```

### Index creation
```sql
-- Use CONCURRENTLY to avoid locking
CREATE INDEX CONCURRENTLY idx_orders_user_date
ON orders(user_id, created_at);
```

## Migration Testing

### Local testing workflow
```bash
# Start fresh
supabase db reset

# Apply migrations
supabase db push

# Verify
supabase db psql -c "SELECT * FROM pg_tables WHERE schemaname = 'public';"

# Generate types to verify schema
supabase gen types typescript --local
```

### Seed data for testing
```sql
-- supabase/seed.sql
INSERT INTO profiles (id, user_id, display_name)
VALUES
  ('uuid-1', 'auth-uuid-1', 'Test User 1'),
  ('uuid-2', 'auth-uuid-2', 'Test User 2');
```
