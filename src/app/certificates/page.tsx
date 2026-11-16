'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { lmsApi } from '@/lib/lms-api-client';
import { Certificate } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Download, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await lmsApi.getUserCertificates();
      setCertificates(res.data || []);
    } catch (error) {
      console.error('Failed to load certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert: Certificate) => {
    try {
      toast.loading('Preparing PDF...', { id: 'pdf' });
      const blob = await lmsApi.downloadCertificate(cert.uuid);
      const title = cert.course_title || cert.course?.title || 'Certificate';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${title.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Certificate downloaded!', { id: 'pdf' });
    } catch (error) {
      toast.error('Failed to download certificate', { id: 'pdf' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-amber/10 border border-neon-amber/20 text-neon-amber text-xs font-bold uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" />
            <span>Official Credentials</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">Earned Certificates</h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Verifiable PDF certificates awarded upon 100% completion of course curriculum and test suites.
          </p>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-card/20 border border-dashed border-white/10 space-y-4">
            <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h3 className="text-lg font-bold text-white">No certificates earned yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Complete all lessons and pass all automated test challenges in any enrolled course to earn your verified certificate.
            </p>
            <Button asChild className="bg-neon-cyan text-black font-bold text-xs rounded-xl mt-2">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-neon-amber/40 transition-all p-6 space-y-6"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-amber to-neon-violet p-0.5 flex items-center justify-center">
                    <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
                      <Award className="w-6 h-6 text-neon-amber" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neon-emerald bg-neon-emerald/10 px-2.5 py-1 rounded-full border border-neon-emerald/20 font-bold">
                    VERIFIED
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{cert.course_title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Issued on {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-muted-foreground font-mono truncate">
                  UUID: {cert.uuid}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => handleDownload(cert)}
                    className="flex-1 bg-neon-amber text-black hover:bg-neon-amber/90 font-bold text-xs py-5 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span>Download PDF</span>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 text-xs font-bold py-5 rounded-xl"
                  >
                    <Link href={`/certificates/verify/${cert.uuid}`} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      <span>Verify</span>
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
