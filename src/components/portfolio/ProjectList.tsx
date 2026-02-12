'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import ProjectForm from './ProjectForm';

interface Project {
    id: string;
    title: string;
    description: string;
    projectUrl?: string;
    repoUrl?: string;
    technologies: string[];
    imageUrl?: string;
    featured: boolean;
}

interface ProjectListProps {
    projects: Project[];
    onRefresh: () => void;
}

export default function ProjectList({ projects, onRefresh }: ProjectListProps) {
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleSave = async (data: any) => {
        try {
            if (editingProject) {
                await api.updatePortfolioProject(editingProject.id, data);
            } else {
                await api.addPortfolioProject(data);
            }
            onRefresh();
            setIsAdding(false);
            setEditingProject(null);
        } catch (error) {
            console.error('Failed to save project', error);
            alert('Failed to save project');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            setDeletingId(id);
            try {
                await api.deletePortfolioProject(id);
                onRefresh();
            } catch (error) {
                console.error('Failed to delete project', error);
                alert('Failed to delete project');
            } finally {
                setDeletingId(null);
            }
        }
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Projects</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                    + Add Project
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {projects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No projects added yet.</p>
                ) : (
                    projects.map(project => (
                        <div key={project.id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start hover:shadow-sm transition-shadow">
                            {project.imageUrl && (
                                <div className="flex-shrink-0 w-full md:w-32 h-32">
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        {project.title}
                                        {project.featured && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                Featured
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditingProject(project)}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            disabled={deletingId === project.id}
                                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                                        >
                                            {deletingId === project.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-1 text-gray-600 text-sm line-clamp-2">{project.description}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {project.technologies.map(tech => (
                                        <span key={tech} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-3 flex gap-4 text-sm text-indigo-600">
                                    {project.projectUrl && (
                                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                            View Demo ↗
                                        </a>
                                    )}
                                    {project.repoUrl && (
                                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                            View Code ↗
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {(isAdding || editingProject) && (
                <ProjectForm
                    initialData={editingProject}
                    onSave={handleSave}
                    onCancel={() => {
                        setIsAdding(false);
                        setEditingProject(null);
                    }}
                />
            )}
        </div>
    );
}
