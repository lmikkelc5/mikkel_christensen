import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/site-config";

export default function ContactPage() {
  return (
    <div className="page-shell space-y-10 py-12 sm:py-16">
      <SectionHeading
        eyebrow="Contact"
        title="A simple way to get in touch"
        description="The page includes direct contact links today and leaves room for wiring up a form service later."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="space-y-4">
          <ContactRow label="Email" value={siteConfig.email} href={`mailto:${siteConfig.email}`} />
          <ContactRow label="GitHub" value="GitHub profile" href={siteConfig.socialLinks.github} />
          <ContactRow
            label="LinkedIn"
            value="LinkedIn profile"
            href={siteConfig.socialLinks.linkedin}
          />
          <ContactRow label="X / Twitter" value="X profile" href={siteConfig.socialLinks.x} />
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold">Contact form</h2>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            This is a placeholder UI ready to connect to Formspree, Resend, Basin, or a
            custom serverless form handler.
          </p>
          <form className="mt-6 space-y-4">
            <Field label="Name" type="text" />
            <Field label="Email" type="email" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Message</span>
              <textarea
                rows={6}
                placeholder="Tell me a little about your project."
                className="w-full rounded-3xl border bg-transparent px-4 py-3 outline-none focus:border-[var(--color-accent)]"
              />
            </label>
            <Button type="button">Submit placeholder</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function ContactRow({
  label,
  value,
  href
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-3xl bg-[var(--color-accent-soft)] px-4 py-4"
    >
      <span className="font-medium">{label}</span>
      <span className="text-sm text-[var(--color-muted-foreground)]">{value}</span>
    </a>
  );
}

function Field({ label, type }: { label: string; type: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        type={type}
        className="w-full rounded-3xl border bg-transparent px-4 py-3 outline-none focus:border-[var(--color-accent)]"
      />
    </label>
  );
}
