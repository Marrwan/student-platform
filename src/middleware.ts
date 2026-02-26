import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Centralized role → default redirect mapping
const ROLE_REDIRECTS: Record<string, string> = {
    admin: '/admin',
    instructor: '/hrms/dashboard',
    staff: '/hrms/dashboard',
    student: '/dashboard',
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    // Paths that require authentication
    const protectedPaths = ['/dashboard', '/admin', '/hrms', '/profile', '/settings'];

    // Paths reserved for unauthenticated users (login, register, etc.)
    const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.some(path => pathname.startsWith(path));

    // If user is NOT authenticated and tries to access a protected path -> Redirect to Login
    if (!token && isProtectedPath) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // If user IS authenticated and tries to access an auth path -> Redirect to their dashboard
    if (token && isAuthPath) {
        const redirectPath = (userRole && ROLE_REDIRECTS[userRole]) || '/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Role-based protection: Admin only routes
    if (pathname.startsWith('/admin')) {
        if (userRole !== 'admin') {
            const redirectPath = (userRole && ROLE_REDIRECTS[userRole]) || '/dashboard';
            return NextResponse.redirect(new URL(redirectPath, request.url));
        }
    }

    // Role-based protection: HRMS routes (staff, instructor, admin)
    if (pathname.startsWith('/hrms')) {
        if (!userRole || !['staff', 'instructor', 'admin'].includes(userRole)) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg|globals.css).*)',
    ],
};
