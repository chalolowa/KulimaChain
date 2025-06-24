import SidebarContent from "./SidebarContent";

export default function Sidebar() {
  return (
    <div className="hidden md:block md:w-64 bg-white border-r h-screen fixed">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Farmer Portal</h2>
      </div>
      <SidebarContent />
    </div>
  );
}