import TokenDetailsCard from "@/components/investor/TokenDetailsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function MyTokensPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">My Land Tokens</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search tokens..." 
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Token Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "LT-001",
                    name: "Green Valley Farm",
                    symbol: "GVF",
                    location: "Nakuru, Kenya",
                    share: "15%",
                    value: "$15,000"
                  },
                  {
                    id: "LT-002",
                    name: "Hilltop Ranch",
                    symbol: "HTR",
                    location: "Nakuru, Kenya",
                    share: "12%",
                    value: "$18,200"
                  },
                  {
                    id: "LT-003",
                    name: "Oakwood Fields",
                    symbol: "OWF",
                    location: "Meru, Kenya",
                    share: "8%",
                    value: "$16,500"
                  },
                  {
                    id: "LT-004",
                    name: "Sunshine Acres",
                    symbol: "SNA",
                    location: "Kiambu, Kenya",
                    share: "6%",
                    value: "$8,500"
                  }
                ].map((token) => (
                  <div 
                    key={token.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{token.name} ({token.symbol})</h3>
                        <p className="text-sm text-gray-600">{token.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{token.value}</p>
                        <p className="text-sm text-gray-600">Share: {token.share}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Token Details */}
        <div className="lg:col-span-2">
          <TokenDetailsCard />
        </div>
      </div>
    </div>
  );
}