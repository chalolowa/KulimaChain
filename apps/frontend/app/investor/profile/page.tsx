import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Wallet, CreditCard, Landmark, BarChart, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Investor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-800" />
                </div>
                <Button variant="outline">Change Photo</Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Michael" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Johnson" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue="michael@agrifund.co" 
                />
              </div>
              
              <div>
                <Label htmlFor="company">Investment Entity</Label>
                <Input 
                  id="company" 
                  defaultValue="AgriFund Capital Partners" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567" 
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    defaultValue="United States" 
                  />
                </div>
              </div>
              
              <Button className="mt-4">Update Profile</Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Funding History */}
        <Card>
          <CardHeader>
            <CardTitle>Funding History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { date: "Jun 15, 2025", tx: "Token Purchase - GVF", amount: "12,000 USDC", status: "Completed" },
                    { date: "May 28, 2025", tx: "Token Purchase - OWF", amount: "16,500 USDC", status: "Completed" },
                    { date: "May 10, 2025", tx: "Wallet Top-up", amount: "30,000 USDC", status: "Completed" },
                    { date: "Apr 22, 2025", tx: "Token Purchase - HTR", amount: "18,200 USDC", status: "Completed" },
                    { date: "Apr 5, 2025", tx: "Service Fee", amount: "150 USDC", status: "Completed" },
                  ].map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.tx}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{item.amount}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Wallet & Verification */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Digital Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start mb-4">
              <Wallet className="h-5 w-5 text-gray-500 mr-3 mt-1" />
              <div>
                <h3 className="font-medium">Connected Wallet</h3>
                <p className="text-sm text-gray-600 break-all">
                  0x742d35Cc6634C0532925a3b844Bc454e4438f44e
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline">Change Wallet</Button>
              <Button variant="secondary">View Transactions</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <h3 className="font-medium">Visa •••• 1234</h3>
                    <p className="text-sm text-gray-600">Expires 12/2026</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Landmark className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <h3 className="font-medium">Bank Transfer</h3>
                    <p className="text-sm text-gray-600">Acct •••• 6789</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
            
            <Button variant="outline" className="mt-4 w-full">
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Accredited Investor</span>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Verified
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Identity Verification</span>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Verified
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Tax Documents</span>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
            
            <Button variant="outline" className="mt-4 w-full">
              Complete Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}