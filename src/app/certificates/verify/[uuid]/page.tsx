'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { lmsApi } from '@/lib/lms-api-client';
import { CheckCircle2, XCircle, Award, ShieldCheck, Download } from 'lucide-react';

export default function CertificateVerifyPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uuid) {
      verifyCertificate();
    }
  }, [uuid]);

  const verifyCertificate = async () => {
    setLoading(true);
    try {
      const res = await lmsApi.verifyCertificate(uuid);
      setVerification(res);
    } catch (e) {
      setVerification({
        valid: false,
        message: 'Certificate invalid or not found.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Official Credential Verification System
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Certificate Authenticity</h1>
        </div>

        {loading ? (
          <p className="text-slate-500 font-mono text-xs py-8">Verifying certificate signature...</p>
        ) : verification && verification.valid ? (
          <div className="space-y-6 bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold font-mono text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>OFFICIALLY VERIFIED & VALID</span>
            </div>

            <div className="space-y-3 text-left border-t border-b border-slate-800 py-4 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <strong className="text-slate-100">{verification.certificate.student_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Course Completed:</span>
                <strong className="text-indigo-400">{verification.certificate.course_title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issued On:</span>
                <strong className="text-slate-200">
                  {new Date(verification.certificate.issued_at).toLocaleDateString()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Certificate Code:</span>
                <strong className="text-emerald-400">{verification.certificate.code}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-400 space-y-2">
            <XCircle className="w-8 h-8 mx-auto text-rose-500" />
            <h3 className="font-bold text-sm">Invalid Certificate</h3>
            <p className="text-xs text-slate-400">
              {verification?.message || 'The requested certificate UUID could not be verified in our records.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
