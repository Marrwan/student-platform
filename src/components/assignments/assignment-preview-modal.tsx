'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback, useEffect } from 'react';

interface AssignmentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: {
        title: string;
        description: string;
        type?: string;
        difficulty?: string;
        totalScore?: number;
        deadline?: string;
        startDate?: string;
        allowLateSubmission?: boolean;
        latePenalty?: number;
        requirements?: string;
    } | null;
}

export function AssignmentPreviewModal({
    isOpen,
    onClose,
    assignment,
}: AssignmentPreviewModalProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

    // Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, isFullscreen, onClose]);

    if (!assignment) return null;

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'text-neon-emerald bg-neon-emerald/10 border-neon-emerald/20';
            case 'medium':
                return 'text-neon-amber bg-neon-amber/10 border-neon-amber/20';
            case 'hard':
                return 'text-neon-rose bg-neon-rose/10 border-neon-rose/20';
            default:
                return 'text-muted-foreground bg-muted border-border';
        }
    };

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
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`fixed z-50 ${isFullscreen
                                ? 'inset-0'
                                : 'inset-0 flex items-center justify-center p-4'
                            }`}
                    >
                        <div
                            className={`glass-card neon-border-violet overflow-hidden flex flex-col ${isFullscreen
                                    ? 'w-full h-full rounded-none'
                                    : 'w-full max-w-3xl max-h-[85vh] rounded-xl'
                                }`}
                        >
                            {/* Toolbar */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
                                <div className="flex items-center space-x-3">
                                    <h2 className="text-lg font-bold text-foreground truncate max-w-md">
                                        {assignment.title}
                                    </h2>
                                    {assignment.difficulty && (
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(
                                                assignment.difficulty
                                            )}`}
                                        >
                                            {assignment.difficulty}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={toggleFullscreen}
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-foreground min-h-0 min-w-0 h-8 w-8 p-0"
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="w-4 h-4" />
                                        ) : (
                                            <Maximize2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Button
                                        onClick={onClose}
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-foreground min-h-0 min-w-0 h-8 w-8 p-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Meta info */}
                                <div className="flex flex-wrap gap-4">
                                    {assignment.totalScore && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                                            <span className="text-muted-foreground">
                                                Score: <span className="text-foreground font-medium">{assignment.totalScore} pts</span>
                                            </span>
                                        </div>
                                    )}
                                    {assignment.deadline && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Clock className="w-4 h-4 text-neon-amber" />
                                            <span className="text-muted-foreground">
                                                Deadline:{' '}
                                                <span className="text-foreground font-medium">
                                                    {new Date(assignment.deadline).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </span>
                                        </div>
                                    )}
                                    {assignment.allowLateSubmission && assignment.latePenalty && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <AlertCircle className="w-4 h-4 text-neon-rose" />
                                            <span className="text-muted-foreground">
                                                Late penalty:{' '}
                                                <span className="text-neon-rose font-medium">₦{assignment.latePenalty}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                                        Description
                                    </h3>
                                    <div
                                        className="prose prose-invert text-muted-foreground text-sm leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: assignment.description }}
                                    />
                                </div>

                                {/* Requirements */}
                                {assignment.requirements && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                                            Requirements
                                        </h3>
                                        <div
                                            className="prose prose-invert text-muted-foreground text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: assignment.requirements }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-border/50 flex-shrink-0">
                                <p className="text-xs text-muted-foreground">
                                    Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Esc</kbd> to close
                                    {!isFullscreen && (
                                        <> · Click the expand icon for fullscreen view</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
