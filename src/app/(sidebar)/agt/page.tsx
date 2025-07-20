import AgtPage from "./tables";

export default async function Page() {
  return <AgtPage />;
}

export type CheckType = "G26" | "STRECKE" | "UNTERWEISUNG" | "UEBUNG";
