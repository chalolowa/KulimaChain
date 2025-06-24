import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import SidebarContent from "./SidebarContent";
import { DialogTitle } from "../ui/dialog";

export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild className="md:hidden">
                <Button 
                variant="outline" 
                size="icon"
                className="fixed top-4 right-4 z-50"
                >
                <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
                <DialogTitle className="sr-only">Sidebar navigation</DialogTitle>
                <SidebarContent />
            </SheetContent>
        </Sheet>
    );
}
