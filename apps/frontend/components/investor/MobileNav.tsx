import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { SheetTrigger, SheetContent, Sheet } from "../ui/sheet";
import SidebarContent from "./SidebarContent";
import { DialogTitle } from "../ui/dialog";

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button 
          variant="outline" 
          size="icon"
          className="fixed top-4 right-4 z-50"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Investor Portal</h2>
        </div>
        <DialogTitle className="sr-only">Sidebar navigation</DialogTitle>
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}