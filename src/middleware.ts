import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    // Paths that require authentication
    const protectedPaths = ['/dashboard', '/admin', '/hrms', '/profile', '/settings'];

    // Paths reserved for unauthenticated users (login, register, etc.)
    const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

    // Check if the current path is protected
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    // Check if the current path is an auth path
    const isAuthPath = authPaths.some(path => pathname.startsWith(path));

    // If user is NOT authenticated and tries to access a protected path -> Redirect to Login
    if (!token && isProtectedPath) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // If user IS authenticated and tries to access an auth path -> Redirect to Dashboard (or Admin)
    if (token && isAuthPath) {
        if (userRole === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        } else if (userRole === 'partial_admin') {
            return NextResponse.redirect(new URL('/hrms/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Role-based protection: Admin only routes
    if (pathname.startsWith('/admin')) {
        if (userRole !== 'admin') {
            // Not an admin, redirect to their dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Role-based protection: HRMS only routes
    if (pathname.startsWith('/hrms')) {
        if (userRole !== 'partial_admin' && userRole !== 'admin') {
            // Not authorized, redirect
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg|globals.css).*)',
    ],
};
