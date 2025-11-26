# User Interface Guide

## Page-by-Page Visual Description

### 🏠 Home Page (`/`)

**Layout**: Centered, full-height landing page

```
┌─────────────────────────────────────────┐
│                                         │
│        FLAV PowerBI Dashboard          │
│                                         │
│   Manage client configurations,        │
│   account grouping, and access         │
│   control for PowerBI reports          │
│                                         │
│    ┌─────────────────────────────┐     │
│    │  Go to Admin Dashboard →   │     │
│    └─────────────────────────────┘     │
│                                         │
│      Running in Demo Mode               │
│  No authentication required             │
│                                         │
│  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │  01   │  │  02   │  │  03   │       │
│  │Manage │  │Group  │  │Control│       │
│  │Clients│  │Accounts│ │Access │       │
│  └───────┘  └───────┘  └───────┘       │
│                                         │
└─────────────────────────────────────────┘
```

**Features**:
- Large hero heading with system description
- Prominent "Go to Admin Dashboard" button (blue)
- Demo mode indicator
- Three feature cards explaining main capabilities

---

### 📊 FLAV Admin Dashboard (`/admin`)

**Layout**: Full page with header and client list

```
┌──────────────────────────────────────────────────┐
│  FLAV Admin Dashboard                            │
│  Manage client configurations and access control │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Clients                    [+ New Client] │ │
│  │  Select a client to manage...              │ │
│  ├────────────────────────────────────────────┤ │
│  │  > Acme Corporation               →        │ │
│  │    📄 6 accounts  👥 2 authorized users    │ │
│  │    Updated Nov 20, 2025                    │ │
│  ├────────────────────────────────────────────┤ │
│  │  > TechStart Inc                  →        │ │
│  │    📄 2 accounts  👥 1 authorized user     │ │
│  │    Updated Nov 22, 2025                    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Logged in as: demo@flav.com (Demo Mode)         │
└──────────────────────────────────────────────────┘
```

**Features**:
- Header with page title and description
- "New Client" button (blue, top right)
- Clickable client cards with hover effects
- Each card shows:
  - Client name (blue, large)
  - Account count with icon
  - Authorized user count with icon
  - Last updated date
  - Arrow indicating clickability
- Footer showing logged-in user

---

### 🔧 Client Admin Page (`/admin/clients/[id]`)

**Layout**: Full page with tabs and content area

```
┌──────────────────────────────────────────────────────┐
│  ← Back to Admin Dashboard                           │
│                                                       │
│  Acme Corporation                [Export] [Save]     │
│  Client ID: client-1                                 │
│                                                       │
│  ┌─────────────┬──────────┬─────────────┐           │
│  │Account Groups│ Hierarchy│Access Control│          │
│  └─────────────┴──────────┴─────────────┘           │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │                                              │    │
│  │         [Tab Content Here]                   │    │
│  │                                              │    │
│  │                                              │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  [Export Preview - if exported]                      │
└──────────────────────────────────────────────────────┘
```

**Header Features**:
- Back link to admin dashboard
- Client name (large, bold)
- Client ID (small, gray)
- Export JSON button (white with border)
- Save Changes button (blue)

**Tab Navigation**:
- Three tabs: Account Groups, Hierarchy, Access Control
- Active tab highlighted in blue
- Inactive tabs gray with hover effect

---

### 📑 Tab 1: Account Groups

**Layout**: Two-column split view

```
┌────────────────────────────────────────────────┐
│  Account Groups                                │
│  Create groups of accounts and assign...       │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  [Enter group name...] [Create Group]   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────┐  ┌─────────────────────┐   │
│  │ Account      │  │ Revenue Accounts     │   │
│  │ Groups       │  │ - Accounts           │   │
│  │              │  │                      │   │
│  │ ┌──────────┐ │  │ [Add account...▼]   │   │
│  │ │Revenue   │ │  │                      │   │
│  │ │Accounts  │ │  │ ┌─────────────────┐ │   │
│  │ │6 accounts│ │  │ │4000              │ │   │
│  │ └──────────┘ │  │ │Product Sales     │ │   │
│  │              │  │ │Main Group: [2▼] │ │   │
│  │ ┌──────────┐ │  │ └─────────────────┘ │   │
│  │ │Expenses  │ │  │                      │   │
│  │ │3 accounts│ │  │ ┌─────────────────┐ │   │
│  │ └──────────┘ │  │ │6340              │ │   │
│  │              │  │ │Marketing         │ │   │
│  └──────────────┘  │ │Main Group: [2▼] │ │   │
│                    │ │🔹 Custom         │ │   │
│                    │ └─────────────────┘ │   │
│                    └─────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Left Panel**:
- List of all account groups
- Click to select (highlights in blue)
- Shows account count per group
- Delete button per group

**Right Panel**:
- Shows selected group's accounts
- Dropdown to add new accounts
- Each account shows:
  - Account number
  - Account name
  - Main group dropdown (1-10)
  - "Custom" badge if overridden
  - Remove button

---

### 🌳 Tab 2: Hierarchy

**Layout**: Two-column split view

```
┌────────────────────────────────────────────────┐
│  Group Hierarchy                               │
│  Create multiple levels of hierarchy...        │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  [Enter node name...]                   │ │
│  │  Parent: [Root Level ▼]                 │ │
│  │  [Create Node]                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────┐  ┌─────────────────────┐   │
│  │ Hierarchy    │  │ Financial Overview   │   │
│  │ Tree         │  │ - Account Groups     │   │
│  │              │  │                      │   │
│  │ ┌──────────┐ │  │ Select groups:       │   │
│  │ │Lvl 1     │ │  │                      │   │
│  │ │Financial │ │  │ ☑ Revenue Accounts  │   │
│  │ │Overview  │ │  │ ☑ Expense Accounts  │   │
│  │ │2 groups  │ │  │ ☐ Other Group       │   │
│  │ └──────────┘ │  │                      │   │
│  │   ┌────────┐ │  │                      │   │
│  │   │Lvl 2   │ │  │                      │   │
│  │   │Income  │ │  │                      │   │
│  │   │2 groups│ │  │                      │   │
│  │   └────────┘ │  │                      │   │
│  └──────────────┘  └─────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Left Panel**:
- Tree visualization with indentation
- Shows level number and name
- Account group count per node
- Click to select (highlights in blue)
- Delete button per node

