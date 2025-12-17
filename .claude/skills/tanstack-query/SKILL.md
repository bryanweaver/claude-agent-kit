---
name: tanstack-query
description: TanStack Query (React Query) patterns for data fetching, caching, mutations, and optimistic updates. Use when implementing data fetching, managing server state, handling API calls, or working with React Query.
---

# TanStack Query Patterns

Patterns for efficient data fetching and server state management with TanStack Query v5.

## Setup

### Provider setup
```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Basic Queries

### Simple query
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data.name}</div>;
}
```

### Query with enabled option
```tsx
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // Only fetch when userId exists
});
```

### Query with dependent data
```tsx
// Fetch user first, then their posts
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetchPosts(user!.id),
  enabled: !!user?.id, // Only fetch when user exists
});
```

## Query Keys

### Key structure best practices
```tsx
// Simple key
queryKey: ['todos']

// With ID
queryKey: ['todo', todoId]

// With filters
queryKey: ['todos', { status: 'done', page: 1 }]

// Hierarchical
queryKey: ['users', userId, 'posts', postId, 'comments']
```

### Query key factory pattern
```typescript
// lib/queries/keys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Usage
useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUser(userId),
});

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: userKeys.all });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
```

## Mutations

### Basic mutation
```tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function CreateTodo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newTodo: { title: string }) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      });
      if (!res.ok) throw new Error('Failed to create todo');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = new FormData(form).get('title') as string;
        mutation.mutate({ title });
      }}
    >
      <input name="title" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </button>
      {mutation.error && <p>Error: {mutation.error.message}</p>}
    </form>
  );
}
```

### Mutation with optimistic updates
```tsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateTodo,
  // When mutate is called
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] });

    // Snapshot previous value
    const previousTodo = queryClient.getQueryData(['todos', newTodo.id]);

    // Optimistically update
    queryClient.setQueryData(['todos', newTodo.id], newTodo);

    // Return context with snapshot
    return { previousTodo };
  },
  // If mutation fails, rollback
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(
      ['todos', newTodo.id],
      context?.previousTodo
    );
  },
  // Always refetch after error or success
  onSettled: (data, error, variables) => {
    queryClient.invalidateQueries({ queryKey: ['todos', variables.id] });
  },
});
```

### Optimistic update for lists
```tsx
const mutation = useMutation({
  mutationFn: createTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically add to list
    queryClient.setQueryData(['todos'], (old: Todo[]) => [
      ...old,
      { ...newTodo, id: 'temp-id', status: 'pending' },
    ]);

    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context?.previousTodos);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

## Infinite Queries

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

export function InfinitePosts() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/posts?cursor=${pageParam}`);
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading...'
          : hasNextPage
          ? 'Load More'
          : 'No more posts'}
      </button>
    </div>
  );
}
```

## Prefetching

### Prefetch on hover
```tsx
export function PostLink({ postId }: { postId: string }) {
  const queryClient = useQueryClient();

  const prefetchPost = () => {
    queryClient.prefetchQuery({
      queryKey: ['post', postId],
      queryFn: () => fetchPost(postId),
      staleTime: 60 * 1000, // Only prefetch if older than 1 min
    });
  };

  return (
    <Link
      href={`/posts/${postId}`}
      onMouseEnter={prefetchPost}
    >
      View Post
    </Link>
  );
}
```

### Prefetch in Server Component
```tsx
// app/posts/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function PostsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsList />
    </HydrationBoundary>
  );
}
```

## Custom Hooks Pattern

```typescript
// hooks/use-user.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/queries/keys';

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
}

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters ?? {}),
    queryFn: () => fetchUsers(filters),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Usage in component
const { data: user, isLoading } = useUser(userId);
const updateUser = useUpdateUser();

updateUser.mutate({ id: userId, name: 'New Name' });
```

## Error Handling

### Global error handler
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if (error instanceof Error && error.message.includes('404')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      },
    },
  },
});
```

### Per-query error handling
```tsx
const { data, error, isError } = useQuery({
  queryKey: ['user', userId],
  queryFn: fetchUser,
  retry: false, // Don't retry this query
  throwOnError: false, // Don't throw to error boundary
});

if (isError) {
  return <ErrorMessage error={error} />;
}
```
