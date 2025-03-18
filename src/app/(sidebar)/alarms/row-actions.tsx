import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import {Edit, Menu, Trash} from "lucide-react";

function RowActions({ id }: Readonly<{ id: string }>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
          <DropdownMenuItem><Edit /> Bearbeiten</DropdownMenuItem>
          <DropdownMenuItem><Trash /> Löschen</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default RowActions;
