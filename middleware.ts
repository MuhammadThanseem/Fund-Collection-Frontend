import { NextResponse } from 'next/server';

export function middleware(req: any) {
  const token = req.cookies.get('token');
  if (!token && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
