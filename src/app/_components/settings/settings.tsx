import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import WebhookManager from "./webhooks";
import GeneralSettingsPane from "~/app/_components/settings/general";
import { Doc } from "#/_generated/dataModel";

export default function SettingsPanel({
  user,
}: Readonly<{ user: Doc<"users"> }>) {
  return (
    <Accordion type="multiple" defaultValue={["general"]} className={"w-full"}>
      <AccordionItem value={"general"}>
        <AccordionTrigger>Allgemein</AccordionTrigger>
        <AccordionContent>
          <GeneralSettingsPane user={user} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value={"webhooks"}>
        <AccordionTrigger>Webhooks</AccordionTrigger>
        <AccordionContent>
          <WebhookManager />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
