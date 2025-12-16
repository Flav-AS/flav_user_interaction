'use client';

import { useState } from 'react';
import { ChartAccount, AccountsGroup } from '@/types';

interface Props {
  accounts: ChartAccount[];
  groups: AccountsGroup[];
  selectedGroupId: string | null;
  onCreateAccount: (code: number, name: string, groupIds: string[]) => void;
  onUpdateAccount: (accountId: string, updates: Partial<ChartAccount>) => void;
  onDeleteAccount: (accountId: string) => void;
}

export default function AccountsList({
  accounts,
  groups,
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
  const [editGroupIds, setEditGroupIds] = useState<string[]>([]);

  // Filter accounts by selected group
  const filteredAccounts = selectedGroupId
    ? accounts.filter(acc => acc.groupIds.includes(selectedGroupId))
    : accounts;

  const handleCreate = () => {
    const code = parseInt(newCode, 10);
    if (isNaN(code) || !newName.trim()) {
      alert('Please enter a valid code (number) and name');
      return;
    }

    const groupIds = selectedGroupId ? [selectedGroupId] : [];
    onCreateAccount(code, newName.trim(), groupIds);
    setNewCode('');
    setNewName('');
  };

  const startEdit = (account: ChartAccount) => {
    setEditingId(account.id);
    setEditCode(account.code.toString());
    setEditName(account.name);
    setEditGroupIds(account.groupIds);
  };

  const saveEdit = () => {
    if (!editingId) return;

    const code = parseInt(editCode, 10);
    if (isNaN(code) || !editName.trim()) {
      alert('Please enter a valid code (number) and name');
      return;
    }

    onUpdateAccount(editingId, {
      code,
      name: editName.trim(),
      groupIds: editGroupIds,
    });

    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const toggleGroupMembership = (groupId: string) => {
    setEditGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getGroupNames = (groupIds: string[]) => {
    return groupIds
      .map(id => groups.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {selectedGroupId
            ? `Accounts in ${groups.find(g => g.id === selectedGroupId)?.name || 'Group'}`
            : 'All Accounts'}
        </h2>
        <p className="text-sm text-gray-600">
          {filteredAccounts.length} {filteredAccounts.length === 1 ? 'account' : 'accounts'}
        </p>
      </div>

      {/* Create form */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Account</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Code"
            className="w-24 px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Account name"
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Create
          </button>
        </div>
      </div>

      {/* Accounts table */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            {selectedGroupId
              ? 'No accounts in this group. Create one above or select a different group.'
              : 'No accounts yet. Create your first account above.'}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Groups
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
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
                          className="w-20 px-2 py-1 border text-gray-500 border-blue-500 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 border border-blue-500 text-gray-500 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {groups.map((group) => (
                            <label
                              key={group.id}
                              className="inline-flex items-center text-xs cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={editGroupIds.includes(group.id)}
                                onChange={() => toggleGroupMembership(group.id)}
                                className="mr-1 text-gray-500"
                              />
                              {group.name}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={saveEdit}
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
                        {account.code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {account.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {getGroupNames(account.groupIds) || (
                          <span className="text-gray-400 italic">No groups</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => startEdit(account)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete account ${account.code} - ${account.name}?`)) {
                              onDeleteAccount(account.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
