'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Client, Account, AccountGroup, GroupHierarchy } from '@/types';
import AccountGroupManager from '@/components/admin/AccountGroupManager';
import HierarchyManager from '@/components/admin/HierarchyManager';
import AccessControlManager from '@/components/admin/AccessControlManager';

export default function ClientAdminPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'hierarchy' | 'access'>('accounts');
  const [exportData, setExportData] = useState<any>(null);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  async function fetchClient() {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
      } else {
        console.error('Failed to fetch client');
      }
    } catch (error) {
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

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Client not found</p>
          <Link href="/admin" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              <p className="mt-1 text-sm text-gray-500">Client ID: {client.id}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportClientData}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Export JSON
              </button>
              <button
                onClick={saveClient}
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`${
                activeTab === 'accounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Account Groups
            </button>
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`${
                activeTab === 'hierarchy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Hierarchy
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`${
                activeTab === 'access'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Access Control
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          {activeTab === 'accounts' && (
            <AccountGroupManager
              client={client}
              onUpdate={setClient}
            />
          )}
          
          {activeTab === 'hierarchy' && (
            <HierarchyManager
              client={client}
              onUpdate={setClient}
            />
          )}
          
          {activeTab === 'access' && (
            <AccessControlManager
              client={client}
              onUpdate={setClient}
            />
          )}
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
