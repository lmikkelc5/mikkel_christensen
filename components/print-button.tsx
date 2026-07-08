"use client";

import { Printer } from "lucide-react";

import { Button } from "./ui/button";

export function PrintButton() {
  return (
    <Button type="button" variant="secondary" onClick={() => window.print()}>
      <Printer className="mr-2 h-4 w-4" />
      Print recipe
    </Button>
  );
}
