# Overview

LogoCraft AI is a modern web application that provides AI-powered logo design services. Users can create professional logos through three main approaches: describing their vision in text, uploading reference images for style analysis, or modifying existing logos. The application uses OpenAI's DALL-E for image generation and implements a credit-based pricing model where users pay only for what they export.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built with **React 18** and **TypeScript**, using **Vite** as the build tool and development server. The UI framework is **shadcn/ui** with **Tailwind CSS** for styling, providing a modern component library with consistent design patterns.

**State Management**: Uses **TanStack React Query** for server state management, caching, and data synchronization. Local component state is managed with React hooks.

**Routing**: Implements **Wouter** for lightweight client-side routing with authentication-based route protection.

**File Uploads**: Integrates **Uppy** for advanced file upload capabilities with progress tracking, preview, and dashboard interface.

## Backend Architecture

The server is built with **Express.js** and **TypeScript**, configured as an ESM (ES Modules) project. The architecture follows a RESTful API design with clear separation of concerns.

**Database Layer**: Uses **Drizzle ORM** with **Neon Database** (serverless PostgreSQL) for data persistence. The schema is shared between client and server using a monorepo structure.

**Authentication**: Implements **Replit Auth** with OpenID Connect (OIDC) for secure user authentication and session management. Sessions are stored in PostgreSQL using connect-pg-simple.

**API Structure**: Routes are organized by functionality (auth, logo generation, file operations) with proper middleware for authentication and error handling.

## Data Storage Solutions

**Primary Database**: PostgreSQL via Neon Database for user data, logo projects, assets, and credit transactions.

**Object Storage**: Google Cloud Storage for file uploads and generated logo assets, with custom ACL (Access Control List) implementation for fine-grained permission management.

**Session Storage**: PostgreSQL-based session store for maintaining user authentication state.

## External Service Integrations

**AI Services**: OpenAI API integration for:
- Logo variation generation using GPT-4o
- Image generation with DALL-E
- Reference image analysis for style extraction
- Logo modification requests

**Cloud Storage**: Google Cloud Storage with Replit sidecar authentication for secure file operations and object management.

**Authentication Provider**: Replit OIDC for user authentication and identity management.

## Key Design Patterns

**Monorepo Structure**: Shared TypeScript schemas and types between client and server in the `/shared` directory.

**Type Safety**: End-to-end TypeScript with Zod schemas for runtime validation and type generation.

**Credit System**: Implements a credit-based economy where users receive free credits and can purchase additional ones for logo exports.

**File Management**: Custom object storage service with ACL policies for controlling access to user-generated content.

**Error Handling**: Centralized error handling with proper HTTP status codes and user-friendly error messages.

# External Dependencies

## Core Framework Dependencies
- **React 18** with TypeScript for the frontend framework
- **Express.js** for the backend server framework
- **Vite** for build tooling and development server

## Database and ORM
- **Drizzle ORM** for type-safe database operations
- **Neon Database** (serverless PostgreSQL) as the primary database
- **@neondatabase/serverless** for database connectivity

## Authentication
- **Replit Auth** with OpenID Connect for user authentication
- **Passport.js** with openid-client strategy for OAuth integration
- **express-session** with connect-pg-simple for session management

## AI and Image Processing
- **OpenAI API** for GPT-4o text generation and DALL-E image generation
- Custom integration for logo variation generation and reference analysis

## File Storage and Upload
- **Google Cloud Storage** for object storage with Replit sidecar authentication
- **Uppy** (@uppy/core, @uppy/dashboard, @uppy/aws-s3) for file upload interface and management

## UI and Styling
- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **Lucide React** for iconography

## State Management and Data Fetching
- **TanStack React Query** for server state management and caching
- **React Hook Form** with **@hookform/resolvers** for form handling

## Development and Build Tools
- **TypeScript** for type safety across the stack
- **ESBuild** for server-side bundling
- **PostCSS** with Autoprefixer for CSS processing
- **Zod** for schema validation and type generation