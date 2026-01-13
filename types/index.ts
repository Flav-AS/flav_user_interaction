// Core data types for the FLAV dashboard system
export interface UserPermission {
  email: string;
  accessLevel: 'full' | 'limited';
  allowedGroupIds: string[];
}
export interface Account {
  id: string;
  accountNumber: number;
  accountName: string;
  customMainGroup?: number;
}

export interface Client {
  id: string;
  name: string;
  accountGroups: AccountGroup[];
  groupHierarchy: GroupHierarchy[];
  authorizedEmails: UserPermission[];
  userPermissions?: UserPermission[]; // <-- ADD THIS LINE
  createdAt: string;
  updatedAt: string;
}

export interface AccountGroup {
  id: string;
  name: string;
  accounts: Account[];
  parentGroupId?: string;
  // parentId?: string;
}

export interface GroupHierarchy {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  children?: GroupHierarchy[];
  accountGroupIds?: string[];
}

export interface Client {
  id: string;
  name: string;
  accountGroups: AccountGroup[];
  groupHierarchy: GroupHierarchy[];
  authorizedEmails: UserPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientSummary {
  id: string;
  name: string;
  accountCount: number;
  authorizedUserCount: number;
  updatedAt: string;
}

export interface ClientExport {
  client: {
    id: string;
    name: string;
  };
  accountGroups: {
    id: string;
    name: string;
    accounts: {
      accountNumber: number;
      accountName: string;
      mainGroup: number;
  }[];
  }[];
  hierarchy: GroupHierarchy[];
  authorizedEmails: string[];
  exportedAt: string;
}

// Chart of Accounts types
export interface ChartAccount {
  id: string;
  code: number;
  name: string;
  groupIds: string[];
}

export interface AccountsGroup {
  id: string;
  name: string;
  parentId?: string;
  accountIds: string[];
  children?: AccountsGroup[];
}
