'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CreditCard, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OverdueAssignment {
    id: string;
    assignmentTitle: string;
    amount: number;
}

interface AssignmentBlockedModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason: string;
    totalAmount: number;
    overdueSubmissions: OverdueAssignment[];
    onPayNow?: () => void;
}

export function AssignmentBlockedModal({
    isOpen,
    onClose,
    reason,
    totalAmount,
    overdueSubmissions,
    onPayNow,
}: AssignmentBlockedModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="glass-card w-full max-w-md p-6 neon-border-cyan">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors min-h-0 min-w-0"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Warning icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 rounded-full bg-neon-amber/10 flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-neon-amber animate-glow-pulse" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-foreground text-center mb-2">
                                Assignment Access Blocked
                            </h2>

                            {/* Reason */}
                            <p className="text-muted-foreground text-center text-sm mb-6">
                                {reason}
                            </p>

                            {/* Overdue list */}
                            {overdueSubmissions.length > 0 && (
                                <div className="space-y-2 mb-6">
                                    <h3 className="text-sm font-medium text-foreground">Pending Payments:</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {overdueSubmissions.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-card/40 backdrop-blur-xl/[0.03] border border-border/50"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm text-foreground">{sub.assignmentTitle}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-neon-amber">
                                                    ₦{sub.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Total */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-neon-amber/5 border border-neon-amber/20 mb-6">
                                <span className="text-sm font-medium text-foreground">Total Amount</span>
                                <span className="text-lg font-bold text-neon-amber">
                                    ₦{totalAmount.toLocaleString()}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 border-border/50"
                                >
                                    Go Back
                                </Button>
                                {onPayNow && (
                                    <Button
                                        onClick={onPayNow}
                                        className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Pay Now
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
