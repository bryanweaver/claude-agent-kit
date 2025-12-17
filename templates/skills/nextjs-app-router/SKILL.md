---
name: nextjs-app-router
description: Next.js 14 App Router patterns including Server Components, Client Components, API routes, data fetching, and routing. Use when building Next.js applications, creating pages, implementing API routes, or deciding between Server and Client Components.
---

# Next.js App Router Patterns

Modern patterns for Next.js 14+ with the App Router.

## Server vs Client Components

### Decision Guide

**Use Server Components (default) when:**
- Fetching data
- Accessing backend resources directly
- Keeping sensitive information on server (API keys, tokens)
- Large dependencies that shouldn't increase client bundle
- No interactivity needed

**Use Client Components (`'use client'`) when:**
- Using React hooks (useState, useEffect, useContext)
- Adding event listeners (onClick, onChange)
- Using browser-only APIs
- Using custom hooks that depend on state/effects
- Using React Class components

### Server Component (default)
```tsx
// app/users/page.tsx
// No directive needed - Server Component by default

import { createClient } from '@/lib/supabase/server';

export default async function UsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase.from('users').select('*');

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Client Component
```tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Composition Pattern (Server + Client)
```tsx
// app/dashboard/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: stats } = await supabase.from('stats').select('*');

  // Pass server data to client component
  return <DashboardClient initialStats={stats} />;
}

// app/dashboard/DashboardClient.tsx (Client Component)
'use client';

import { useState } from 'react';

export function DashboardClient({ initialStats }) {
  const [stats, setStats] = useState(initialStats);
  // Interactive logic here
}
```

## Routing Patterns

### File-based routing
```
app/
├── page.tsx                    # /
├── about/page.tsx              # /about
├── blog/
│   ├── page.tsx                # /blog
│   └── [slug]/page.tsx         # /blog/:slug
├── (marketing)/                # Route group (no URL impact)
│   ├── pricing/page.tsx        # /pricing
│   └── features/page.tsx       # /features
├── (app)/                      # Route group for authenticated
│   ├── layout.tsx              # Shared layout with auth
│   ├── dashboard/page.tsx      # /dashboard
│   └── settings/page.tsx       # /settings
└── api/
    └── users/route.ts          # /api/users
```

### Dynamic routes
```tsx
// app/blog/[slug]/page.tsx
interface Props {
  params: { slug: string };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}

// Generate static paths
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

### Catch-all routes
```tsx
// app/docs/[...slug]/page.tsx
interface Props {
  params: { slug: string[] };
}

export default function DocsPage({ params }: Props) {
  // /docs/a/b/c -> params.slug = ['a', 'b', 'c']
  return <div>Path: {params.slug.join('/')}</div>;
}
```

## API Routes

### Basic API route
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  // Your logic
  return NextResponse.json({ users: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Your logic
  return NextResponse.json({ success: true }, { status: 201 });
}
```

### API route with auth
```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Authorized logic
  return NextResponse.json({ data: 'protected' });
}
```

### Dynamic API route
```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Context {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: Context
) {
  const user = await getUser(params.id);
  return NextResponse.json(user);
}

export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  const body = await request.json();
  const user = await updateUser(params.id, body);
  return NextResponse.json(user);
}

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  await deleteUser(params.id);
  return new NextResponse(null, { status: 204 });
}
```

## Data Fetching

### Server Component fetching
```tsx
// Fetches on every request (dynamic)
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  });
  return res.json();
}

// Fetches once and caches (static)
async function getStaticData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache'
  });
  return res.json();
}

// Revalidates every hour
async function getRevalidatedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }
  });
  return res.json();
}
```

### Parallel data fetching
```tsx
export default async function Page() {
  // Fetch in parallel
  const [users, posts] = await Promise.all([
    getUsers(),
    getPosts()
  ]);

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
    </div>
  );
}
```

## Loading and Error States

### Loading UI
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>;
}
```

### Error handling
```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Not found
```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}

// Trigger from Server Component
import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const user = await getUser(params.id);
  if (!user) notFound();
  return <div>{user.name}</div>;
}
```

## Layouts

### Root layout (required)
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My App',
  description: 'My app description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Nested layout
```tsx
// app/(app)/layout.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/Sidebar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex">
      <Sidebar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## Additional Resources

For more patterns, see:
- [METADATA.md](METADATA.md) - SEO and metadata patterns
- [MIDDLEWARE.md](MIDDLEWARE.md) - Middleware patterns
- [CACHING.md](CACHING.md) - Caching strategies
