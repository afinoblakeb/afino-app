# API Design

This document outlines the API design for the Afino fintech platform. It covers both the internal API structure using Next.js API routes and Server Actions, as well as external API integrations.

## API Architecture

The Afino platform uses a combination of Next.js API Routes and Server Actions:

- **API Routes**: Used for client-side data fetching and third-party integrations
- **Server Actions**: Used for form submissions and data mutations directly from React Server Components

```
┌─────────────────────────────────────────────────────────────┐
│                       Client                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App                             │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │  API Routes     │    │  Server Actions │                 │
│  │  /api/*         │    │  (RSC)          │                 │
│  └────────┬────────┘    └────────┬────────┘                 │
│           │                      │                          │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase                                │
└─────────────────────────────────────────────────────────────┘
```

## API Design Principles

1. **RESTful Design**: Follow REST principles for API endpoints
2. **Type Safety**: Use TypeScript for type-safe API contracts
3. **Input Validation**: Validate all inputs using Zod
4. **Error Handling**: Consistent error response format
5. **Authentication**: Secure all endpoints with proper authentication
6. **Documentation**: Document all endpoints with JSDoc comments
7. **Versioning**: Version APIs when making breaking changes

## API Routes

### Authentication

#### `POST /api/auth/register`

Register a new user.

**Request Body:**
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}
```

**Response:**
```typescript
interface RegisterResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request
- 409: Conflict (Email already exists)
- 500: Internal Server Error

#### `POST /api/auth/login`

Log in an existing user.

**Request Body:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### `POST /api/auth/logout`

Log out the current user.

**Request Body:** None

**Response:**
```typescript
interface LogoutResponse {
  success: boolean;
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 500: Internal Server Error

### User Profile

#### `GET /api/users/profile`

Get the current user's profile.

**Request Body:** None

**Response:**
```typescript
interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  profile: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    } | null;
    dateOfBirth: string | null;
    taxId: string | null;
    preferences: Record<string, any>;
  } | null;
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 500: Internal Server Error

#### `PUT /api/users/profile`

Update the current user's profile.

**Request Body:**
```typescript
interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  profile?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    } | null;
    dateOfBirth?: string | null;
    taxId?: string | null;
    preferences?: Record<string, any>;
  };
}
```

