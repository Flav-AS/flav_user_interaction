# Demo Credentials & Testing Guide

## Demo Mode

The application is now running in **demo mode** with authentication restrictions removed for easy testing.

## Quick Access

### Direct URLs
- **Home Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Sample Client (Acme Corp)**: http://localhost:3000/admin/clients/client-1
- **Sample Client (TechStart)**: http://localhost:3000/admin/clients/client-2

### Demo User Info
When in demo mode, the system shows:
- **Email**: demo@flav.com
- **Mode**: Demo Mode (no actual authentication required)

## Testing the Full Application

### 1. Home Page
Navigate to http://localhost:3000
- View the landing page with feature overview
- Click "Go to Admin Dashboard" to access the admin area

### 2. FLAV Admin Dashboard
URL: http://localhost:3000/admin

**Features to Test:**
- View list of all clients
- See client summaries (account count, authorized users)
- Click on a client to manage it
- Create new clients using the "+ New Client" button

### 3. Client Admin Page
URL: http://localhost:3000/admin/clients/client-1

#### Tab 1: Account Groups (Requirement 3)
**Test the following:**

1. **Create a new account group**
   - Enter a name like "Operating Expenses"
   - Click "Create Group"
   - The group appears in the left panel

2. **Add accounts to a group**
   - Click on a group to select it
   - Use the dropdown to add POGO accounts
   - Accounts 4000-4999 default to Main Group 2
   - Accounts 6000-7999 default to Main Group 5

3. **Override default main groups**
   - Select an account in a group
   - Change its main group using the dropdown
   - Example: Move account 6340 from Main Group 5 to Main Group 2
   - See the "Custom" indicator appear

4. **Remove accounts**
   - Click "Remove" on any account in a group

5. **Delete groups**
   - Click "Delete" on any account group

#### Tab 2: Hierarchy (Multi-level structure)
**Test the following:**

1. **Create root-level hierarchy node**
   - Enter name like "Financial Reports"
   - Leave Parent as "Root Level"
   - Click "Create Node"

2. **Create child nodes**
   - Enter name like "Income Statement"
   - Select a parent from the dropdown
   - Click "Create Node"
   - See the tree structure update with indentation

3. **Assign account groups to hierarchy nodes**
   - Click on a hierarchy node in the tree
   - In the right panel, check/uncheck account groups
   - See the count update in the tree

4. **Delete hierarchy nodes**
   - Click "Delete" on any node
   - Confirm the warning (deletes children too)

#### Tab 3: Access Control (Requirement 5)
**Test the following:**

1. **Add authorized users**
   - Enter email: john.doe@company.com
   - Press Enter or click "Add User"
   - See the user appear in the list

2. **Add multiple users**
   - Test with: jane@company.com, admin@company.com
   - Each appears with a user icon and details

3. **Test email validation**
   - Try entering invalid emails (no @, no domain)
   - Should show validation error

4. **Remove users**
   - Click "Remove" on any user
   - Confirm the action

### 4. Save & Export (Requirement 4)

1. **Save changes**
   - Make any changes in any tab
   - Click "Save Changes" button at the top
   - Should see success message

2. **Export JSON**
   - Click "Export JSON" button
   - JSON file downloads automatically
   - Preview appears at bottom of page
   - Open the JSON file to verify structure

**Expected JSON structure:**
```json
{
  "client": {
    "id": "client-1",
    "name": "Acme Corporation"
  },
  "accountGroups": [
    {
      "id": "ag-1",
      "name": "Revenue Accounts",
      "accounts": [
        {
          "accountNumber": 4000,
          "accountName": "Revenue - Product Sales",
          "mainGroup": 2
        }
      ]
    }
  ],
  "hierarchy": [...],
  "authorizedEmails": [...],
  "exportedAt": "2025-11-25T..."
}
```

## Sample Test Scenarios

### Scenario 1: Create a New Client from Scratch
1. Go to Admin Dashboard
2. Click "+ New Client"
3. Create account groups
4. Add POGO accounts
5. Customize main groups
6. Build hierarchy
7. Add authorized users
8. Save and export

### Scenario 2: Override POGO Default Grouping
1. Open client-1 (Acme Corporation)
2. Go to Account Groups tab
3. Create group "Marketing Expenses"
4. Add account 6340 (defaults to Main Group 5)
5. Change it to Main Group 2
6. See "Custom" indicator
7. Save changes
8. Export and verify in JSON

### Scenario 3: Build Multi-Level Hierarchy
1. Open client-1
2. Go to Hierarchy tab
3. Create "Company Reports" (Level 1)
4. Create "Financial" as child (Level 2)
5. Create "Revenue Analysis" as child of Financial (Level 3)
6. Assign account groups to each level
7. See the tree structure visualize the levels

### Scenario 4: Manage User Access
1. Open client-2 (TechStart)
2. Go to Access Control tab
3. Add 5 different user emails
4. Verify all appear in the list
5. Remove 2 users
6. Save changes
7. Export and verify authorized emails in JSON

## API Testing

### Using cURL or Postman

**Get all clients:**
```bash
curl http://localhost:3000/api/clients
```

**Get single client:**
```bash
curl http://localhost:3000/api/clients/client-1
```

**Export client:**
```bash
curl http://localhost:3000/api/clients/client-1/export
```

**Create new client:**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client"}'
```

**Update client:**
```bash
curl -X PUT http://localhost:3000/api/clients/client-1 \
  -H "Content-Type: application/json" \
  -d '{"authorizedEmails":["new@email.com"]}'
```

**Get POGO accounts:**
```bash
curl http://localhost:3000/api/pogo/accounts
```

## Pre-loaded Demo Data

### Client 1: Acme Corporation
- **Account Groups**: 2 groups (Revenue Accounts, Expense Accounts)
- **Accounts**: 6 accounts total
- **Special**: Account 6340 is customized to Main Group 2 (normally would be Group 5)
- **Hierarchy**: 2-level structure (Financial Overview → Income Statement)
- **Authorized Users**: 2 emails

### Client 2: TechStart Inc
- **Account Groups**: 1 group (All Revenue)
- **Accounts**: 2 accounts
- **Hierarchy**: Single level (Company Reports)
- **Authorized Users**: 1 email

### POGO Accounts (Mock Data)
- 4000 - Revenue - Product Sales
- 4100 - Revenue - Service Income
- 4500 - Revenue - Other
- 6000 - Operating Expenses - Rent
- 6100 - Operating Expenses - Utilities
- 6340 - Operating Expenses - Marketing
- 7000 - Administrative Expenses
- 7500 - Depreciation

## Troubleshooting

### Issue: Can't access admin pages
- The app is now in demo mode - no login required
- Just navigate directly to /admin

### Issue: Changes not saving
- Check browser console for errors
- Ensure you clicked "Save Changes" button
- Refresh the page and verify

### Issue: Export not working
- Click "Export JSON" button
- Check browser downloads folder
- Preview should appear at bottom of page

### Issue: Port already in use
```bash
# Stop existing processes
Get-Process -Name node | Stop-Process -Force

# Restart dev server
npm run dev
```

## Notes

- All data is stored in-memory (resets on server restart)
- Account names are mocked (ready for POGO API integration)
- Authentication is disabled for demo purposes
- In production, enable Entra ID authentication by updating middleware

## Next Steps

To re-enable authentication:
1. Update `middleware.ts` to protect `/admin` routes
2. Configure Entra ID environment variables
3. Update admin page to require authentication
