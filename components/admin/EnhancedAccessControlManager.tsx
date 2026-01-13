'use client';

import { useState } from 'react';
import { Client } from '@/types';

interface UserPermission {
  email: string;
  accessLevel: 'full' | 'limited';
  allowedGroupIds: string[];
}

interface Props {
  client: Client;
  onUpdate: (client: Client) => void;
}

export default function EnhancedAccessControlManager({ client, onUpdate }: Props) {
  const [newEmail, setNewEmail] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<'full' | 'limited'>('full');

  const selectedusers = client.authorizedEmails;

  // Get user permissions from client
  const userPermissions: UserPermission[] = (client as any).userPermissions || selectedusers;

  function addUser() {
    const email = newEmail.trim().toLowerCase();
    
    if (!email) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (userPermissions.some(u => u.email === email)) {
      alert('This email is already authorized');
      return;
    }

    const newPermission: UserPermission = {
      email,
      accessLevel,
      allowedGroupIds: accessLevel === 'full' ? [] : selectedGroups,
    };

    const updatedPermissions = [...userPermissions, newPermission];
    
    onUpdate({
      ...client,
      userPermissions: updatedPermissions,
      authorizedEmails: updatedPermissions.map(u => u.email),
    } as any);

    setNewEmail('');
    setSelectedGroups([]);
    setAccessLevel('full');
  }

  function removeUser(email: string) {
    if (!confirm(`Remove access for ${email}?`)) return;

    const updatedPermissions = userPermissions.filter(u => u.email !== email);
    
    onUpdate({
      ...client,
      userPermissions: updatedPermissions,
      authorizedEmails: updatedPermissions.map(u => u.email),
    } as any);
  }

  function startEditUser(user: UserPermission) {
    setEditingUser(user.email);
    setAccessLevel(user.accessLevel);
    setSelectedGroups(user.allowedGroupIds);
  }

  function saveUserEdit(email: string) {
    const updatedPermissions = userPermissions.map(u => 
      u.email === email
        ? {
            ...u,
            accessLevel,
            allowedGroupIds: accessLevel === 'full' ? [] : selectedGroups,
          }
        : u
    );

    onUpdate({
      ...client,
      userPermissions: updatedPermissions,
      authorizedEmails: updatedPermissions.map(u => u.email),
    } as any);

    setEditingUser(null);
    setSelectedGroups([]);
  }

  function cancelEdit() {
    setEditingUser(null);
    setSelectedGroups([]);
    setAccessLevel('full');
  }

  function toggleGroupSelection(groupId: string) {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && accessLevel === 'full') {
      addUser();
    }
  }

  const getGroupName = (groupId: string) => {
    return client.accountGroups.find(g => g.id === groupId)?.name || 'Unknown Group';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Control</h2>
        <p className="text-sm text-gray-600">
          Manage which users have access to this client's data and specify their permissions.
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        {/* Add User */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md w-full border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Authorized User
            </label>
            
            <div className="space-y-3">
            <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="user@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Level
                </label>
                <div className="space-y-2">
                <label className="flex items-center">
                    <input
                    type="radio"
                    value="full"
                    checked={accessLevel === 'full'}
                    onChange={(e) => setAccessLevel('full')}
                    className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                    <strong>Full Access</strong> - Can view all account groups
                    </span>
                </label>
                <label className="flex items-center">
                    <input
                    type="radio"
                    value="limited"
                    checked={accessLevel === 'limited'}
                    onChange={(e) => setAccessLevel('limited')}
                    className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                    <strong>Limited Access</strong> - Can only view specific account groups
                    </span>
                </label>
                </div>
            </div>

            {accessLevel === 'limited' && (
                <div className="pl-6 space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Account Groups
                </label>
                {client.accountGroups.length === 0 ? (
                    <p className="text-sm text-gray-500">No account groups available</p>
                ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
                    {client.accountGroups.map(group => (
                        <label key={group.id} className="flex items-center py-1 hover:bg-gray-50 px-2 rounded">
                        <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={() => toggleGroupSelection(group.id)}
                            className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{group.name}</span>
                        </label>
                    ))}
                    </div>
                )}
                </div>
            )}

            <button
                onClick={addUser}
                disabled={accessLevel === 'limited' && selectedGroups.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Add User
            </button>
            </div>
        </div>

        {/* Users List */}
        <div className="w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
            Authorized Users ({userPermissions.length})
            </h3>
            
            {userPermissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-md">
                No authorized users yet. Add email addresses above to grant access.
            </div>
            ) : (
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                {userPermissions.map((user) => (
                    <li key={user.email} className="p-4 hover:bg-gray-50 transition-colors">
                    {editingUser === user.email ? (
                        <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{user.email}</div>
                            <div className="flex gap-2">
                            <button
                                onClick={() => saveUserEdit(user.email)}
                                className="px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                            >
                                Save
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center">
                            <input
                                type="radio"
                                value="full"
                                checked={accessLevel === 'full'}
                                onChange={() => setAccessLevel('full')}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Full Access</span>
                            </label>
                            <label className="flex items-center">
                            <input
                                type="radio"
                                value="limited"
                                checked={accessLevel === 'limited'}
                                onChange={() => setAccessLevel('limited')}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Limited Access</span>
                            </label>
                        </div>

                        {accessLevel === 'limited' && (
                            <div className="pl-6 max-h-32 overflow-y-auto border border-gray-300 rounded p-2">
                            {client.accountGroups.map(group => (
                                <label key={group.id} className="flex items-center py-1 hover:bg-gray-50 px-2 rounded">
                                <input
                                    type="checkbox"
                                    checked={selectedGroups.includes(group.id)}
                                    onChange={() => toggleGroupSelection(group.id)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">{group.name}</span>
                                </label>
                            ))}
                            </div>
                        )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                            </div>
                            </div>
                            <div>
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500">
                                {user.accessLevel === 'full' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Full Access
                                </span>
                                ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Limited Access: {user.allowedGroupIds.length} group(s)
                                </span>
                                )}
                            </div>
                            {user.accessLevel === 'limited' && user.allowedGroupIds.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                Groups: {user.allowedGroupIds.map(getGroupName).join(', ')}
                                </div>
                            )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                            onClick={() => startEditUser(user)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            >
                            Edit
                            </button>
                            <button
                            onClick={() => removeUser(user.email)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                            Remove
                            </button>
                        </div>
                        </div>
                    )}
                    </li>
                ))}
                </ul>
            </div>
            )}
      </div>
        </div>
      {/* Info Panel */}
      {userPermissions.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Access Levels</h4>
              <div className="mt-1 text-sm text-blue-700">
                <p><strong>Full Access:</strong> Users can view and access all account groups in this client.</p>
                <p className="mt-1"><strong>Limited Access:</strong> Users can only view the specific account groups you assign to them.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}