'use client';

import { useState, useEffect } from 'react';
import { Client, Account, AccountGroup } from '@/types';
import { getDefaultPogoMainGroup } from '@/lib/mockData';

interface Props {
  client: Client;
  onUpdate: (client: Client) => void;
}

export default function AccountGroupManager({ client, onUpdate }: Props) {
  const [pogoAccounts, setPogoAccounts] = useState<Account[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);

  useEffect(() => {
    fetchPogoAccounts();
  }, []);

  async function fetchPogoAccounts() {
    try {
      const res = await fetch('/api/pogo/accounts');
      if (res.ok) {
        const data = await res.json();
        setPogoAccounts(data.accounts);
        setAvailableAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error fetching POGO accounts:', error);
    }
  }

  function createAccountGroup() {
    if (!newGroupName.trim()) return;

    const newGroup: AccountGroup = {
      id: `ag-${Date.now()}`,
      name: newGroupName,
      accounts: [],
    };

    onUpdate({
      ...client,
      accountGroups: [...client.accountGroups, newGroup],
    });

    setNewGroupName('');
    setSelectedGroup(newGroup.id);
  }

  function deleteAccountGroup(groupId: string) {
    if (!confirm('Are you sure you want to delete this account group?')) return;

    onUpdate({
      ...client,
      accountGroups: client.accountGroups.filter(g => g.id !== groupId),
    });

    if (selectedGroup === groupId) {
      setSelectedGroup(null);
    }
  }

  function addAccountToGroup(account: Account) {
    if (!selectedGroup) return;

    const group = client.accountGroups.find(g => g.id === selectedGroup);
    if (!group) return;

    // Check if account already exists in this group
    if (group.accounts.some(a => a.id === account.id)) {
      alert('Account already exists in this group');
      return;
    }

    const updatedGroups = client.accountGroups.map(g => {
      if (g.id === selectedGroup) {
        return {
          ...g,
          accounts: [...g.accounts, { ...account, customMainGroup: getDefaultPogoMainGroup(account.accountNumber) }],
        };
      }
      return g;
    });

    onUpdate({
      ...client,
      accountGroups: updatedGroups,
    });
  }

  function removeAccountFromGroup(groupId: string, accountId: string) {
    const updatedGroups = client.accountGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          accounts: g.accounts.filter(a => a.id !== accountId),
        };
      }
      return g;
    });

    onUpdate({
      ...client,
      accountGroups: updatedGroups,
    });
  }

  function updateAccountMainGroup(groupId: string, accountId: string, newMainGroup: number) {
    const updatedGroups = client.accountGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          accounts: g.accounts.map(a => {
            if (a.id === accountId) {
              return { ...a, customMainGroup: newMainGroup };
            }
            return a;
          }),
        };
      }
      return g;
    });

    onUpdate({
      ...client,
      accountGroups: updatedGroups,
    });
  }

  const selectedGroupData = client.accountGroups.find(g => g.id === selectedGroup);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Groups</h2>
        <p className="text-sm text-gray-600">
          Create groups of accounts and assign custom main groups to override POGO defaults.
          <br />
          Default: Accounts 4000-4999 → Main Group 2, Accounts 6000-7999 → Main Group 5
        </p>
      </div>

      {/* Create New Group */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Create New Account Group
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter group name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={createAccountGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Groups List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Account Groups</h3>
          {client.accountGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-md">
              No account groups yet. Create your first group above.
            </div>
          ) : (
            <div className="space-y-2">
              {client.accountGroups.map(group => (
                <div
                  key={group.id}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedGroup === group.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{group.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {group.accounts.length} account{group.accounts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAccountGroup(group.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group Details */}
        <div>
          {selectedGroupData ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {selectedGroupData.name} - Accounts
              </h3>

              {/* Add Account */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Account from POGO
                </label>
                <select
                  onChange={(e) => {
                    const account = pogoAccounts.find(a => a.id === e.target.value);
                    if (account) addAccountToGroup(account);
                    e.target.value = '';
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>Select an account...</option>
                  {pogoAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.accountName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Accounts in Group */}
              {selectedGroupData.accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-md">
                  No accounts in this group. Add accounts above.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedGroupData.accounts.map(account => {
                    const defaultGroup = getDefaultPogoMainGroup(account.accountNumber);
                    const currentGroup = account.customMainGroup ?? defaultGroup;
                    
                    return (
                      <div key={account.id} className="p-3 border border-gray-200 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {account.accountNumber}
                            </div>
                            <div className="text-sm text-gray-600">{account.accountName}</div>
                          </div>
                          <button
                            onClick={() => removeAccountFromGroup(selectedGroupData.id, account.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-xs text-gray-600">Main Group:</label>
                          <select
                            value={currentGroup}
                            onChange={(e) =>
                              updateAccountMainGroup(
                                selectedGroupData.id,
                                account.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <option key={num} value={num}>
                                {num} {num === defaultGroup ? '(POGO default)' : ''}
                              </option>
                            ))}
                          </select>
                          {currentGroup !== defaultGroup && (
                            <span className="text-xs text-blue-600">Custom</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-md">
              Select a group to view and manage its accounts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
