'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ClientSummary {
  id: string;
  name: string;
  accountCount: number;
  authorizedUserCount: number;
  updatedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/admin');
  }
}, [status, router]);

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createNewClient() {
    const name = prompt('Enter new client name:');
    if (!name || !name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/clients/${data.client.id}`);
      } else {
        alert('Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client');
    } finally {
      setCreating(false);
    }
  }

  async function duplicateClient(clientId: string, clientName: string) {
    const newName = prompt(`Enter name for duplicated client:`, `${clientName} (Copy)`);
    if (!newName || !newName.trim()) return;

    setDuplicating(clientId);
    try {
      const res = await fetch(`/api/clients/${clientId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchClients(); // Refresh the list
        router.push(`/admin/clients/${data.client.id}`);
      } else {
        alert('Failed to duplicate client');
      }
    } catch (error) {
      console.error('Error duplicating client:', error);
      alert('Error duplicating client');
    } finally {
      setDuplicating(null);
    }
  }

  async function deleteClient(clientId: string, clientName: string) {
    if (!confirm(`Are you sure you want to delete "${clientName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchClients(); // Refresh the list
      } else {
        alert('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client');
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FLAV Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage client configurations and access control
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Clients</h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a client to manage their account groups and access rights
              </p>
            </div>
            <button
              onClick={createNewClient}
              disabled={creating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {creating ? 'Creating...' : '+ New Client'}
            </button>
          </div>

          {clients.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="mt-2 text-gray-500">No clients found.</p>
              <p className="text-sm text-gray-400">Create your first client to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li key={client.id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link href={`/admin/clients/${client.id}`}>
                          <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800">
                            {client.name}
                          </h3>
                        </Link>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm3 3a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 3a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 3a1 1 0 011-1h5a1 1 0 110 2H6a1 1 0 01-1-1z" />
                            </svg>
                            {client.accountCount} accounts
                          </span>
                          <span className="flex items-center">
                            <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            {client.authorizedUserCount} authorized users
                          </span>
                          <span className="text-gray-400">
                            Updated {new Date(client.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            duplicateClient(client.id, client.name);
                          }}
                          disabled={duplicating === client.id}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          title="Duplicate client"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {duplicating === client.id ? 'Duplicating...' : 'Duplicate'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            deleteClient(client.id, client.name);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Delete client"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500 flex items-center justify-between">
          <p>Logged in as: {session?.user?.email}</p>
          <button
            onClick={() => router.push('/profile')}
            className="text-blue-600 hover:underline"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}