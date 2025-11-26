# Quick Start Guide

## Getting Started in 3 Steps

### 1. Start the Development Server
```bash
npm run dev
```

The app will start on http://localhost:3000 (or the next available port if 3000 is in use)

### 2. Open Your Browser
Navigate to: **http://localhost:3000**

### 3. Access the Admin Dashboard
Click the **"Go to Admin Dashboard →"** button or navigate directly to:
**http://localhost:3000/admin**

## 🎉 That's it! No login required in demo mode.

---

## What to Test First

### Option 1: Explore Existing Clients
1. Go to http://localhost:3000/admin
2. Click on **"Acme Corporation"**
3. Explore the three tabs:
   - **Account Groups**: See how accounts are grouped and customized
   - **Hierarchy**: View the multi-level structure
   - **Access Control**: See authorized users

### Option 2: Create Your Own Client
1. Go to http://localhost:3000/admin
2. Click **"+ New Client"** button
3. You'll be redirected to manage the new client
4. Start creating account groups, hierarchy, and access control

### Option 3: Test JSON Export
1. Open any client (e.g., Acme Corporation)
2. Click **"Export JSON"** at the top right
3. A JSON file will download
4. See the export preview at the bottom of the page

---

## Key Features Overview

### 📊 Account Groups
- Create groups of accounts
- Override POGO default main group assignments
- Example: Move account 6340 from Group 5 to Group 2

### 🏗️ Hierarchy
- Build multi-level organizational structures
- Assign account groups to hierarchy nodes
- Create parent-child relationships

### 🔐 Access Control
- Add user emails for authorization
- Manage who can view PowerBI reports
- Email validation included

### 💾 Export
- Download complete client configuration as JSON
- Ready for REST API integration
- Includes all groups, hierarchy, and access settings

---

## Sample Data Included

### Pre-loaded Clients:
1. **Acme Corporation** (client-1)
   - 2 account groups
   - 6 accounts with custom grouping
   - 2-level hierarchy
   - 2 authorized users

2. **TechStart Inc** (client-2)
   - 1 account group
   - 2 accounts
   - Single-level hierarchy
   - 1 authorized user

### POGO Accounts Available:
- 4000-4500: Revenue accounts (default Main Group 2)
- 6000-7500: Expense accounts (default Main Group 5)

---

## Testing Checklist

- [ ] View admin dashboard
- [ ] Click on a client to view details
- [ ] Create a new account group
- [ ] Add accounts to a group
- [ ] Change an account's main group
- [ ] Create a hierarchy node
- [ ] Assign account groups to hierarchy
- [ ] Add authorized user emails
- [ ] Save changes
- [ ] Export client as JSON
- [ ] Create a new client from scratch

---

## Need Help?

### Troubleshooting
- **Server won't start**: Make sure no other process is using the port
- **Changes not saving**: Click "Save Changes" button at the top
- **Can't find demo data**: Refresh the page after starting the server

### Documentation
- **Full Testing Guide**: See `DEMO_CREDENTIALS.md`
- **System Documentation**: See `DASHBOARD_README.md`
- **API Endpoints**: See API section in `DEMO_CREDENTIALS.md`

### Quick Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linter
npm run lint
```

---

## Demo Mode Notes

✅ **Authentication is disabled** - No login required  
✅ **All admin pages accessible** - Direct navigation enabled  
✅ **Demo user shown** - "demo@flav.com (Demo Mode)"  
✅ **Full functionality available** - All features work without restrictions  

To re-enable authentication in production, see the "Next Steps" section in `DEMO_CREDENTIALS.md`.

---

## Next Steps

Once you've tested the application:
1. Review the exported JSON structure
2. Check if it meets your REST API requirements
3. Test all CRUD operations via the UI
4. Try the API endpoints directly (see `DEMO_CREDENTIALS.md`)
5. Provide feedback on any additional features needed

**Happy Testing! 🚀**