**Response:**
```typescript
interface UpdateProfileResponse {
  success: boolean;
  user: UserProfileResponse;
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### Accounts

#### `GET /api/accounts`

Get all accounts for the current user.

**Request Body:** None

**Response:**
```typescript
interface AccountsResponse {
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 500: Internal Server Error

#### `POST /api/accounts`

Create a new account for the current user.

**Request Body:**
```typescript
interface CreateAccountRequest {
  name: string;
  type: string;
  currency: string;
  initialBalance?: number;
}
```

**Response:**
```typescript
interface CreateAccountResponse {
  account: {
    id: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### `GET /api/accounts/:id`

Get a specific account by ID.

**Request Parameters:**
- `id`: Account ID

**Response:**
```typescript
interface AccountResponse {
  account: {
    id: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

#### `PUT /api/accounts/:id`

Update a specific account.

**Request Parameters:**
- `id`: Account ID

**Request Body:**
```typescript
interface UpdateAccountRequest {
  name?: string;
  isActive?: boolean;
}
```

**Response:**
```typescript
interface UpdateAccountResponse {
  success: boolean;
  account: {
    id: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

### Transactions

#### `GET /api/accounts/:accountId/transactions`

Get transactions for a specific account.

**Request Parameters:**
- `accountId`: Account ID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of transactions per page (default: 20)
- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)
- `categoryId`: Filter by category ID

**Response:**
```typescript
interface TransactionsResponse {
  transactions: Array<{
    id: string;
    accountId: string;
    amount: string;
    description: string | null;
    categoryId: string | null;
    category?: {
      id: string;
      name: string;
      type: string;
      icon: string | null;
      color: string | null;
    };
    date: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

#### `POST /api/accounts/:accountId/transactions`

Create a new transaction for a specific account.

**Request Parameters:**
- `accountId`: Account ID

**Request Body:**
```typescript
interface CreateTransactionRequest {
  amount: number;
  description?: string;
  categoryId?: string;
  date: string; // ISO format
}
```

**Response:**
```typescript
interface CreateTransactionResponse {
  transaction: {
    id: string;
    accountId: string;
    amount: string;
    description: string | null;
    categoryId: string | null;
    date: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

#### `GET /api/transactions/:id`

Get a specific transaction by ID.

**Request Parameters:**
- `id`: Transaction ID

**Response:**
```typescript
interface TransactionResponse {
  transaction: {
    id: string;
    accountId: string;
    amount: string;
    description: string | null;
    categoryId: string | null;
    category?: {
      id: string;
      name: string;
      type: string;
      icon: string | null;
      color: string | null;
    };
    date: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

#### `PUT /api/transactions/:id`

Update a specific transaction.

**Request Parameters:**
- `id`: Transaction ID

**Request Body:**
```typescript
interface UpdateTransactionRequest {
  amount?: number;
  description?: string | null;
  categoryId?: string | null;
  date?: string; // ISO format
}
```

**Response:**
```typescript
interface UpdateTransactionResponse {
  success: boolean;
  transaction: {
    id: string;
    accountId: string;
    amount: string;
    description: string | null;
    categoryId: string | null;
    date: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

#### `DELETE /api/transactions/:id`

Delete a specific transaction.

**Request Parameters:**
- `id`: Transaction ID

**Response:**
```typescript
interface DeleteTransactionResponse {
  success: boolean;
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

### Categories

#### `GET /api/categories`

Get all transaction categories.

**Query Parameters:**
- `type`: Filter by category type (income, expense)

**Response:**
```typescript
interface CategoriesResponse {
  categories: Array<{
    id: string;
    name: string;
    type: string;
    icon: string | null;
    color: string | null;
  }>;
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 500: Internal Server Error

### Notifications

#### `GET /api/notifications`

Get notifications for the current user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of notifications per page (default: 20)
- `isRead`: Filter by read status (true, false)

**Response:**
```typescript
interface NotificationsResponse {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 500: Internal Server Error

#### `PUT /api/notifications/:id/read`

Mark a notification as read.

**Request Parameters:**
- `id`: Notification ID

**Response:**
```typescript
interface MarkNotificationReadResponse {
  success: boolean;
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Server Actions

Server Actions are used for form submissions and data mutations directly from React Server Components.

### User Profile Actions

#### `updateUserProfile`

```typescript
'use server';

import { z } from 'zod';

const UpdateProfileSchema = z.object({
  fullName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  profile: z.object({
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
    }).nullable().optional(),
    dateOfBirth: z.string().nullable().optional(),
    taxId: z.string().nullable().optional(),
    preferences: z.record(z.any()).optional(),
  }).optional(),
});

export async function updateUserProfile(formData: FormData) {
  'use server';
  
  // Implementation details
}
```

### Account Actions

#### `createAccount`

```typescript
'use server';

import { z } from 'zod';

const CreateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['checking', 'savings', 'credit', 'investment']),
  currency: z.string().length(3),
  initialBalance: z.number().optional(),
});

export async function createAccount(formData: FormData) {
  'use server';
  
  // Implementation details
}
```

### Transaction Actions

#### `createTransaction`

```typescript
'use server';

import { z } from 'zod';

const CreateTransactionSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.number(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function createTransaction(formData: FormData) {
  'use server';
  
  // Implementation details
}
```

## Error Handling

All API endpoints and Server Actions use a consistent error handling approach:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
```

Common error codes:

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Internal server error

Example error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format"
    }
  }
}
```

## API Versioning

When making breaking changes to the API, we use URL versioning:

```
/api/v1/users/profile
/api/v2/users/profile
```

## Authentication and Authorization

All API endpoints require authentication except for public endpoints like login and register.

Authentication is handled using Supabase Auth with JWT tokens:

1. Client sends JWT token in the `Authorization` header
2. Server validates the token
3. Server checks if the user has permission to access the resource

## Rate Limiting

API rate limiting is implemented to prevent abuse:

- 100 requests per minute per IP address
- 1000 requests per hour per user

## API Documentation

API documentation is generated using OpenAPI/Swagger:

- Available at `/api/docs` in development
- Includes all endpoints, request/response schemas, and examples
- Generated from TypeScript types and JSDoc comments

## External API Integrations

### Payment Processors

Integration with payment processors like Stripe:

- Webhook endpoints for payment events
- API client for payment processing

### Financial Data Providers

Integration with financial data providers:

- API client for fetching financial data
- Scheduled jobs for data synchronization

## API Testing

API endpoints are tested using:

- Unit tests for validation and business logic
- Integration tests for database interactions
- End-to-end tests for complete flows

## API Monitoring

API endpoints are monitored for:

- Performance metrics
- Error rates
- Usage patterns

## Security Considerations

- All endpoints use HTTPS
- Input validation for all parameters
- Authentication and authorization checks
- Rate limiting to prevent abuse
- CSRF protection for form submissions
- Security headers to prevent common attacks 