'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface PortfolioData {
    bio: string;
    skills: string[];
    socialLinks: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
    };
    isPublic: boolean;
    slug: string;
}

interface PortfolioFormProps {
    initialData?: PortfolioData | null;
    onSave: (data: PortfolioData) => void;
}

export default function PortfolioForm({ initialData, onSave }: PortfolioFormProps) {
    const [formData, setFormData] = useState<PortfolioData>({
        bio: '',
        skills: [],
        socialLinks: {},
        isPublic: true,
        slug: '',
    });
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, [socialKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save portfolio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div>
                <h2 className="text-xl font-semibold mb-4">Portfolio Details</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="grid grid-cols-1 gap-6">
                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Public URL Slug</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                /portfolio/public/
                            </span>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skills</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Add a skill (e.g., React)"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {formData.skills.map(skill => (
                                <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:text-indigo-600 focus:outline-none"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="social_github"
                                value={formData.socialLinks.github || ''}
                                onChange={handleChange}
                                placeholder="GitHub URL"
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <input
                                type="text"
                                name="social_linkedin"
                                value={formData.socialLinks.linkedin || ''}
                                onChange={handleChange}
                                placeholder="LinkedIn URL"
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <input
                                type="text"
                                name="social_twitter"
                                value={formData.socialLinks.twitter || ''}
                                onChange={handleChange}
                                placeholder="Twitter URL"
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <input
                                type="text"
                                name="social_website"
                                value={formData.socialLinks.website || ''}
                                onChange={handleChange}
                                placeholder="Personal Website URL"
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="isPublic"
                                name="isPublic"
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={handleToggle}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isPublic" className="font-medium text-gray-700">Public Profile</label>
                            <p className="text-gray-500">Allow others to view your portfolio via your custom slug.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Portfolio Profile'}
                </button>
            </div>
        </form>
    );
}
