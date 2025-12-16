'use client';

import { useState, useEffect } from 'react';
import { ChartAccount, AccountsGroup } from '@/types';
import AccountsTreeView from '@/components/accounts/AccountsTreeView';
import AccountsList from '@/components/accounts/AccountsList';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [groups, setGroups] = useState<AccountsGroup[]>([]);
  const [groupTree, setGroupTree] = useState<AccountsGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accountsRes, groupsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/accounts-groups'),
      ]);

      if (!accountsRes.ok || !groupsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const accountsData = await accountsRes.json();
      const groupsData = await groupsRes.json();

      setAccounts(accountsData.accounts || []);
      setGroups(groupsData.groups || []);
      setGroupTree(groupsData.tree || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Account operations
  const handleCreateAccount = async (code: number, name: string, groupIds: string[]) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, groupIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create account');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  const handleUpdateAccount = async (accountId: string, updates: Partial<ChartAccount>) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: accountId, ...updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update account');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update account');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const res = await fetch(`/api/accounts?id=${accountId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  // Group operations
  const handleCreateGroup = async (name: string, parentId?: string) => {
    try {
      const res = await fetch('/api/accounts-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create group');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const handleUpdateGroup = async (
    groupId: string,
    updates: { name?: string; parentId?: string | null }
  ) => {
    try {
      const res = await fetch('/api/accounts-groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupId, ...updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update group');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const res = await fetch(`/api/accounts-groups?id=${groupId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete group');
      }

      // If the deleted group was selected, clear selection
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your accounts and organize them into hierarchical groups
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Left column: Tree view */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 overflow-hidden">
            <AccountsTreeView
              groups={groupTree}
              allGroups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              onCreateGroup={handleCreateGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          </div>

          {/* Right column: Accounts list */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 overflow-hidden">
            <AccountsList
              accounts={accounts}
              groups={groups}
              selectedGroupId={selectedGroupId}
              onCreateAccount={handleCreateAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
