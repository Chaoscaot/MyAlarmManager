import type React from "react";
import WebhookManager from "./webhooks";
import GeneralSettingsPane from "~/app/_components/settings/general";
import type { Doc } from "#/_generated/dataModel";

function SettingsSection({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="border-t py-6 first:border-t-0 first:pt-0">
      <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
        {title}
      </h2>
      <p className="text-muted-foreground mt-1 mb-5 text-sm">{description}</p>
      {children}
    </section>
  );
}

export default function SettingsPanel({
  user,
}: Readonly<{ user: Doc<"users"> }>) {
  return (
    <div className="w-full">
      <SettingsSection
        title="Allgemein"
        description="Wie Ihre Fahrzeuge und Ihr Konto angezeigt werden."
      >
        <GeneralSettingsPane user={user} />
      </SettingsSection>
      <SettingsSection
        title="Webhooks"
        description="Alamos meldet neue Einsätze über diese Adressen. Tragen Sie eine Adresse in Alamos als Ziel ein."
      >
        <WebhookManager />
      </SettingsSection>
    </div>
  );
}
