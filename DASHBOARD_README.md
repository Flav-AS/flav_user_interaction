# FLAV PowerBI Dashboard System

A comprehensive dashboard system for managing client configurations, account grouping, and access control for PowerBI reports from the POGO platform.

## Overview

This system allows FLAV employees to:
1. Manage multiple clients
2. Create flexible account groups with custom main group assignments
3. Build multi-level hierarchies for organizing account groups
4. Control user access to PowerBI reports via email authorization
5. Export client configurations as JSON for REST API integration

## Requirements Implemented

### ✅ Requirement 1: FLAV Admin Page
- **Location**: `/admin`
- **Features**:
  - Protected by Entra ID authentication
  - Lists all clients with summary information
  - Allows navigation to individual client admin pages
  - Shows account counts and authorized user counts

### ✅ Requirement 2: Client Admin Page
- **Location**: `/admin/clients/[id]`
- **Features**:
  - Three-tabbed interface for managing different aspects
  - Save changes functionality
  - Export to JSON functionality

### ✅ Requirement 3: Account Grouping
- **Tab**: Account Groups
- **Features**:
  - Create custom account groups with names
  - Add POGO accounts to groups
  - Override default POGO main group assignments
  - Default POGO rules:
    - Accounts 4000-4999 → Main Group 2
    - Accounts 6000-7999 → Main Group 5
  - Custom assignment: e.g., account 6340 can be moved to Main Group 2
  - Account names fetched from mock POGO data (ready for API integration)

### ✅ Requirement 4: JSON Export
- **API Endpoint**: `/api/clients/[id]/export`
- **Features**:
  - Exports complete client configuration
  - Includes account groups with main group assignments
  - Includes hierarchy structure
  - Includes authorized emails
  - Downloadable as JSON file
  - Ready to send to REST endpoint

### ✅ Requirement 5: User Access Rights
- **Tab**: Access Control
- **Features**:
  - Add authorized user emails
  - Remove user access
  - Email validation
  - Visual list of all authorized users

## Architecture

### Data Structure

```typescript
Client {
  id: string
  name: string
  accountGroups: AccountGroup[]
  groupHierarchy: GroupHierarchy[]
  authorizedEmails: string[]
  createdAt: string
  updatedAt: string
}

AccountGroup {
  id: string
  name: string
  accounts: Account[]
}

Account {
  id: string
  accountNumber: number
  accountName: string
  customMainGroup?: number  // Overrides POGO default
}

GroupHierarchy {
  id: string
  name: string
  level: number
  parentId?: string
  children?: GroupHierarchy[]
  accountGroupIds?: string[]
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | Get all clients (summaries) |
| POST | `/api/clients` | Create new client |
| GET | `/api/clients/[id]` | Get single client |
| PUT | `/api/clients/[id]` | Update client |
| DELETE | `/api/clients/[id]` | Delete client |
| GET | `/api/clients/[id]/export` | Export client as JSON |
| GET | `/api/pogo/accounts` | Get POGO accounts |

### Pages & Routes

- `/` - Home page with overview
- `/login` - Authentication page
- `/admin` - FLAV admin dashboard (protected)
- `/admin/clients/[id]` - Client admin page (protected)

## Key Features

### Account Group Manager
- Create and manage account groups
- Select accounts from POGO
- Customize main group assignments
- Visual indication of custom vs default groupings

### Hierarchy Manager
- Build multi-level hierarchies
- Drag-free tree structure
- Assign account groups to hierarchy nodes
- Named levels for flexibility

### Access Control Manager
- Email-based authorization
- Add/remove users
- Email validation
- Visual user list

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5 with Microsoft Entra ID
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Data**: In-memory storage (ready for database integration)

## Getting Started

### Prerequisites
- Node.js 20+
- Microsoft Entra ID app registration

### Environment Variables
Create a `.env.local` file with:
```
AUTH_SECRET=your_secret
AUTH_MICROSOFT_ENTRA_ID_ID=your_client_id
AUTH_MICROSOFT_ENTRA_ID_SECRET=your_client_secret
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=your_tenant_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Visit `http://localhost:3000`

### Build
```bash
npm run build
npm start
```

## Mock Data

The system includes mock data for demonstration:
- 2 sample clients (Acme Corporation, TechStart Inc)
- 8 POGO accounts with various account numbers
- Pre-configured account groups and hierarchies

## Integration Points

### POGO Platform Integration
Currently using mock data. To integrate with real POGO:
1. Update `/lib/mockData.ts` to fetch from POGO API
2. Implement authentication with POGO
3. Update account fetching logic in `dataService.getPogoAccounts()`

### Database Integration
Currently using in-memory storage. To integrate with a database:
1. Replace `dataService` in `/lib/mockData.ts` with database queries
2. Use Prisma, Drizzle, or your preferred ORM
3. Update API routes to use database service

### PowerBI Integration
The export endpoint provides JSON ready for PowerBI configuration:
```json
{
  "client": { "id": "...", "name": "..." },
  "accountGroups": [...],
  "hierarchy": [...],
  "authorizedEmails": [...],
  "exportedAt": "2025-11-25T..."
}
```

## Security

- All admin routes protected by Entra ID authentication
- Middleware enforces authentication for `/admin/*` routes
- Email validation for access control
- Session-based authentication

## Future Enhancements

- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Real POGO API integration
- [ ] Bulk import/export
- [ ] Audit logging
- [ ] User roles (FLAV admin vs Client admin)
- [ ] PowerBI embedding
- [ ] Advanced search and filtering
- [ ] Drag-and-drop hierarchy builder

## Support

For questions or issues, contact the FLAV development team.
