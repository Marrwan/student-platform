'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Payment {
    id: string;
    amount: number;
    status: 'pending' | 'success' | 'failed' | 'successful';
    type: string;
    reference: string;
    metadata?: {
        assignmentId?: string;
        submissionId?: string;
    };
    createdAt: string;
}

export default function PaymentsPage() {
    const { user, loading: authLoading } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user) return;
            try {
                const response = await api.getPayments();
                setPayments(response.payments || []);
            } catch (err: any) {
                console.error('Failed to fetch payments:', err);
                setError('Failed to load payment history.');
            } finally {
                setIsLoading(false);
            }
        };

        if (!authLoading) {
            if (user) {
                fetchPayments();
            } else {
                setIsLoading(false);
            }
        }
    }, [user, authLoading]);

    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
            case 'successful':
                return {
                    color: 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20',
                    icon: <CheckCircle className="w-4 h-4 mr-1" />,
                    label: 'Successful'
                };
            case 'pending':
                return {
                    color: 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20',
                    icon: <Clock className="w-4 h-4 mr-1" />,
                    label: 'Pending'
                };
            case 'failed':
                return {
                    color: 'bg-neon-pink/10 text-neon-pink border-neon-pink/20',
                    icon: <XCircle className="w-4 h-4 mr-1" />,
                    label: 'Failed'
                };
            default:
                return {
                    color: 'bg-card/40 text-foreground border-white/20',
                    icon: null,
                    label: status
                };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (authLoading || isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 mt-[72px] md:mt-[88px] max-w-5xl">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent mb-8">
                    Payment History
                </h1>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-card/40 backdrop-blur-xl border-white/10 animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-6 bg-white/5 rounded w-1/4 mb-4" />
                                <div className="h-4 bg-white/5 rounded w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 mt-[72px] md:mt-[88px]">
                <p className="text-center text-muted-foreground">Please log in to view your payments.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-[72px] md:mt-[88px] max-w-5xl">
            <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30">
                    <Receipt className="w-6 h-6 text-neon-cyan" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
                    Payment History
                </h1>
            </div>

            {error ? (
                <Card className="bg-card/40 backdrop-blur-xl border-neon-pink/20">
                    <CardContent className="p-6 text-center text-neon-pink">
                        {error}
                    </CardContent>
                </Card>
            ) : payments.length === 0 ? (
                <Card className="bg-card/40 backdrop-blur-xl border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-violet/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-12 text-center relative z-10">
                        <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No Payments Found</h3>
                        <p className="text-muted-foreground">
                            You haven't made any late fee payments yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {payments.map((payment) => {
                        const statusConfig = getStatusConfig(payment.status);
                        return (
                            <Card
                                key={payment.id}
                                className="bg-card/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-neon-violet/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">

                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg font-bold text-foreground">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                                <Badge className={`flex items-center ${statusConfig.color}`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground flex items-center">
                                                <span className="capitalize">{payment.type.replace('_', ' ')}</span>
                                                {payment.metadata?.assignmentId && (
                                                    <>
                                                        <span className="mx-2 opacity-50">•</span>
                                                        <span>Assignment: <span className="text-foreground/80 font-mono text-xs">{payment.metadata.assignmentId.split('-')[0]}...</span></span>
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        <div className="text-sm text-foreground/60 md:text-right space-y-1">
                                            <p>{new Date(payment.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                            <p className="font-mono text-xs opacity-50 hidden sm:block">Ref: {payment.reference}</p>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
