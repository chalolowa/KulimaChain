import { Coins, Handshake, MapPin, Ruler } from "lucide-react";
import TokenStatusBadge from "./TokenStatusBadge";
import { Button } from "../ui/button";

export default function TokenCard({ token }: { token: any }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{token.name}</h3>
          <p className="text-gray-600">{token.symbol}</p>
        </div>
        <TokenStatusBadge status={token.status} />
      </div>
      
      <div className="mt-4 space-y-3 flex-1">
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
          <span>{token.location}</span>
        </div>
        <div className="flex items-center text-sm">
          <Ruler className="h-4 w-4 text-gray-500 mr-2" />
          <span>{token.size} Hectares</span>
        </div>
        <div className="flex items-center text-sm">
          <Coins className="h-4 w-4 text-gray-500 mr-2" />
          <span className="font-medium">{token.value}</span>
        </div>
      </div>
      
      {token.status === "available" && token.bids > 0 && (
        <div className="mt-4 flex items-center text-sm bg-blue-50 p-2 rounded">
          <Handshake className="h-4 w-4 text-blue-500 mr-2" />
          <span>{token.bids} active bid(s)</span>
        </div>
      )}
      
      <div className="mt-4 flex justify-between gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          View Details
        </Button>
        {token.status === "available" && (
          <Button variant="secondary" size="sm" className="flex-1">
            Manage Bids
          </Button>
        )}
      </div>
    </div>
  );
}