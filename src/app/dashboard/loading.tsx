import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500 relative z-10">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Skeleton className="h-10 w-64 bg-white/10" />
                    <Skeleton className="h-4 w-48 mt-2 bg-white/5" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-card/40 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24 bg-white/10" />
                            <Skeleton className="h-4 w-4 rounded-full bg-white/10" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2 bg-white/10" />
                            <Skeleton className="h-3 w-32 bg-white/5" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Layout Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Assignment Skeleton */}
                    <Card className="bg-card/40 backdrop-blur-xl border-white/10">
                        <CardHeader>
                            <Skeleton className="h-6 w-48 bg-white/10" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-24 w-full bg-white/5 rounded-xl border border-white/5" />
                        </CardContent>
                    </Card>

                    {/* Quick Actions Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24 w-full bg-card/40 backdrop-blur-xl rounded-xl border border-white/10" />
                        ))}
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    <Card className="bg-card/40 backdrop-blur-xl border-white/10">
                        <CardHeader>
                            <Skeleton className="h-6 w-32 bg-white/10" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4 bg-white/5" />
                                        <Skeleton className="h-3 w-1/2 bg-white/5" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
