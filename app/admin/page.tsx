import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getClients() {
  // In production, this would be an API call or database query
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/clients`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    return [];
  }
  
  const data = await res.json();
  return data.clients;
}

export default async function AdminPage() {
  const session = await auth();

  const clients = await getClients();

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
            <Link
              href="/admin/clients/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + New Client
            </Link>
          </div>

          {clients.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-500">No clients found. Create your first client to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((client: any) => (
                <li key={client.id}>
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800">
                            {client.name}
                          </h3>
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
                        <div>
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Logged in as: {session?.user?.email || 'demo@flav.com (Demo Mode)'}</p>
        </div>
      </div>
    </div>
  );
}
