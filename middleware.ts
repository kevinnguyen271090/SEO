export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portfolio/:path*',
    '/backtest/:path*',
    '/signals/:path*',
    '/settings/:path*',
  ],
}
