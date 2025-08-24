'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  DollarSign, 
  Lock, 
  CheckCircle, 
  XCircle,
  Clock,
  FileText,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface OverdueSubmission {
  id: string;
  assignmentTitle: string;
  amount: number;
}

interface BlockStatus {
  isBlocked: boolean;
  reason: string | null;
  totalAmount: number;
  overdueSubmissions: OverdueSubmission[];
}

interface PaymentBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

export function PaymentBlockModal({ open, onOpenChange, onPaymentSuccess }: PaymentBlockModalProps) {
  const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (open) {
      checkBlockStatus();
    }
  }, [open]);

  const checkBlockStatus = async () => {
    try {
      setLoading(true);
      const status = await api.checkUserBlockStatus();
      setBlockStatus(status);
    } catch (error) {
      console.error('Error checking block status:', error);
      toast.error('Failed to check block status');
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPayment = async () => {
    if (!blockStatus) return;

    try {
      setPaymentLoading(true);
      
      // Initialize Paystack payment
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: 'student@example.com', // This should come from user context
        amount: blockStatus.totalAmount * 100, // Convert to kobo
        currency: 'NGN',
        callback: async (response: any) => {
          try {
            // Process the payment on our backend
            await api.processOverduePayment({
              paymentReference: response.reference,
              amount: blockStatus.totalAmount
            });
            
            toast.success('Payment processed successfully! Your access has been restored.');
            onPaymentSuccess();
            onOpenChange(false);
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process payment');
          }
        },
        onClose: () => {
          setPaymentLoading(false);
          toast.error('Payment was cancelled');
        }
      });
      
      handler.openIframe();
    } catch (error: any) {
      toast.error('Failed to initialize payment');
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking your account status...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!blockStatus || !blockStatus.isBlocked) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Granted</h3>
            <p className="text-gray-600">Your account is not blocked. You can continue using the platform.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            Account Access Restricted
          </DialogTitle>
          <DialogDescription>
            Your account has been temporarily blocked due to overdue assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {blockStatus.reason}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">₦{blockStatus.totalAmount.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Overdue Assignments:</h4>
                {blockStatus.overdueSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{submission.assignmentTitle}</span>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      ₦{submission.amount.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Payment Process</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      After successful payment, your account access will be immediately restored and you can continue with your studies.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This payment is required to restore your access to the platform. All payments are processed securely through Paystack.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePaystackPayment} 
            disabled={paymentLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {paymentLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Pay ₦{blockStatus.totalAmount.toLocaleString()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
