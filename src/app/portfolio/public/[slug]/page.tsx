'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function PublicPortfolioPage() {
    const { slug } = useParams();
    const [portfolio, setPortfolio] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                if (typeof slug === 'string') {
                    const data = await api.getPublicPortfolio(slug);
                    setPortfolio(data);
                }
            } catch (err: any) {
                console.error('Error fetching public portfolio:', err);
                setError('Portfolio not found or is private.');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [slug]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500 text-xl font-semibold">{error}</div>;
    if (!portfolio) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header Profile */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    <div className="bg-indigo-600 h-32 md:h-48 w-full"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative bg-white p-2 rounded-full ring-4 ring-white">
                                {portfolio.user?.profilePicture ? (
                                    <img
                                        className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover"
                                        src={portfolio.user.profilePicture}
                                        alt="Profile"
                                    />
                                ) : (
                                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl font-bold">
                                        {portfolio.user?.firstName?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 mb-2">
                                {portfolio.socialLinks?.github && (
                                    <a href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors font-medium">
                                        GitHub
                                    </a>
                                )}
                                {portfolio.socialLinks?.linkedin && (
                                    <a href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors font-medium">
                                        LinkedIn
                                    </a>
                                )}
                                {portfolio.socialLinks?.twitter && (
                                    <a href={portfolio.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors font-medium">
                                        Twitter
                                    </a>
                                )}
                                {portfolio.socialLinks?.website && (
                                    <a href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">{portfolio.user?.firstName} {portfolio.user?.lastName}</h1>
                        <p className="mt-4 text-gray-600 max-w-2xl text-lg leading-relaxed whitespace-pre-line">{portfolio.bio}</p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {portfolio.skills?.map((skill: string) => (
                                <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">Featured Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.projects?.map((project: any) => (
                        <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full border border-gray-100">
                            {project.imageUrl ? (
                                <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="w-full h-48 object-cover"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
                                    No Image Available
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                                    {project.featured && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 uppercase tracking-wide">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{project.description}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.technologies?.slice(0, 5).map((tech: string) => (
                                        <span key={tech} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded font-medium">
                                            {tech}
                                        </span>
                                    ))}
                                    {project.technologies?.length > 5 && (
                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded font-medium">
                                            +{project.technologies.length - 5}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-gray-100 mt-auto">
                                    {project.projectUrl && (
                                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                                            Live Demo ↗
                                        </a>
                                    )}
                                    {project.repoUrl && (
                                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                            View Code ↗
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {(!portfolio.projects || portfolio.projects.length === 0) && (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow border border-gray-100">
                        <p className="text-lg">No projects showcased yet.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