**Right Panel**:
- Shows selected node details
- Checkboxes for account groups
- Check/uncheck to assign groups
- Real-time count update in tree

---

### 🔐 Tab 3: Access Control

**Layout**: Single column with list

```
┌────────────────────────────────────────────────┐
│  Access Control                                │
│  Manage which users have access to view...     │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Add Authorized User                    │ │
│  │  [user@company.com] [Add User]          │ │
│  │  Press Enter or click "Add User"         │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Authorized Users (2)                          │
│  ┌──────────────────────────────────────────┐ │
│  │  👤  john.doe@acme.com         [Remove] │ │
│  │      Has access to view PowerBI reports  │ │
│  ├──────────────────────────────────────────┤ │
│  │  👤  jane.smith@acme.com       [Remove] │ │
│  │      Has access to view PowerBI reports  │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ℹ️  Access Information                        │
│  Users with authorized email addresses will   │
│  be able to view PowerBI reports for this     │
│  client after logging in...                   │
└────────────────────────────────────────────────┘
```

**Features**:
- Email input field with Add button
- List of authorized users with:
  - User avatar icon (blue circle)
  - Email address
  - Access description
  - Remove button (red)
- Information panel at bottom (blue background)

---

## Color Scheme

### Primary Colors
- **Blue**: `#2563eb` (buttons, active states, links)
- **Gray-50**: `#f9fafb` (backgrounds)
- **Gray-900**: `#111827` (primary text)
- **Gray-600**: `#4b5563` (secondary text)
- **Gray-300**: `#d1d5db` (borders)

### Status Colors
- **Red**: `#dc2626` (delete, remove actions)
- **Green**: `#16a34a` (success states)
- **Blue-50**: `#eff6ff` (selected/highlighted backgrounds)

### Interactive States
- **Hover**: Slightly darker shade + cursor pointer
- **Focus**: Blue ring (`ring-2 ring-blue-500`)
- **Disabled**: 50% opacity

---

## Typography

### Headings
- **H1**: 48px, bold (page titles)
- **H2**: 30px, semibold (section titles)
- **H3**: 24px, medium (subsection titles)

### Body Text
- **Regular**: 16px (main content)
- **Small**: 14px (descriptions, metadata)
- **Extra Small**: 12px (helper text, labels)

### Font Family
- Sans-serif system font stack (Arial, Helvetica)

---

## Responsive Design

### Desktop (> 1024px)
- Two-column layouts for Account Groups and Hierarchy
- Full-width content areas
- All features visible

### Tablet (768px - 1024px)
- Maintained two-column layouts with adjusted spacing
- Slightly reduced padding

### Mobile (< 768px)
- Single-column layouts
- Stacked panels
- Full-width buttons
- Reduced text sizes

---

## Interactive Elements

### Buttons
- **Primary**: Blue background, white text, rounded corners
- **Secondary**: White background, gray border, gray text
- **Danger**: Red text, hover red background

### Cards
- White background
- Gray border
- Shadow on hover
- Rounded corners (8px)

### Forms
- Input fields: Gray border, blue focus ring
- Dropdowns: Gray border, blue focus ring
- Checkboxes: Blue when checked

### Lists
- Hover effect: Light gray background
- Dividers: Light gray lines
- Click feedback: Brief highlight

---

## Empty States

All tabs include helpful empty states when no data exists:

```
┌─────────────────────────────────┐
│                                 │
│   No items yet. Get started    │
│   by creating your first one    │
│   using the form above.         │
│                                 │
└─────────────────────────────────┘
```

- Dashed border
- Gray text
- Centered content
- Encouraging message

---

## Icons

### Used Throughout
- 📄 Document icon (account count)
- 👥 Users icon (authorized users)
- → Arrow right (navigation)
- 🔹 Custom badge indicator
- ℹ️ Information icon
- ☑ Checkbox selected
- ☐ Checkbox unselected
- ← Back arrow

All icons use SVG format with consistent sizing (16px or 20px).

---

## Animations & Transitions

### Smooth Transitions
- Button hover: 150ms
- Card hover: 200ms
- Tab switching: Instant
- Page navigation: Default Next.js transitions

### Loading States
- Spinner: Rotating blue circle
- Skeleton screens: Gray animated placeholders

---

This UI guide provides a complete visual reference for understanding the application's interface without needing screenshots.
