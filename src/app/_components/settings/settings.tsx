import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import WebhookManager from "./webhooks";
import GeneralSettingsPane from "~/app/_components/settings/general";
import type {Session} from "next-auth";

export default function SettingsPanel(
    { session }: Readonly<{ session: Session }>) {
  return (
      <Accordion type="multiple" defaultValue={["general"]} className={"w-full"}>
        <AccordionItem value={"general"}>
          <AccordionTrigger>
            Allgemein
          </AccordionTrigger>
          <AccordionContent>
              <GeneralSettingsPane session={session} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value={"webhooks"}>
          <AccordionTrigger>
            Webhooks
          </AccordionTrigger>
          <AccordionContent>
            <WebhookManager />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
  )
}
