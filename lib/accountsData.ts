import { ChartAccount, AccountsGroup } from '@/types';

// Initial chart accounts
const initialAccounts: ChartAccount[] = [
  { id: 'acc-1', code: 1000, name: 'chairs', groupIds: ['grp-1'] },
  { id: 'acc-2', code: 1002, name: 'tables', groupIds: ['grp-1'] },
  { id: 'acc-3', code: 1003, name: 'carpets', groupIds: ['grp-1'] },
  { id: 'acc-4', code: 1004, name: 'closets', groupIds: ['grp-1'] },
  { id: 'acc-5', code: 1010, name: 'pencils', groupIds: ['grp-2'] },
  { id: 'acc-6', code: 1020, name: 'paper', groupIds: ['grp-2'] },
  { id: 'acc-7', code: 1050, name: 'computers', groupIds: ['grp-3'] },
  { id: 'acc-8', code: 1051, name: 'monitors', groupIds: ['grp-3'] },
];

// Initial account groups with hierarchy
const initialGroups: AccountsGroup[] = [
  { 
    id: 'grp-1', 
    name: 'Furniture', 
    accountIds: ['acc-1', 'acc-2', 'acc-3', 'acc-4'],
  },
  { 
    id: 'grp-2', 
    name: 'Office equipment', 
    accountIds: ['acc-5', 'acc-6'],
  },
  { 
    id: 'grp-3', 
    name: 'IT', 
    accountIds: ['acc-7', 'acc-8'],
  },
];

// In-memory storage
let accounts = [...initialAccounts];
let groups = [...initialGroups];

