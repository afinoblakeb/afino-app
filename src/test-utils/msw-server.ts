import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define handlers for commonly used API endpoints
export const handlers = [
  // User profile endpoint
  http.get('/api/users/me', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: 'https://example.com/avatar.png',
    }, { status: 200 });
  }),

  // Organizations endpoint
  http.get('/api/users/me/organizations', () => {
    return HttpResponse.json({
      organizations: [
        {
          id: 'org-1',
          name: 'Test Organization 1',
          slug: 'test-org-1',
          role: 'admin',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        {
          id: 'org-2',
          name: 'Test Organization 2',
          slug: 'test-org-2',
          role: 'member',
          createdAt: '2023-01-02T00:00:00.000Z',
        },
      ],
    }, { status: 200 });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

// Add convenience methods to override default handlers for specific tests
export const createErrorHandler = (path: string, statusCode = 500, message = 'Server error') => {
  return http.get(path, () => {
    return HttpResponse.json({ message }, { status: statusCode });
  });
};

export const createEmptyResponseHandler = (path: string) => {
  return http.get(path, () => {
    return HttpResponse.json({}, { status: 200 });
  });
};

export const createDelayedResponseHandler = (path: string, delayMs = 1000) => {
  return http.get(path, async () => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return HttpResponse.json({ message: 'Delayed response' }, { status: 200 });
  });
}; 