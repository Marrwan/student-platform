const env = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
    PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    TINYMCE_API_KEY: process.env.NEXT_PUBLIC_TINYMCE_API_KEY || '',
} as const;

// Optional: Validate critical environment variables
if (typeof window !== 'undefined') {
    if (!env.PAYSTACK_PUBLIC_KEY) {
        console.warn('Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY environment variable');
    }
}

export default env;
