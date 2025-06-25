import MobileNav from "@/components/investor/MobileNav";
import Sidebar from "@/components/investor/Sidebar";

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <MobileNav />
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Ready to invest...</h1>
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline text-sm text-gray-600">Investor Account</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-800">I</span>
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}