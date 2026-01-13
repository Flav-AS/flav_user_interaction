import { Client, Account } from '@/types';

// Mock POGO account data - in production, this would be fetched from POGO API
export const mockPogoAccounts: Account[] = [
  { id: '1', accountNumber: 4000, accountName: 'Revenue - Product Sales' },
  { id: '2', accountNumber: 4100, accountName: 'Revenue - Service Income' },
  { id: '3', accountNumber: 4500, accountName: 'Revenue - Other' },
  { id: '4', accountNumber: 6000, accountName: 'Operating Expenses - Rent' },
  { id: '5', accountNumber: 6100, accountName: 'Operating Expenses - Utilities' },
  { id: '6', accountNumber: 6340, accountName: 'Operating Expenses - Marketing' },
  { id: '7', accountNumber: 7000, accountName: 'Administrative Expenses' },
  { id: '8', accountNumber: 7500, accountName: 'Depreciation' },
];

// Helper function to determine default POGO main group based on account number
export function getDefaultPogoMainGroup(accountNumber: number): number {
  if (accountNumber >= 4000 && accountNumber <= 4999) return 2;
  if (accountNumber >= 6000 && accountNumber <= 7999) return 5;
  return 1; // Default fallback
}

// Mock client data
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Acme Corporation',
    accountGroups: [
      {
        id: 'ag-1',
        name: 'Revenue Accounts',
        accounts: [
          { ...mockPogoAccounts[0], customMainGroup: 2 },
          { ...mockPogoAccounts[1], customMainGroup: 2 },
          { ...mockPogoAccounts[2], customMainGroup: 2 },
        ],
      },
      {
        id: 'ag-2',
        name: 'Expense Accounts',
        accounts: [
          { ...mockPogoAccounts[3], customMainGroup: 5 },
          { ...mockPogoAccounts[4], customMainGroup: 5 },
          { ...mockPogoAccounts[5], customMainGroup: 2 }, // Custom: 6340 moved to group 2
        ],
      },
    ],
    groupHierarchy: [
      {
        id: 'h-1',
        name: 'Financial Overview',
        level: 1,
        children: [
          {
            id: 'h-2',
            name: 'Income Statement',
            level: 2,
            parentId: 'h-1',
            accountGroupIds: ['ag-1', 'ag-2'],
          },
        ],
      },
    ],
    authorizedEmails: [{email: 'john.doe@acme.com', accessLevel: 'full', allowedGroupIds: []}, {email: 'jane.smith@acme.com', accessLevel: 'full', allowedGroupIds: []}],
    createdAt: new Date('2025-01-15').toISOString(),
    updatedAt: new Date('2025-11-20').toISOString(),
  },
  {
    id: 'client-2',
    name: 'TechStart Inc',
    accountGroups: [
      {
        id: 'ag-3',
        name: 'All Revenue',
        accounts: [
          { ...mockPogoAccounts[0], customMainGroup: 2 },
          { ...mockPogoAccounts[1], customMainGroup: 2 },
        ],
      },
    ],
    groupHierarchy: [
      {
        id: 'h-3',
        name: 'Company Reports',
        level: 1,
        accountGroupIds: ['ag-3'],
      },
    ],
    authorizedEmails: [{email: 'admin@techstart.com', accessLevel: 'full', allowedGroupIds: []}],
    createdAt: new Date('2025-02-10').toISOString(),
    updatedAt: new Date('2025-11-22').toISOString(),
  },
];

// In-memory storage (in production, this would be a database)
let clients = [...mockClients];

export const dataService = {
  // Get all clients (summaries)
  getAllClients: () => {
    return clients.map(client => ({
      id: client.id,
      name: client.name,
      accountCount: client.accountGroups.reduce((sum, group) => sum + group.accounts.length, 0),
      authorizedUserCount: client.authorizedEmails.length,
      updatedAt: client.updatedAt,
    }));
  },

  // Get single client by ID
  getClientById: (id: string) => {
    return clients.find(client => client.id === id);
  },

  // Create new client
  createClient: (name: string) => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name,
      accountGroups: [],
      groupHierarchy: [],
      authorizedEmails: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clients.push(newClient);
    return newClient;
  },

  // Update client
  updateClient: (id: string, updates: Partial<Client>) => {
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    clients[index] = {
      ...clients[index],
      ...updates,
      id: clients[index].id, // Prevent ID changes
      updatedAt: new Date().toISOString(),
    };
    return clients[index];
  },

  // Delete client
  deleteClient: (id: string) => {
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return false;
    clients.splice(index, 1);
    return true;
  },

  // Get available POGO accounts
  getPogoAccounts: () => {
    return mockPogoAccounts;
  },
};
