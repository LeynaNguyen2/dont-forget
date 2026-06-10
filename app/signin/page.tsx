import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import SignInPage from "@/components/SignInPage";
import { authOptions } from "@/lib/auth";
import {
  getPostAuthRedirectPath,
  getUserProfileOrDefault,
} from "@/lib/user-profile";

export default async function SignIn() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    const profile = await getUserProfileOrDefault(session.user.email);
    redirect(getPostAuthRedirectPath(profile));
  }

  return <SignInPage />;
}
