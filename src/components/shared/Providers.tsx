'use client';
import { Provider }                        from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState }                         from 'react';
import { store }                            from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1 },
    },
  }));
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
