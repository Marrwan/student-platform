'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, XCircle } from 'lucide-react';

interface DeleteAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  assignmentTitle: string;
  submissionCount?: number;
}

export function DeleteAssignmentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  assignmentTitle,
  submissionCount = 0 
}: DeleteAssignmentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Delete Assignment
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> You are about to permanently delete the assignment "{assignmentTitle}".
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What will be deleted:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                The assignment itself
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                All student submissions ({submissionCount} submissions)
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                All submission scores and feedback
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                All related attendance scores
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Leaderboard data for this assignment
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Impact on students:</h4>
            <p className="text-sm text-blue-800">
              Students will lose access to this assignment and all their work will be permanently removed. 
              This may affect their overall class performance and leaderboard rankings.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Assignment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
