import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/customers/:path*', '/tasks/:path*', '/campaigns/:path*', '/settings/:path*'],
}
