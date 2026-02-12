'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PortfolioForm from '@/components/portfolio/PortfolioForm';
import ProjectList from '@/components/portfolio/ProjectList';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function PortfolioEditPage() {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPortfolio = async () => {
        try {
            const data = await api.getMyPortfolio();
            console.log('Portfolio data:', data);
            setPortfolio(data);
        } catch (err) {
            console.error('Error fetching portfolio:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPortfolio();
        }
    }, [user]);

    const handleSavePortfolio = async (data: any) => {
        try {
            let result;
            if (portfolio) {
                result = await api.updatePortfolio(data);
            } else {
                result = await api.createPortfolio(data);
            }
            setPortfolio(result);
            alert('Portfolio saved successfully!');
        } catch (err: any) {
            console.error('Error saving portfolio:', err);
            throw err;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading portfolio...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
                    <p className="text-gray-500 mt-2">Manage your public profile and projects</p>
                </div>
                {portfolio?.slug && portfolio?.isPublic && (
                    <Link
                        href={`/portfolio/public/${portfolio.slug}`}
                        target="_blank"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        View Public Page ↗
                    </Link>
                )}
            </div>

            <div className="space-y-8">
                <section>
                    <PortfolioForm initialData={portfolio} onSave={handleSavePortfolio} />
                </section>

                {portfolio ? (
                    <section>
                        <ProjectList projects={portfolio.projects || []} onRefresh={fetchPortfolio} />
                    </section>
                ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Please save your portfolio profile above to start adding projects.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
