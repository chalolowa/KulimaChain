import { MobileNav } from "@/components/admin/MobileNav";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline text-sm text-gray-600">
                Admin User
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="font-medium">AU</span>
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
