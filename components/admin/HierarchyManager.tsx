'use client';

import { useState } from 'react';
import { Client, GroupHierarchy } from '@/types';

interface Props {
  client: Client;
  onUpdate: (client: Client) => void;
}

export default function HierarchyManager({ client, onUpdate }: Props) {
  const [newNodeName, setNewNodeName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState<GroupHierarchy | null>(null);

  function createHierarchyNode() {
    if (!newNodeName.trim()) return;

    const parentNode = selectedParentId
      ? findNodeById(client.groupHierarchy, selectedParentId)
      : null;

    const newNode: GroupHierarchy = {
      id: `h-${Date.now()}`,
      name: newNodeName,
      level: parentNode ? parentNode.level + 1 : 1,
      parentId: selectedParentId || undefined,
      children: [],
      accountGroupIds: [],
    };

    if (selectedParentId) {
      // Add as child to parent
      const updatedHierarchy = addChildToNode(client.groupHierarchy, selectedParentId, newNode);
      onUpdate({
        ...client,
        groupHierarchy: updatedHierarchy,
      });
    } else {
      // Add as root level
      onUpdate({
        ...client,
        groupHierarchy: [...client.groupHierarchy, newNode],
      });
    }

    setNewNodeName('');
    setSelectedParentId(null);
  }

  function findNodeById(nodes: GroupHierarchy[], id: string): GroupHierarchy | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function addChildToNode(
    nodes: GroupHierarchy[],
    parentId: string,
    child: GroupHierarchy
  ): GroupHierarchy[] {
    return nodes.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), child],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addChildToNode(node.children, parentId, child),
        };
      }
      return node;
    });
  }

  function deleteNode(id: string) {
    if (!confirm('Are you sure? This will delete this node and all its children.')) return;

    const removeNodeById = (nodes: GroupHierarchy[]): GroupHierarchy[] => {
      return nodes
        .filter(node => node.id !== id)
        .map(node => ({
          ...node,
          children: node.children ? removeNodeById(node.children) : undefined,
        }));
    };

    onUpdate({
      ...client,
      groupHierarchy: removeNodeById(client.groupHierarchy),
    });

    if (selectedNodeForEdit?.id === id) {
      setSelectedNodeForEdit(null);
    }
  }

  function updateNodeAccountGroups(nodeId: string, accountGroupIds: string[]) {
    const updateNode = (nodes: GroupHierarchy[]): GroupHierarchy[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, accountGroupIds };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    onUpdate({
      ...client,
      groupHierarchy: updateNode(client.groupHierarchy),
    });
  }

  function toggleAccountGroupForNode(nodeId: string, accountGroupId: string) {
    const node = findNodeById(client.groupHierarchy, nodeId);
    if (!node) return;

    const currentIds = node.accountGroupIds || [];
    const newIds = currentIds.includes(accountGroupId)
      ? currentIds.filter(id => id !== accountGroupId)
      : [...currentIds, accountGroupId];

    updateNodeAccountGroups(nodeId, newIds);
  }

  function renderHierarchyTree(nodes: GroupHierarchy[], depth: number = 0) {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${depth * 20}px` }} className="mb-2">
        <div
          className={`p-3 border rounded-md cursor-pointer transition-colors ${
            selectedNodeForEdit?.id === node.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedNodeForEdit(node)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Level {node.level}</span>
                <h4 className="font-medium text-gray-900">{node.name}</h4>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {(node.accountGroupIds?.length || 0) > 0
                  ? `${node.accountGroupIds?.length} account group(s)`
                  : 'No account groups assigned'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.id);
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        {node.children && node.children.length > 0 && renderHierarchyTree(node.children, depth + 1)}
      </div>
    ));
  }

  function getAllNodes(nodes: GroupHierarchy[]): GroupHierarchy[] {
    let result: GroupHierarchy[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.children) {
        result = result.concat(getAllNodes(node.children));
      }
    }
    return result;
  }

  const allNodes = getAllNodes(client.groupHierarchy);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Group Hierarchy</h2>
        <p className="text-sm text-gray-600">
          Create multiple levels of hierarchy above your account groups.
          Each level can have a custom name and reference multiple account groups.
        </p>
      </div>

      {/* Create New Node */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Create New Hierarchy Node
        </label>
        <div className="space-y-3">
          <input
            type="text"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="Enter node name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <label className="block text-sm text-gray-600 mb-1">Parent (optional)</label>
            <select
              value={selectedParentId || ''}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Root Level</option>
              {allNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {'  '.repeat(node.level - 1)}Level {node.level}: {node.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={createHierarchyNode}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hierarchy Tree */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Hierarchy Tree</h3>
          {client.groupHierarchy.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-md">
              No hierarchy nodes yet. Create your first node above.
            </div>
          ) : (
            <div>{renderHierarchyTree(client.groupHierarchy)}</div>
          )}
        </div>

        {/* Node Details */}
        <div>
          {selectedNodeForEdit ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {selectedNodeForEdit.name} - Account Groups
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select which account groups should be included in this hierarchy node.
              </p>

              {client.accountGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-md">
                  No account groups available. Create account groups first in the Account Groups tab.
                </div>
              ) : (
                <div className="space-y-2">
                  {client.accountGroups.map(group => {
                    const isSelected = selectedNodeForEdit.accountGroupIds?.includes(group.id) || false;
                    
                    return (
                      <div
                        key={group.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleAccountGroupForNode(selectedNodeForEdit.id, group.id)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{group.name}</div>
                            <div className="text-sm text-gray-500">
                              {group.accounts.length} account{group.accounts.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-md">
              Select a hierarchy node to assign account groups
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
