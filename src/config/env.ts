// Helper to sanitize environment variables (remove quotes, trim)
const sanitize = (value: string | undefined | null, fallback: string = ''): string => {
    if (!value) return fallback;
    return value.toString().replace(/^['"]|['"]$/g, '').trim() || fallback;
};

const env = {
    API_URL: sanitize(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:5001/api'),
    PAYSTACK_PUBLIC_KEY: sanitize(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, 'pk_live_d45a5efed923cd64dbdd5f3f637311bdd8b1cc41'),
    TINYMCE_API_KEY: sanitize(process.env.NEXT_PUBLIC_TINYMCE_API_KEY),
} as const;

console.log('Paystack public key:', env.PAYSTACK_PUBLIC_KEY);
// Optional: Validate critical environment variables
if (typeof window !== 'undefined') {
    if (!env.PAYSTACK_PUBLIC_KEY) {
        console.warn('Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY environment variable');
    }
}

export default env;
