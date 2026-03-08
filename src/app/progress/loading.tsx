import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProgressLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Skeleton className="h-10 w-48 bg-white/10" />
                    <Skeleton className="h-4 w-64 mt-2 bg-white/5" />
                </div>
                <Skeleton className="h-10 w-32 bg-white/10" />
            </div>

            <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="bg-black/40 border border-white/10 p-1 w-full max-w-xs mb-8">
                    <TabsTrigger value="timeline" className="flex-1" disabled><Skeleton className="h-4 w-16" /></TabsTrigger>
                    <TabsTrigger value="topics" className="flex-1" disabled><Skeleton className="h-4 w-16" /></TabsTrigger>
                </TabsList>

                <section className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-6 w-32 bg-white/10" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 bg-white/10" />
                            <Skeleton className="h-8 w-8 bg-white/10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {/* Calendar Days Header */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center">
                                <Skeleton className="h-4 w-8 mx-auto bg-white/5" />
                            </div>
                        ))}

                        {/* Calendar Grid Skeletons */}
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="min-h-[80px] p-2 border border-white/5 rounded-lg bg-card/20 backdrop-blur-sm">
                                <Skeleton className="h-4 w-4 mb-2 bg-white/10" />
                                <div className="space-y-1">
                                    {Math.random() > 0.7 && <Skeleton className="h-3 w-full bg-neon-cyan/20" />}
                                    {Math.random() > 0.8 && <Skeleton className="h-3 w-full bg-neon-emerald/20" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Card className="bg-card/40 backdrop-blur-xl border-white/10 mt-6 max-w-md">
                        <CardContent className="p-4 flex gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded bg-white/10" />
                                    <Skeleton className="h-3 w-16 bg-white/5" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </Tabs>
        </div>
    );
}
