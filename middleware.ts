import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
  },
});

export const config = {
  matcher: [
    "/((?!signin|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
