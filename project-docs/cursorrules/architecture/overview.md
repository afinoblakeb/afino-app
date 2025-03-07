# Project Architecture Overview

This document provides a high-level overview of the Afino fintech platform's architecture, explaining the key components, their interactions, and the design decisions behind them.

## System Architecture

Afino is built as a modern full-stack web application with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Next.js App                           │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │  React Client   │    │ Server Components│   │  API     │ │
│  │  Components     │◄──►│ & Server Actions │◄──►│  Routes  │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│                                                      │      │
└──────────────────────────────────────────────────────┼──────┘
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │  PostgreSQL     │    │  Authentication  │    │  Storage │ │
│  │  Database       │    │  & Authorization │    │  Bucket  │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Next.js Application**
   - **Client Components**: Interactive UI components rendered in the browser
   - **Server Components**: Components rendered on the server for improved performance and SEO
   - **Server Actions**: Server-side functions for handling form submissions and data mutations
   - **API Routes**: RESTful endpoints for client-server communication

2. **Supabase Backend**
   - **PostgreSQL Database**: Stores all application data
   - **Authentication**: Handles user authentication and session management
   - **Authorization**: Row-level security for data access control
   - **Storage**: File storage for documents and media

## Application Architecture

### Frontend Architecture

The frontend follows a component-based architecture using React and Next.js:

```
┌─────────────────────────────────────────────────────────────┐
│                     Application                             │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │     Pages       │    │   Components    │    │  Hooks   │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │     Layouts     │    │     Context     │    │ Utilities │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Key Frontend Patterns

1. **Component Hierarchy**
   - UI Components: Reusable, presentational components
   - Feature Components: Domain-specific components
   - Page Components: Top-level components representing routes

2. **State Management**
   - Local State: React's `useState` and `useReducer` hooks
   - Global State: React Context API and Zustand
   - Server State: SWR or React Query for data fetching and caching

3. **Routing**
   - Next.js App Router for file-based routing
   - Dynamic routes for resource-based pages
   - Route groups for organizing related routes

### Backend Architecture

The backend leverages Supabase and Next.js API routes:

```
┌─────────────────────────────────────────────────────────────┐
│                     Backend Services                        │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │  Authentication │    │  Data Access    │    │ Business │ │
│  │     Service     │    │     Layer       │    │  Logic   │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │   API Routes    │    │  Server Actions │    │ External │ │
│  │                 │    │                 │    │   APIs   │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Key Backend Patterns

1. **Data Access Layer**
   - Supabase client for database operations
   - Type-safe database queries
   - Repository pattern for data access

2. **Authentication & Authorization**
   - Supabase Auth for user authentication
   - Row-level security policies for data access control
   - Role-based access control for features

3. **API Design**
   - RESTful API endpoints
   - Input validation with Zod
   - Consistent error handling

## Database Architecture

The database is designed with the following key entities:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │       │   Accounts  │       │Transactions │
│             │◄─────►│             │◄─────►│             │
└─────────────┘       └─────────────┘       └─────────────┘
                            ▲                      ▲
                            │                      │
                            │                      │
                            ▼                      │
                      ┌─────────────┐             │
                      │  Categories │             │
                      │             │◄────────────┘
                      └─────────────┘
```

For detailed database schema information, see [Database Schema](./database_schema.md).

## Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Next.js │     │ Supabase │     │ Database │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ Sign In Request│                │                │
     │───────────────►│                │                │
     │                │ Auth Request   │                │
     │                │───────────────►│                │
     │                │                │ Verify User    │
     │                │                │───────────────►│
     │                │                │ User Data      │
     │                │                │◄───────────────│
     │                │ Auth Token     │                │
     │                │◄───────────────│                │
     │ Auth Token     │                │                │
     │◄───────────────│                │                │
     │                │                │                │
```

## Deployment Architecture

Afino is deployed on Vercel with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel CI/CD Pipeline                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Platform                         │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────┐ │
│  │  Edge Network   │    │ Serverless      │    │ Preview  │ │
│  │  & CDN          │    │ Functions       │    │ Deploys  │ │
│  └─────────────────┘    └─────────────────┘    └──────────┘ │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Platform                       │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

Security is a top priority for Afino as a fintech platform:

1. **Authentication Security**
   - Multi-factor authentication
   - Session management
   - Password policies

2. **Data Security**
   - Encryption at rest and in transit
   - Row-level security in the database
   - Secure API access

3. **Application Security**
   - Input validation
   - CSRF protection
   - XSS prevention
   - Rate limiting

For more details on security measures, see [Security Guidelines](../guidelines/security_guidelines.md).

## Performance Considerations

1. **Frontend Performance**
   - Server components for improved initial load
   - Code splitting and lazy loading
   - Image optimization
   - Caching strategies

2. **Backend Performance**
   - Efficient database queries
   - Connection pooling
   - Edge functions for low-latency APIs
   - Caching with SWR or React Query

3. **Database Performance**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Database scaling

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless application design
   - Serverless architecture
   - Edge network distribution

2. **Database Scaling**
   - Read replicas for read-heavy workloads
   - Connection pooling
   - Efficient query design

3. **Caching Strategy**
   - Client-side caching
   - CDN caching
   - Database query caching

## Monitoring and Observability

1. **Application Monitoring**
   - Error tracking
   - Performance monitoring
   - User behavior analytics

2. **Infrastructure Monitoring**
   - Server metrics
   - Database metrics
   - API performance

3. **Logging and Tracing**
   - Structured logging
   - Distributed tracing
   - Audit logging for financial transactions

## Disaster Recovery

1. **Backup Strategy**
   - Regular database backups
   - Point-in-time recovery
   - Geo-redundant storage

2. **High Availability**
   - Multi-region deployment
   - Automatic failover
   - Load balancing

3. **Incident Response**
   - Monitoring and alerting
   - Runbooks for common issues
   - Escalation procedures

## Development Workflow

For information on the development workflow, see [Development Workflow](../workflows/development_workflow.md). 