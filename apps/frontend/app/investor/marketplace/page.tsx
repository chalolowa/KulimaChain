import TokenCard from "@/components/investor/TokenCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, MapPin, Search } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">Land Token Marketplace</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>
            <MapPin className="mr-2 h-4 w-4" />
            Map View
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search land tokens..." 
                className="pl-10"
              />
            </div>
            <Input placeholder="Location" />
            <Input placeholder="Min. Hectares" type="number" />
            <Button className="w-full">Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            id: "LT-001",
            name: "Green Valley Farm",
            location: "Nakuru, Kenya",
            size: "5.2 Ha",
            price: "$15,000",
            roi: "12.4%",
            bids: 3,
            features: ["Coffee Farm", "Irrigation", "Verified Title"]
          },
          {
            id: "LT-002",
            name: "Sunshine Acres",
            location: "Kiambu, Kenya",
            size: "3.0 Ha",
            price: "$8,500",
            roi: "9.8%",
            bids: 1,
            features: ["Tea Plantation", "Near Highway"]
          },
          {
            id: "LT-003",
            name: "Riverbend Farm",
            location: "Nyeri, Kenya",
            size: "4.5 Ha",
            price: "$12,000",
            roi: "15.2%",
            bids: 0,
            features: ["River Access", "Fertile Soil"]
          },
          {
            id: "LT-004",
            name: "Oakwood Fields",
            location: "Meru, Kenya",
            size: "6.8 Ha",
            price: "$18,200",
            roi: "11.7%",
            bids: 2,
            features: ["Mixed Crops", "Storage Facilities"]
          },
          {
            id: "LT-005",
            name: "Hilltop Ranch",
            location: "Nakuru, Kenya",
            size: "7.5 Ha",
            price: "$21,500",
            roi: "13.9%",
            bids: 4,
            features: ["Livestock", "Water Well"]
          },
          {
            id: "LT-006",
            name: "Meadowlands",
            location: "Kiambu, Kenya",
            size: "2.8 Ha",
            price: "$7,200",
            roi: "8.5%",
            bids: 0,
            features: ["Urban Proximity", "Development Potential"]
          }
        ].map((token) => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <div className="flex space-x-2">
          <Button variant="outline" disabled>Previous</Button>
          <Button variant="outline">1</Button>
          <Button>2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
}