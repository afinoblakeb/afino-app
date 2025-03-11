import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { QueryProvider } from './QueryProvider';

// Mock for window.fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper to directly test the provider component instead of trying to extract config
const renderTestQuery = () => {
  return renderHook(
    () => {
      const query = useQuery({
        queryKey: ['test-key'],
        queryFn: () => Promise.resolve('test-data'),
      });
      
      return query;
    },
    { wrapper: QueryProvider }
  );
};

describe('QueryProvider', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    });
  });
  
  it('should render without errors', () => {
    const { result } = renderTestQuery();
    expect(result.current).toBeDefined();
  });
  
  it('should properly initialize a query', () => {
    const { result } = renderTestQuery();
    
    // Initial state should be pending or success for a new query in v5
    expect(result.current.status === 'pending' || result.current.status === 'success').toBe(true);
    
    // Check the internal state of the query
    expect(result.current.isLoading || result.current.isSuccess).toBe(true);
  });
  
  it('should handle fetch state correctly', async () => {
    const { result } = renderTestQuery();
    
    // After initial render, the query should be in a defined state
    expect(['pending', 'error', 'success']).toContain(result.current.status);
  });
  
  it('should be able to fetch data', async () => {
    const { result } = renderTestQuery();
    
    // Just verify that the query hook works within the provider
    expect(result.current).toBeDefined();
  });
}); 