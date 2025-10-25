# Medifix-FSM RBAC System

A modern Role-Based Access Control (RBAC) system built with Next.js, integrating with an Express backend for user authentication and authorization.

## Features

- **Authentication**: Email/password and Google OAuth login
- **User Management**: Create, read, update, and delete users
- **Role Management**: Define and manage user roles with granular permissions
- **Permission Management**: Create and assign permissions to roles
- **RBAC**: Fine-grained access control based on user roles and permissions
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Modern UI**: Clean, professional design using Shadcn UI components

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript
- **UI Components**: Shadcn UI, Tailwind CSS
- **Authentication**: JWT, Google OAuth (@react-oauth/google)
- **Backend API**: Express.js with Prisma ORM (running separately)

## Prerequisites

1. Backend API running at `http://localhost:4000`
2. Node.js 18+ installed
3. Google OAuth Client ID (for Google login)

## Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Update the Google Client ID in `.env`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```

## Backend Setup

Make sure your backend is running with the provided:
- Prisma schema (MySQL database)
- Express server on port 4000
- Seed data with admin user and roles

Default admin credentials (from seed):
- Email: `admin@medifix.com`
- Password: `admin123`

## Application Structure

```
/app                    # Next.js pages (App Router)
  /dashboard           # Main dashboard
  /login               # Login page
  /users               # User management
  /roles               # Role management
  /permissions         # Permission management
/components            # Reusable UI components
  /ui                  # Shadcn UI components
/contexts              # React contexts (AuthContext)
/lib                   # Utilities and API functions
  api.ts              # API integration functions
  types.ts            # TypeScript type definitions
  utils.ts            # Utility functions
/wrappers              # Layout wrappers
  DashboardLayout.tsx # Main dashboard layout
```

## Key Features Implementation

### Authentication
- JWT-based authentication stored in localStorage
- Google OAuth integration for single sign-on
- Automatic redirect to login if not authenticated
- Persistent user session across page refreshes

### Authorization (RBAC)
- Permission-based access control
- Route protection using React Context
- Hierarchical permissions (e.g., view < create < edit < delete)
- Role assignment with multiple permissions
- "all_permissions" super-admin capability

### User Management
- Create users with email/password and role assignment
- Edit user details and change roles
- Delete users (soft delete on backend)
- View user details with all permissions
- Quick role creation from user dialog

### Role Management
- Create roles with custom permission sets
- Edit existing roles and update permissions
- Delete roles
- View role details with assigned permissions
- Permission grouping by entity

### Permission Management
- Create new permissions
- Edit permission details
- Delete permissions
- View all permissions in the system

## API Endpoints Used

### Authentication
- `POST /users/login` - Email/password login
- `POST /users/google-login` - Google OAuth login

### Users
- `GET /users` - Fetch all users
- `GET /users/:id` - Fetch single user
- `POST /users` - Create user (requires `manage_users`)
- `PUT /users/:id` - Update user (requires `manage_users`)
- `DELETE /users/:id` - Delete user (requires `manage_users`)

### Roles
- `GET /roles` - Fetch all roles
- `GET /roles/:id` - Fetch single role
- `POST /roles` - Create role (requires `manage_roles`)
- `PUT /roles/:id` - Update role (requires `manage_roles`)
- `DELETE /roles/:id` - Delete role (requires `manage_roles`)

### Permissions
- `GET /permissions` - Fetch all permissions
- `GET /permissions/:id` - Fetch single permission
- `POST /permissions` - Create permission (requires `manage_permissions`)
- `PUT /permissions/:id` - Update permission (requires `manage_permissions`)
- `DELETE /permissions/:id` - Delete permission (requires `manage_permissions`)

## Design System

### Colors
- Primary: Purple (#6B46C1) - Used for branding and primary actions
- Background: Beige (#F5F5DC) - Warm, professional background
- Accent: Various shades for states and feedback

### Typography
- Font: Inter (sans-serif)
- Clean, readable hierarchy
- Responsive font sizes

### Components
- Cards for content grouping
- Tables for data display
- Dialogs for forms and details
- Badges for status indicators
- Buttons with consistent styling

## Security Considerations

- JWT tokens stored in localStorage
- Authorization headers on all API requests
- Permission checks on both frontend and backend
- Route protection with automatic redirects
- Soft deletes to preserve data integrity

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - Medifix-FSM Internal Use Only
