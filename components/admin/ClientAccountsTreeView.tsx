'use client';

import { useState } from 'react';
import { Client, AccountGroup } from '@/types';

interface Props {
  client: Client;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup: (name: string, parentId?: string) => void;
  onUpdateGroup: (groupId: string, updates: { name?: string; parentId?: string | null }) => void;
  onDeleteGroup: (groupId: string) => void;
}

interface TreeNodeProps {
  group: AccountGroup;
  allGroups: AccountGroup[];
  level: number;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onUpdateGroup: (groupId: string, updates: { name?: string; parentId?: string | null }) => void;
  onDeleteGroup: (groupId: string) => void;
}

// Extend AccountGroup to support hierarchy
interface HierarchicalGroup extends AccountGroup {
  parentId?: string;
  children?: HierarchicalGroup[];
}

function TreeNode({
  group,
  allGroups,
  level,
  selectedGroupId,
  onSelectGroup,
  onUpdateGroup,
  onDeleteGroup,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [isEditingParent, setIsEditingParent] = useState(false);

  const hierarchicalGroup = group as HierarchicalGroup;
  const hasChildren = hierarchicalGroup.children && hierarchicalGroup.children.length > 0;

  const handleSaveName = () => {
    if (editName.trim() && editName !== group.name) {
      onUpdateGroup(group.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleChangeParent = (newParentId: string) => {
    onUpdateGroup(group.id, { parentId: newParentId || null });
    setIsEditingParent(false);
  };

  // Get valid parent options (exclude self and descendants)
  const getValidParentOptions = () => {
    const descendants = new Set<string>();
    const collectDescendants = (g: HierarchicalGroup) => {
      descendants.add(g.id);
      g.children?.forEach(collectDescendants);
    };
    collectDescendants(hierarchicalGroup);

    return allGroups.filter(g => !descendants.has(g.id));
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors ${
          selectedGroupId === group.id
            ? 'bg-blue-100 text-blue-900'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        {/* Expand/Collapse */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        
        {/* Spacer if no children */}
        {!hasChildren && <span className="w-4" />}

        {/* Folder Icon */}
        <svg 
          className="w-4 h-4 text-gray-500 flex-shrink-0" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>

        {/* Group Name */}
        <div
          className="flex-1 flex items-center gap-2"
          onClick={() => onSelectGroup(group.id)}
        >
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setEditName(group.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-1 text-gray-700 border border-blue-500 rounded focus:outline-none text-sm"
              autoFocus
            />
          ) : (
            <>
              <span className="flex-1 font-medium text-sm">{group.name}</span>
              <span className="text-xs text-gray-500">
                {group.accounts.length}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 text-gray-600 hover:text-blue-600 text-xs"
            title="Rename"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingParent(!isEditingParent);
            }}
            className="p-1 text-gray-600 hover:text-green-600 text-xs"
            title="Move to another parent"
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${group.name}" and all its subgroups?`)) {
                onDeleteGroup(group.id);
              }
            }}
            className="p-1 text-gray-600 hover:text-red-600 text-xs"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Parent selector */}
      {isEditingParent && (
        <div
          className="ml-8 mb-2 p-2 bg-white border border-gray-300 rounded shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="block text-xs text-gray-700 mb-1">Move to:</label>
          <select
            value={hierarchicalGroup.parentId || ''}
            onChange={(e) => handleChangeParent(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 text-gray-700 rounded text-sm"
          >
            <option value="">Root level</option>
            {getValidParentOptions().map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {hierarchicalGroup.children!.map((child) => (
            <TreeNode
              key={child.id}
              group={child}
              allGroups={allGroups}
              level={level + 1}
              selectedGroupId={selectedGroupId}
              onSelectGroup={onSelectGroup}
              onUpdateGroup={onUpdateGroup}
              onDeleteGroup={onDeleteGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Build tree structure from flat array
function buildTree(groups: AccountGroup[]): HierarchicalGroup[] {
  const groupMap = new Map<string, HierarchicalGroup>();
  const rootGroups: HierarchicalGroup[] = [];

  // First pass: create map of all groups
  groups.forEach(group => {
    const hierarchicalGroup = { ...group, children: [] } as HierarchicalGroup;
    groupMap.set(group.id, hierarchicalGroup);
  });

  // Second pass: build tree structure
  groups.forEach(group => {
    const hierarchicalGroup = groupMap.get(group.id)!;
    const parentId = (group as any).parentId;
    
    if (parentId && groupMap.has(parentId)) {
      const parent = groupMap.get(parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(hierarchicalGroup);
    } else {
      rootGroups.push(hierarchicalGroup);
    }
  });

  return rootGroups;
}

export default function ClientAccountsTreeView({
  client,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
}: Props) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParent, setNewGroupParent] = useState('');

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), newGroupParent || undefined);
      setNewGroupName('');
      setNewGroupParent('');
    }
  };

  const treeGroups = buildTree(client.accountGroups);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Account Groups</h2>
          <button
            onClick={() => onSelectGroup(null)}
            className={`text-sm px-3 py-1 rounded ${
              selectedGroupId === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
        </div>
        
        {/* Create new group */}
        <div className="space-y-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
            placeholder="New group name..."
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select
            value={newGroupParent}
            onChange={(e) => setNewGroupParent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Root level</option>
            {client.accountGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
          >
            Create Group
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
        {client.accountGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No groups yet. Create your first group above.
          </div>
        ) : (
          <div className="space-y-1">
            {treeGroups.map((group) => (
              <TreeNode
                key={group.id}
                group={group}
                allGroups={client.accountGroups}
                level={0}
                selectedGroupId={selectedGroupId}
                onSelectGroup={onSelectGroup}
                onUpdateGroup={onUpdateGroup}
                onDeleteGroup={onDeleteGroup}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}