// Utility: Build tree structure from flat groups
export function buildGroupTree(flatGroups: AccountsGroup[]): AccountsGroup[] {
  const groupMap = new Map<string, AccountsGroup>();
  const roots: AccountsGroup[] = [];

  // Create a map of all groups with children array
  flatGroups.forEach(group => {
    groupMap.set(group.id, { ...group, children: [] });
  });

  // Build the tree structure
  flatGroups.forEach(group => {
    const node = groupMap.get(group.id)!;
    if (group.parentId) {
      const parent = groupMap.get(group.parentId);
      if (parent) {
        parent.children!.push(node);
      } else {
        // Parent not found, treat as root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// Utility: Check for circular references in hierarchy
function hasCircularReference(groupId: string, newParentId: string): boolean {
  if (groupId === newParentId) return true;
  
  let currentId: string | undefined = newParentId;
  const visited = new Set<string>();
  
  while (currentId) {
    if (currentId === groupId) return true;
    if (visited.has(currentId)) return true; // Already has a cycle
    visited.add(currentId);
    
    const currentGroup = groups.find(g => g.id === currentId);
    currentId = currentGroup?.parentId;
  }
  
  return false;
}

// Utility: Get all descendants of a group
function getAllDescendants(groupId: string): string[] {
  const descendants: string[] = [];
  const children = groups.filter(g => g.parentId === groupId);
  
  children.forEach(child => {
    descendants.push(child.id);
    descendants.push(...getAllDescendants(child.id));
  });
  
  return descendants;
}

export const accountsDataService = {
  // ===== ACCOUNTS =====
  
  getAllAccounts: () => {
    return [...accounts];
  },

  getAccountById: (id: string) => {
    return accounts.find(acc => acc.id === id);
  },

  getAccountsByGroup: (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    return accounts.filter(acc => group.accountIds.includes(acc.id));
  },

  createAccount: (code: number, name: string, groupIds: string[] = []) => {
    // Validate unique code
    if (accounts.some(acc => acc.code === code)) {
      throw new Error(`Account with code ${code} already exists`);
    }

    const newAccount: ChartAccount = {
      id: `acc-${Date.now()}`,
      code,
      name,
      groupIds,
    };

    accounts.push(newAccount);

    // Add account to specified groups
    groupIds.forEach(groupId => {
      const group = groups.find(g => g.id === groupId);
      if (group && !group.accountIds.includes(newAccount.id)) {
        group.accountIds.push(newAccount.id);
      }
    });

    return newAccount;
  },

  updateAccount: (id: string, updates: Partial<ChartAccount>) => {
    const index = accounts.findIndex(acc => acc.id === id);
    if (index === -1) return null;

    // If code is being updated, check for duplicates
    if (updates.code && updates.code !== accounts[index].code) {
      if (accounts.some(acc => acc.id !== id && acc.code === updates.code)) {
        throw new Error(`Account with code ${updates.code} already exists`);
      }
    }

    // Handle group membership changes
    if (updates.groupIds) {
      const oldGroupIds = accounts[index].groupIds;
      const newGroupIds = updates.groupIds;

      // Remove from old groups
      oldGroupIds.forEach(groupId => {
        if (!newGroupIds.includes(groupId)) {
          const group = groups.find(g => g.id === groupId);
          if (group) {
            group.accountIds = group.accountIds.filter(aid => aid !== id);
          }
        }
      });

      // Add to new groups
      newGroupIds.forEach(groupId => {
        if (!oldGroupIds.includes(groupId)) {
          const group = groups.find(g => g.id === groupId);
          if (group && !group.accountIds.includes(id)) {
            group.accountIds.push(id);
          }
        }
      });
    }

    accounts[index] = {
      ...accounts[index],
      ...updates,
      id: accounts[index].id, // Prevent ID changes
    };

    return accounts[index];
  },

  deleteAccount: (id: string) => {
    const index = accounts.findIndex(acc => acc.id === id);
    if (index === -1) return false;

    // Remove from all groups
    groups.forEach(group => {
      group.accountIds = group.accountIds.filter(aid => aid !== id);
    });

    accounts.splice(index, 1);
    return true;
  },

  // ===== GROUPS =====

  getAllGroups: () => {
    return [...groups];
  },

  getGroupTree: () => {
    return buildGroupTree(groups);
  },

  getGroupById: (id: string) => {
    return groups.find(grp => grp.id === id);
  },

  createGroup: (name: string, parentId?: string) => {
    // Validate parent exists if provided
    if (parentId && !groups.find(g => g.id === parentId)) {
      throw new Error('Parent group does not exist');
    }

    const newGroup: AccountsGroup = {
      id: `grp-${Date.now()}`,
      name,
      parentId,
      accountIds: [],
    };

    groups.push(newGroup);
    return newGroup;
  },

  updateGroup: (id: string, updates: { name?: string; parentId?: string | null }) => {
    const index = groups.findIndex(g => g.id === id);
    if (index === -1) return null;

    // Handle parent changes
    if ('parentId' in updates) {
      const newParentId = updates.parentId === null ? undefined : updates.parentId;
      
      // Check for circular reference
      if (newParentId && hasCircularReference(id, newParentId)) {
        throw new Error('Cannot set parent: would create circular reference');
      }

      // Ensure parent exists
      if (newParentId && !groups.find(g => g.id === newParentId)) {
        throw new Error('Parent group does not exist');
      }

      groups[index].parentId = newParentId;
    }

    if (updates.name) {
      groups[index].name = updates.name;
    }

    return groups[index];
  },

  deleteGroup: (id: string) => {
    const index = groups.findIndex(g => g.id === id);
    if (index === -1) return false;

    // Get all descendants
    const descendants = getAllDescendants(id);
    
    // Remove the group and all its descendants
    groups = groups.filter(g => g.id !== id && !descendants.includes(g.id));

    // Remove group references from accounts
    accounts.forEach(account => {
      account.groupIds = account.groupIds.filter(gid => gid !== id && !descendants.includes(gid));
    });

    return true;
  },

  // Add account to group
  addAccountToGroup: (accountId: string, groupId: string) => {
    const account = accounts.find(a => a.id === accountId);
    const group = groups.find(g => g.id === groupId);

    if (!account || !group) return false;

    if (!group.accountIds.includes(accountId)) {
      group.accountIds.push(accountId);
    }

    if (!account.groupIds.includes(groupId)) {
      account.groupIds.push(groupId);
    }

    return true;
  },

  // Remove account from group
  removeAccountFromGroup: (accountId: string, groupId: string) => {
    const account = accounts.find(a => a.id === accountId);
    const group = groups.find(g => g.id === groupId);

    if (!account || !group) return false;

    group.accountIds = group.accountIds.filter(id => id !== accountId);
    account.groupIds = account.groupIds.filter(id => id !== groupId);

    return true;
  },
};
