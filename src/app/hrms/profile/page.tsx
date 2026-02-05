'use client';

import { useEffect, useState } from 'react';
import StaffProfileCard from '@/components/hrms/StaffProfileCard';
// import { useAuth } from '@/components/providers/auth-provider'; // Assume this exists
import { api } from '@/lib/api';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // @ts-ignore
                const { user } = await api.getProfile();
                setUser(user);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <StaffProfileCard user={user} />
        </div>
    );
}
