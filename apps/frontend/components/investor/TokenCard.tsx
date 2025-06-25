import { Coins, Handshake, Ruler, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";

export default function TokenCard({ token }: { token: any }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-lg">{token.name}</h3>
          <p className="text-gray-600">{token.location}</p>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {token.bids} bids
        </span>
      </div>
      
      <div className="space-y-3 flex-1">
        <div className="flex items-center text-sm">
          <Ruler className="h-4 w-4 text-gray-500 mr-2" />
          <span>Size: {token.size}</span>
        </div>
        <div className="flex items-center text-sm">
          <Coins className="h-4 w-4 text-gray-500 mr-2" />
          <span className="font-medium">Price: {token.price}</span>
        </div>
        <div className="flex items-center text-sm">
          <TrendingUp className="h-4 w-4 text-gray-500 mr-2" />
          <span>Est. ROI: {token.roi}</span>
        </div>
        
        {token.features && (
          <div className="mt-2">
            <p className="text-sm font-medium">Features:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {token.features.map((feature: string, index: number) => (
                <span 
                  key={index} 
                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1">
          View Details
        </Button>
        <Button className="flex-1">
          <Handshake className="mr-2 h-4 w-4" />
          Place Bid
        </Button>
      </div>
    </div>
  );
}