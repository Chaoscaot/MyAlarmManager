"use client";
import { BadgeAlert, BadgeCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { groupBy } from "~/lib/utils";
import CreateDialog from "./create-dialog";
import { CheckType } from "./page";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";

export const nameMap: Record<CheckType[number], string> = {
  G26: "G26",
  STRECKE: "Strecke",
  UNTERWEISUNG: "Unterweisung",
  UEBUNG: "Übung",
};

export default function AgtPage() {
  const latestChecks = useQuery(api.agt.latest) ?? [];

  const date = new Date();
  const isAble =
    latestChecks.length == 4 &&
    latestChecks.every((check) => {
      const nextCheckDate = new Date(
        check.year + check.validity,
        check.month - 1,
      );
      return date < nextCheckDate;
    });

  const nextChecks = groupBy(
    latestChecks.map((check) => {
      const nextCheckDate = new Date(
        check.year + check.validity,
        check.month - 1,
      );
      return {
        ...check,
        nextCheckDate,
      };
    }),
    "type",
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:flex-row">
      <div>
        <Card className="md:w-fit">
          <CardHeader>
            <CardTitle>Tauglichkeit</CardTitle>
          </CardHeader>
          <CardContent>
            {isAble ? (
              <BadgeCheck className="h-24 w-24" stroke="green" />
            ) : (
              <BadgeAlert className="h-24 w-24" stroke="red" />
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="flex-1">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vorraussetzung</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Gültigkeit</TableHead>
                <TableHead>Nächste</TableHead>
                <TableHead>
                  <CreateDialog>
                    <Button>Hinzufügen</Button>
                  </CreateDialog>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(nameMap).map((type) => {
                const check = nextChecks[type]?.[0];
                if (!check) return null;
                const isAble = date < check.nextCheckDate;
                return (
                  <TableRow key={check._id}>
                    <TableCell>{nameMap[type]}</TableCell>
                    <TableCell>
                      {check.month}/{check.year}
                    </TableCell>
                    <TableCell>{check.validity} Jahre</TableCell>
                    <TableCell
                      className={"font-bold " + (isAble ? "" : "text-red-600")}
                    >
                      {check.nextCheckDate.getMonth() + 1}/
                      {check.nextCheckDate.getUTCFullYear()}
                    </TableCell>
                    <TableCell>
                      <CreateDialog type={check.type}>
                        <Button>Aktualisieren</Button>
                      </CreateDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
