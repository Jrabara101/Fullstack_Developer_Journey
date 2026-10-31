import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DiscoveryWorkspaceShell } from './components/DiscoveryWorkspaceShell';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DiscoveryWorkspaceShell />
    </QueryClientProvider>
  );
}

export default App;
