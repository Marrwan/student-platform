import Link from 'next/link';
import Image from 'next/image';

interface StaffProfileProps {
    user: {
        firstName: string;
        lastName: string;
        jobTitle?: string;
        staffRole?: string;
        department?: { name: string };
        location?: string;
        manager?: { firstName: string; lastName: string };
        joinedAt?: string;
        avatar?: string;
        // Mock ID for display if real ID is UUID
        employeeId?: string; // e.g. A2024433
    };
}

export default function StaffProfileCard({ user }: StaffProfileProps) {
    const completionPercentage = 38; // Mocked for now, or calculate based on fields

    return (
        <div className="bg-card/40 backdrop-blur-xl rounded-xl shadow-sm border border-white/5 p-8 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-foreground mb-6">Profile</h2>

            <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 relative rounded-full overflow-hidden bg-white/5 flex-shrink-0">
                    {user.avatar ? (
                        <Image
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground">{user.firstName} {user.lastName}</h3>
                    <p className="text-muted-foreground mb-1">{user.jobTitle || 'Staff Member'}</p>
                    <div className="flex items-center gap-2 text-neon-cyan text-sm font-medium">
                        <span>{user.employeeId || 'A2024433'}</span>
                        <button className="hover:text-blue-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-t border-white/5 pt-6 mb-8">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Department</p>
                    <p className="text-foreground font-medium">{user.department?.name || 'Not Assigned'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                    <p className="text-foreground font-medium">{user.location || 'Remote'}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Supervisor</p>
                    <p className="text-foreground font-medium">
                        {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : 'None'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Work Anniversary</p>
                    <p className="text-foreground font-medium">
                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'N/A'}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <p className="text-neon-cyan font-bold">{completionPercentage}% Profile Completed</p>
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Edit Now
                </button>
            </div>
        </div>
    );
}
