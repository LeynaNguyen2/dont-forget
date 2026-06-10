import { redirect } from "next/navigation";

import SignInPage from "@/components/SignInPage";
import { getSession } from "@/lib/session";
import {
  getPostAuthRedirectPath,
  getUserProfileOrDefault,
} from "@/lib/user-profile";

export default async function SignIn() {
  const session = await getSession();

  if (session?.user?.email) {
    const profile = await getUserProfileOrDefault(session.user.email);
    redirect(getPostAuthRedirectPath(profile));
  }

  return <SignInPage />;
}
