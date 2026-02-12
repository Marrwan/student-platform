'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ActionItemsListProps {
    standupId?: string; // If provided, show action items for this standup
    showMyItems?: boolean; // If true, show items assigned to current user
}

export default function ActionItemsList({ standupId, showMyItems = false }: ActionItemsListProps) {
    const [actionItems, setActionItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ description: '', assignedTo: '', dueDate: '' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchActionItems();
    }, [standupId, showMyItems]);

    const fetchActionItems = async () => {
        setLoading(true);
        try {
            if (showMyItems) {
                // @ts-ignore
                const data = await api.getMyActionItems();
                setActionItems(data);
            } else if (standupId) {
                // @ts-ignore
                const standup = await api.getStandupById(standupId);
                setActionItems(standup.actionItems || []);
            }
        } catch (error) {
            console.error('Failed to fetch action items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!standupId) return;

        try {
            // @ts-ignore
            await api.createActionItem(standupId, newItem);
            setNewItem({ description: '', assignedTo: '', dueDate: '' });
            setShowForm(false);
            fetchActionItems();
        } catch (error) {
            console.error('Failed to create action item:', error);
        }
    };

    const handleUpdateStatus = async (itemId: string, newStatus: string) => {
        try {
            // @ts-ignore
            await api.updateActionItem(itemId, { status: newStatus });
            fetchActionItems();
        } catch (error) {
            console.error('Failed to update action item:', error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-gray-100 text-gray-700',
            in_progress: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return <div className="text-center py-4 text-gray-500">Loading action items...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Action Items</h3>
                {standupId && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        + Add Action Item
                    </button>
                )}
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreateItem} className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <input
                        type="text"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="What needs to be done?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={newItem.assignedTo}
                            onChange={(e) => setNewItem({ ...newItem, assignedTo: e.target.value })}
                            placeholder="Assigned to (User ID)"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            required
                        />
                        <input
                            type="date"
                            value={newItem.dueDate}
                            onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Action Items List */}
            <div className="space-y-2">
                {actionItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        No action items yet
                    </div>
                ) : (
                    actionItems.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-gray-900 font-medium mb-1">{item.description}</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        {item.assignee && (
                                            <span>👤 {item.assignee.firstName} {item.assignee.lastName}</span>
                                        )}
                                        {item.dueDate && (
                                            <span>📅 {new Date(item.dueDate).toLocaleDateString()}</span>
                                        )}
                                        {item.standup && (
                                            <span>📋 {item.standup.title}</span>
                                        )}
                                    </div>
                                </div>
                                <select
                                    value={item.status}
                                    onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)} border-0`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
