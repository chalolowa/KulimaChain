import BidCard from "@/components/farmer/BidCard";
import TokenCard from "@/components/farmer/TokenCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SellingPage() {
  return (
    <Tabs defaultValue="tokens">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="tokens">My Tokens</TabsTrigger>
        <TabsTrigger value="bids">Incoming Bids</TabsTrigger>
        <TabsTrigger value="sold">Sold Tokens</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tokens">
        <Card>
          <CardHeader>
            <CardTitle>My Land Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: "Green Valley Farm",
                  symbol: "GVF",
                  status: "available",
                  value: "$15,000",
                  size: "5.2 Ha",
                  location: "Nakuru, Kenya",
                  bids: 3
                },
                {
                  name: "Sunshine Acres",
                  symbol: "SNA",
                  status: "available",
                  value: "$8,500",
                  size: "3.0 Ha",
                  location: "Kiambu, Kenya",
                  bids: 1
                },
                {
                  name: "Riverbend Farm",
                  symbol: "RBF",
                  status: "sold",
                  value: "$12,000",
                  size: "4.5 Ha",
                  location: "Nyeri, Kenya",
                  bids: 0
                }
              ].map((token, index) => (
                <TokenCard key={index} token={token} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="bids">
        <Card>
          <CardHeader>
            <CardTitle>Incoming Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  token: "Green Valley Farm (GVF)",
                  investor: "AgriInvest Ltd",
                  amount: "12,000 AKS",
                  date: "Jun 20, 2025",
                  status: "pending"
                },
                {
                  token: "Sunshine Acres (SNA)",
                  investor: "John Doe",
                  amount: "7,800 AKS",
                  date: "Jun 18, 2025",
                  status: "pending"
                },
                {
                  token: "Green Valley Farm (GVF)",
                  investor: "FarmFund Capital",
                  amount: "11,500 AKS",
                  date: "Jun 15, 2025",
                  status: "accepted"
                }
              ].map((bid, index) => (
                <BidCard key={index} bid={bid} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="sold">
        <Card>
          <CardHeader>
            <CardTitle>Sold Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { token: "Riverbend Farm (RBF)", buyer: "Global Ag Fund", amount: "12,000 AKS", date: "Jun 10, 2025" },
                    { token: "Oakwood Fields (OWF)", buyer: "Jane Smith", amount: "9,500 AKS", date: "May 28, 2025" },
                    { token: "Hilltop Ranch (HTR)", buyer: "AgriInvest Ltd", amount: "18,200 AKS", date: "May 15, 2025" },
                  ].map((sale, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.token}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{sale.buyer}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{sale.amount}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}