import React, { useState } from 'react';
import { Maximize2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ResponsivePreviewProps {
    url?: string;
    html?: string;
    css?: string;
    javascript?: string;
    title?: string;
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const DEVICE_DIMENSIONS = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '100%' },
    mobile: { width: '375px', height: '667px' }
};

export function ResponsivePreview({ url, html, css, javascript, title = 'Output Preview' }: ResponsivePreviewProps) {
    const [device, setDevice] = useState<DeviceSize>('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const hasCodeContent = html || css || javascript;
    const hasUrlContent = !!url;

    if (!hasCodeContent && !hasUrlContent) return null;

    const iframeContent = hasCodeContent ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
        ${css || ''}
      </style>
    </head>
    <body>
      ${html || ''}
      <script>${javascript || ''}</script>
    </body>
    </html>
  ` : undefined;

    const PreviewFrame = ({ className = '' }: { className?: string }) => (
        <div
            className={`relative mx-auto transition-all duration-300 ease-in-out bg-white overflow-hidden ${device === 'desktop' ? 'w-full h-full min-h-[400px]' :
                    device === 'tablet' ? 'max-w-[768px] min-h-[600px] border-x border-white/20' :
                        'max-w-[375px] min-h-[667px] rounded-[2rem] border-[8px] border-gray-900 shadow-2xl'
                } ${className}`}
            style={device !== 'desktop' ? DEVICE_DIMENSIONS[device] : {}}
        >
            <iframe
                src={url}
                srcDoc={iframeContent}
                className="w-full h-full border-0 absolute inset-0"
                title={title}
                sandbox="allow-scripts allow-same-origin allow-popups"
            />
        </div>
    );

    return (
        <div className="flex flex-col bg-card/40 backdrop-blur-xl/5 rounded-xl border border-white/10 overflow-hidden group">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDevice('desktop')}
                        className={`h-8 w-8 p-0 ${device === 'desktop' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                        title="Desktop View"
                    >
                        <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDevice('tablet')}
                        className={`h-8 w-8 p-0 ${device === 'tablet' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                        title="Tablet View (768px)"
                    >
                        <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDevice('mobile')}
                        className={`h-8 w-8 p-0 ${device === 'mobile' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                        title="Mobile View (375px)"
                    >
                        <Smartphone className="h-4 w-4" />
                    </Button>
                </div>

                <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-neon-cyan"
                        >
                            <Maximize2 className="h-4 w-4 mr-2" />
                            <span className="text-xs uppercase tracking-wider font-mono">Enlarge</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 border-white/10 bg-background/95 backdrop-blur-3xl overflow-hidden flex flex-col">
                        <VisuallyHidden>
                            <DialogTitle>Fullscreen Code Preview</DialogTitle>
                        </VisuallyHidden>
                        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/40">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDevice('desktop')}
                                    className={`h-8 w-8 p-0 ${device === 'desktop' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Monitor className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDevice('tablet')}
                                    className={`h-8 w-8 p-0 ${device === 'tablet' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Tablet className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDevice('mobile')}
                                    className={`h-8 w-8 p-0 ${device === 'mobile' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Smartphone className="h-4 w-4" />
                                </Button>
                            </div>
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">{title}</span>
                        </div>
                        <div className="flex-1 overflow-auto bg-black/20 p-4 sm:p-8 flex items-center justify-center">
                            <PreviewFrame className="shadow-2xl" />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Inline Preview Window */}
            <div className="relative w-full overflow-auto bg-black/10 flex items-center justify-center min-h-[400px]">
                {device === 'desktop' ? (
                    <PreviewFrame className="w-full h-full min-h-[400px]" />
                ) : (
                    <div className="py-8">
                        <PreviewFrame />
                    </div>
                )}
            </div>
        </div>
    );
}
