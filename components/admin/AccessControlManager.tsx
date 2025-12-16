'use client';

import { useState } from 'react';
import { Client } from '@/types';

interface Props {
  client: Client;
  onUpdate: (client: Client) => void;
}

export default function AccessControlManager({ client, onUpdate }: Props) {
  const [newEmail, setNewEmail] = useState('');

  function addEmail() {
    const email = newEmail.trim().toLowerCase();
    
    if (!email) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (client.authorizedEmails.includes(email)) {
      alert('This email is already authorized');
      return;
    }

    onUpdate({
      ...client,
      authorizedEmails: [...client.authorizedEmails, email],
    });

    setNewEmail('');
  }

  function removeEmail(email: string) {
    if (!confirm(`Remove access for ${email}?`)) return;

    onUpdate({
      ...client,
      authorizedEmails: client.authorizedEmails.filter(e => e !== email),
    });
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      addEmail();
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Control</h2>
        <p className="text-sm text-gray-600">
          Manage which users have access to view this client's PowerBI reports.
          Enter email addresses of authorized users.
        </p>
      </div>

      {/* Add Email */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Authorized User
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="user@company.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
          />
          <button
            onClick={addEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add User
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Press Enter or click "Add User" to add the email address
        </p>
      </div>

      {/* Authorized Users List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Authorized Users ({client.authorizedEmails.length})
        </h3>
        
        {client.authorizedEmails.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-md">
            No authorized users yet. Add email addresses above to grant access.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {client.authorizedEmails.map((email, index) => (
                <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{email}</div>
                        <div className="text-xs text-gray-500">
                          Has access to view PowerBI reports
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeEmail(email)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Access Summary */}
      {client.authorizedEmails.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Access Information</h4>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  Users with authorized email addresses will be able to view PowerBI reports
                  for this client after logging in through Entra ID authentication.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
