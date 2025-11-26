// Core data types for the FLAV dashboard system

export interface Account {
  id: string;
  accountNumber: number;
  accountName: string;
  customMainGroup?: number;
}

export interface AccountGroup {
  id: string;
  name: string;
  accounts: Account[];
  parentGroupId?: string;
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
  authorizedEmails: string[];
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
