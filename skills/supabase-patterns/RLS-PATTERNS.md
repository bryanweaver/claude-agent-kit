# Advanced RLS Patterns

## Multi-tenant Patterns

### Organization-based access
```sql
-- Users belong to organizations
CREATE POLICY "Users can access org data"
ON documents FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

### Team-based access with roles
```sql
-- Different permissions per role
CREATE POLICY "Team members can view"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.project_id = projects.id
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team admins can modify"
ON projects FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.project_id = projects.id
    AND team_members.user_id = auth.uid()
    AND team_members.role IN ('admin', 'owner')
  )
);
```

## Sharing Patterns

### Shareable resources
```sql
-- Resources can be shared with specific users
CREATE POLICY "Owner or shared access"
ON documents FOR SELECT
USING (
  user_id = auth.uid()
  OR id IN (
    SELECT document_id FROM document_shares
    WHERE shared_with = auth.uid()
  )
);
```

### Public/private toggle
```sql
CREATE POLICY "Public or owner access"
ON posts FOR SELECT
USING (
  is_public = true
  OR user_id = auth.uid()
);
```

## Hierarchical Access

### Parent-child relationships
```sql
-- Access to parent grants access to children
CREATE POLICY "Access via parent"
ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND (posts.is_public = true OR posts.user_id = auth.uid())
  )
);
```

## Performance Optimization

### Using security definer functions
```sql
-- Create a function that bypasses RLS for specific checks
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
  );
END;
$$;

-- Use in policy (more efficient for repeated checks)
CREATE POLICY "Org members can access"
ON documents FOR SELECT
USING (is_org_member(organization_id));
```

### Index-friendly policies
```sql
-- Ensure columns used in policies have indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_org_id ON documents(organization_id);
CREATE INDEX idx_org_members_user_org ON organization_members(user_id, organization_id);
```

## Common Pitfalls

### Avoid recursive policies
```sql
-- BAD: This can cause infinite recursion
CREATE POLICY "Check profiles"
ON profiles FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- GOOD: Use auth.uid() directly
CREATE POLICY "Own profile"
ON profiles FOR SELECT
USING (id = auth.uid());
```

### Handle NULL values
```sql
-- Consider NULL user_id for anonymous content
CREATE POLICY "Authenticated users or anonymous content"
ON content FOR SELECT
USING (
  user_id IS NULL  -- Anonymous/public content
  OR user_id = auth.uid()  -- Own content
);
```
