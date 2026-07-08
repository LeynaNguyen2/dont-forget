import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Don't Forget",
  description: "How Don't Forget handles your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-cream px-6 py-12 text-brand-brown">
      <article className="mx-auto max-w-2xl">
        <Link
          href="/signin"
          className="mb-8 inline-block font-sans text-[13px] font-medium text-brand-blue transition hover:opacity-80"
        >
          ← Back
        </Link>

        <h1 className="font-serif text-[28px] font-semibold leading-tight text-brand-brown">
          Privacy Policy — Don&apos;t Forget
        </h1>
        <p className="mt-2 font-sans text-[14px] italic text-brand-brown/60">
          Last updated: June 10, 2026
        </p>

        <div className="mt-10 space-y-8 font-sans text-[15px] leading-relaxed text-brand-brown/85">
          <section>
            <h2 className="mb-3 font-sans text-[16px] font-semibold text-brand-brown">
              What we collect
            </h2>
            <p>
              Don&apos;t Forget accesses your Google Calendar events and Google
              account information (name and email address) when you sign in with
              Google. We also collect your home city and preferred notification
              time, which you provide during onboarding.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-semibold text-brand-brown">
              How we use your data
            </h2>
            <p>
              We use your calendar events and location to generate a
              personalized morning briefing powered by AI. Your data is never
              sold, shared with third parties, or used for advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-semibold text-brand-brown">
              What we store
            </h2>
            <p>
              We store your push notification subscription, home city, and
              notification time preference in our database (Upstash Redis) so we
              can deliver your daily morning brief. We do not permanently store
              your calendar events or Google account password.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-semibold text-brand-brown">
              Third party services
            </h2>
            <p className="mb-3">
              Don&apos;t Forget uses the following services:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Google Calendar API — to read your calendar events</li>
              <li>OpenWeatherMap — to fetch weather for your event locations</li>
              <li>Anthropic Claude — to generate your morning brief</li>
              <li>Vercel — to host the application</li>
              <li>Upstash Redis — to store notification preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-semibold text-brand-brown">
              Data deletion
            </h2>
            <p>
              You can delete your account and all associated data at any time by
              signing out and emailing{" "}
              <a
                href="mailto:leynan246@gmail.com"
                className="font-medium text-brand-blue underline-offset-2 hover:underline"
              >
                leynan246@gmail.com
              </a>{" "}
              with a deletion request.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-semibold text-brand-brown">
              Contact
            </h2>
            <p>
              For any privacy questions contact{" "}
              <a
                href="mailto:leynan246@gmail.com"
                className="font-medium text-brand-blue underline-offset-2 hover:underline"
              >
                leynan246@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
