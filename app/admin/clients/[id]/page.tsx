'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Client, AccountGroup } from '@/types';
import ClientAccountsTreeView from '@/components/admin/ClientAccountsTreeView';
import ClientAccountsList from '@/components/admin/ClientAccountsList';
import EnhancedAccessControlManager from '@/components/admin/EnhancedAccessControlManager';


export default function ClientAccountsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportData, setExportData] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  // Tracks original client state
const [originalClient, setOriginalClient] = useState<string>('');
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Fetch client (only runs when clientId changes)
useEffect(() => {
  fetchClient();
}, [clientId]);

// 2. Track changes (only runs when client changes)
useEffect(() => {
  if (client && originalClient) {
    const currentState = JSON.stringify(client);
    setHasUnsavedChanges(currentState !== originalClient);
  }
}, [client]); 

  useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);

  async function fetchClient() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setOriginalClient(JSON.stringify(data.client));
        setHasUnsavedChanges(false);
      } else {
        setError('Failed to fetch client');
      }
    } catch (error) {
      setError('Error fetching client');
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveClient() {
    if (!client) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setOriginalClient(JSON.stringify(data.client));
        setHasUnsavedChanges(false);
        alert('Client saved successfully!');
      } else {
        alert('Failed to save client');
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error saving client');
    } finally {
      setSaving(false);
    }
  }

  const handleBackClick = () => {
  if (hasUnsavedChanges) {
    if (confirm('You have unsaved changes. Do you want to leave without saving?')) {
      setHasUnsavedChanges(false);
      router.push('/admin');
    }
  } else {
    router.push('/admin'); // Navigate immediately if no changes
  }
  console.log('Back to Admin Dashboard clicked');
};

  function startEditingName() {
    if (client) {
      setEditedName(client.name);
      setIsEditingName(true);
    }
  }

  function saveClientName() {
    if (!client || !editedName.trim()) {
      setIsEditingName(false);
      return;
    }

    setClient({
      ...client,
      name: editedName.trim(),
    });
    setIsEditingName(false);
  }

  function cancelEditingName() {
    setIsEditingName(false);
    setEditedName('');
  }

  async function exportClientData() {
    try {
      const res = await fetch(`/api/clients/${clientId}/export`);
      if (res.ok) {
        const data = await res.json();
        setExportData(data);
        
        // Download as JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${client?.name}-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting client data:', error);
      alert('Failed to export client data');
    }
  }

  // Group operations
  const handleCreateGroup = (name: string, parentId?: string) => {
    if (!client) return;

    const newGroup: any = {
      id: `ag-${Date.now()}`,
      name,
      accounts: [],
    };

    // Add parentId if provided
    if (parentId) {
      newGroup.parentId = parentId;
    }

    setClient({
      ...client,
      accountGroups: [...client.accountGroups, newGroup],
    });
  };

  const handleUpdateGroup = (groupId: string, updates: { name?: string; parentId?: string | null }) => {
    if (!client) return;

    setClient({
      ...client,
      accountGroups: client.accountGroups.map(g => {
        if (g.id === groupId) {
          const updated = { ...g, ...updates };
          // Handle parentId updates
          if ('parentId' in updates) {
            (updated as any).parentId = updates.parentId;
          }
          return updated;
        }
        return g;
      }),
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    if (!client) return;

    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }

    setClient({
      ...client,
      accountGroups: client.accountGroups.filter(g => g.id !== groupId),
    });
  };

  // Account operations
  const handleCreateAccount = (accountNumber: number, accountName: string) => {
    if (!client || !selectedGroupId) return;

    const updatedGroups = client.accountGroups.map(g => {
      if (g.id === selectedGroupId) {
        // Check if account already exists
        if (g.accounts.some(a => a.accountNumber === accountNumber)) {
          alert('Account with this code already exists in this group');
          return g;
        }
        
        return {
          ...g,
          accounts: [...g.accounts, {
            id: `acc-${Date.now()}`,
            accountNumber,
            accountName,
          }],
        };
      }
      return g;
    });

    setClient({
      ...client,
      accountGroups: updatedGroups,
    });
  };

  const handleUpdateAccount = (groupId: string, accountId: string, updates: any) => {
    if (!client) return;

    setClient({
      ...client,
      accountGroups: client.accountGroups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            accounts: g.accounts.map(a => 
              a.id === accountId ? { ...a, ...updates } : a
            ),
          };
        }
        return g;
      }),
    });
  };

  const handleDeleteAccount = (groupId: string, accountId: string) => {
    if (!client) return;

    setClient({
      ...client,
      accountGroups: client.accountGroups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            accounts: g.accounts.filter(a => a.id !== accountId),
          };
        }
        return g;
      }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || 'Client not found'}</p>
          <button onClick={handleBackClick} className="text-blue-600 hover:underline">
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button onClick={handleBackClick} className="text-blue-600 hover:underline">
            ← Back to Admin Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveClientName();
                      if (e.key === 'Escape') cancelEditingName();
                    }}
                    className="text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none px-2"
                    autoFocus
                  />
                  <button
                    onClick={saveClientName}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditingName}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
                  <button
                    onClick={startEditingName}
                    className="text-gray-400 hover:text-gray-600"
                    title="Edit client name"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Manage account groups and organize accounts hierarchically
              </p>
            </div>
            <div className="flex gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Unsaved changes
                </div>
              )}
              <button
                onClick={exportClientData}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Export JSON
              </button>
              <button
                onClick={saveClient}
                disabled={saving}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
                  hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
          
            <EnhancedAccessControlManager
              client={client}
              onUpdate={setClient}
            />
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Left column: Account Groups Tree */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 overflow-hidden">
            <ClientAccountsTreeView
              client={client}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              onCreateGroup={handleCreateGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          </div>

          {/* Right column: Accounts List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 overflow-hidden">
            <ClientAccountsList
              client={client}
              selectedGroupId={selectedGroupId}
              onCreateAccount={handleCreateAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
        </div>

        {/* Export Preview */}
        {exportData && (
          <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Last Export Preview</h3>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(exportData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}