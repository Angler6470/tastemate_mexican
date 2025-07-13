# TasteMate - AI-Powered Food Recommendation App

## Overview

TasteMate is a full-stack web application that provides AI-powered food recommendations based on user preferences. The app features a modern, responsive design with internationalization support (English/Spanish), dynamic theming, and an admin dashboard for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Context API for theme and authentication
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Custom i18n hook with JSON translation files

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM (successfully migrated from MongoDB)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Design**: RESTful API with proper error handling
- **External AI Integration**: OpenAI API for food recommendations
- **Development**: TypeScript with hot reloading support

## Key Components

### Frontend Components
- **Header**: Navigation with language toggle, theme switcher, and admin access
- **PromoCarousel**: Auto-rotating promotional content with image support
- **SpiceSlider**: Interactive spice level selector with visual feedback
- **FlavorPills**: Multi-select flavor preference buttons with emojis
- **ChatInterface**: AI-powered chat for food recommendations
- **RecommendationsList**: Dynamic display of recommended menu items
- **AdminTabs**: Full CRUD interface for managing app content

### Backend Services
- **Storage Layer**: PostgreSQL database operations with Drizzle ORM type safety
- **Authentication Middleware**: JWT token validation and role-based access
- **OpenAI Service**: AI-powered recommendation generation
- **Database Integration**: PostgreSQL connection with auto-seeding capabilities

### Database Schema
- **Users**: Admin authentication with role-based access
- **Flavors**: Categorized taste preferences with translations
- **Spiciness**: Configurable spice levels with emoji representations
- **MenuItems**: Restaurant items with multilingual descriptions
- **Promos**: Rotating promotional content with images
- **Themes**: Customizable color schemes and visual themes
- **Hotkeys**: Keyboard shortcuts for improved UX

## Data Flow

1. **User Interaction**: Users select spice preferences and flavors through interactive UI components
2. **AI Processing**: User input is sent to OpenAI API for intelligent food matching
3. **Recommendation Generation**: AI analyzes preferences against menu database
4. **Real-time Updates**: TanStack Query manages cache invalidation and live updates
5. **Admin Management**: CRUD operations immediately reflect in user interface

## External Dependencies

### Development Dependencies
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Runtime Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **Backend Libraries**: Express, JWT, bcrypt, MongoDB driver
- **AI Integration**: OpenAI API client
- **Database**: Drizzle ORM with PostgreSQL adapter

### Third-party Integrations
- **OpenAI API**: GPT-4 for intelligent food recommendations
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment with built-in deployment

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API
- **Hot Reloading**: Full-stack development with instant updates
- **Environment Variables**: Secure configuration management
- **Database Seeding**: Automatic sample data generation

### Production Deployment
- **Build Process**: Vite builds optimized static assets
- **Server Bundle**: ESBuild creates production server bundle
- **Static Serving**: Express serves built React application
- **Environment Configuration**: Production-ready environment variables

### Replit Integration
- **Secrets Management**: Secure environment variable storage
- **Auto-deployment**: Continuous deployment from repository
- **Development Banner**: Replit-specific development tooling
- **Database Provisioning**: Automated PostgreSQL setup

The application is designed to be fully functional both locally and on Replit, with fallback mechanisms for database connectivity and comprehensive error handling throughout the stack.