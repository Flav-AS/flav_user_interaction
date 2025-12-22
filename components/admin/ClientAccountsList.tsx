'use client';

import { useState } from 'react';
import { Client, Account } from '@/types';

interface Props {
  client: Client;
  selectedGroupId: string | null;
  onCreateAccount: (accountNumber: number, accountName: string) => void;
  onUpdateAccount: (groupId: string, accountId: string, updates: any) => void;
  onDeleteAccount: (groupId: string, accountId: string) => void;
}

export default function ClientAccountsList({
  client,
  selectedGroupId,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
}: Props) {
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    const code = parseInt(newCode, 10);
    if (isNaN(code) || !newName.trim()) {
      alert('Please enter a valid code (number) and name');
      return;
    }

    if (!selectedGroupId) {
      alert('Please select a group first');
      return;
    }

    onCreateAccount(code, newName.trim());
    setNewCode('');
    setNewName('');
  };

  const startEdit = (account: any) => {
    setEditingId(account.id);
    setEditCode(account.accountNumber.toString());
    setEditName(account.accountName);
  };

  const saveEdit = (groupId: string) => {
    if (!editingId) return;

    const code = parseInt(editCode, 10);
    if (isNaN(code) || !editName.trim()) {
      alert('Please enter a valid code (number) and name');
      return;
    }

    onUpdateAccount(groupId, editingId, {
      accountNumber: code,
      accountName: editName.trim(),
    });

    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const selectedGroup = client.accountGroups.find(g => g.id === selectedGroupId);
  const accounts = selectedGroup ? selectedGroup.accounts : [];

  // Get all accounts across all groups for "All" view
  const allAccounts = selectedGroupId === null
    ? client.accountGroups.flatMap(g => 
        g.accounts.map(a => ({ ...a, groupId: g.id, groupName: g.name }))
      )
    : [];

  const displayAccounts = selectedGroupId === null ? allAccounts : accounts;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {selectedGroup ? `${selectedGroup.name} - Accounts` : 'All Accounts'}
        </h2>
        <p className="text-sm text-gray-600">
          {displayAccounts.length} {displayAccounts.length === 1 ? 'account' : 'accounts'}
          {selectedGroup && ' in this group'}
        </p>
      </div>

      {/* Create form (only when a group is selected) */}
      {selectedGroupId && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Account</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Code"
              className="w-32 px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Account name"
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Accounts table */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
        {displayAccounts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            {selectedGroupId
              ? 'No accounts in this group. Create one above.'
              : 'No accounts yet. Select a group and create accounts.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                {selectedGroupId === null && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayAccounts.map((account: any) => {
                const groupId = account.groupId || selectedGroupId;
                
                return (
                  <tr
                    key={account.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {editingId === account.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            className="w-24 px-2 py-1 border border-blue-500 text-gray-700 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3" colSpan={selectedGroupId === null ? 2 : 1}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 border border-blue-500 text-gray-700 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => saveEdit(groupId)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">
                          {account.accountNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {account.accountName}
                        </td>
                        {selectedGroupId === null && (
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {account.groupName || 'Unknown'}
                          </td>
                        )}
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => startEdit(account)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {selectedGroupId && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete account ${account.accountNumber} - ${account.accountName}?`)) {
                                  onDeleteAccount(selectedGroupId, account.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Panel */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-xs text-blue-900">
            <strong>Tip:</strong> Organize accounts into groups and subgroups using the folder structure on the left.
            {selectedGroupId ? ' Create accounts within the selected group.' : ' Select a group to add accounts.'}
          </div>
        </div>
      </div>
    </div>
  );
}