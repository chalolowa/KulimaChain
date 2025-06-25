import { Button } from "../ui/button";

export default function BidCard({ bid }: { bid: any }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{bid.token}</h3>
          {bid.farmer && (
            <p className="text-sm text-gray-600">Farmer: {bid.farmer}</p>
          )}
        </div>
        <span className="text-lg font-bold text-green-600">{bid.amount}</span>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">{bid.date}</span>
        
        {bid.status === "pending" && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Edit Bid
            </Button>
            <Button variant="destructive" size="sm">
              Cancel
            </Button>
          </div>
        )}
        
        {bid.status === "accepted" && (
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              bid.paymentStatus === "paid" 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {bid.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
            </span>
            {bid.paymentStatus !== "paid" && (
              <Button size="sm">Make Payment</Button>
            )}
          </div>
        )}
        
        {bid.status === "rejected" && (
          <div className="text-sm">
            {bid.reason && <p className="text-red-600">Reason: {bid.reason}</p>}
          </div>
        )}
      </div>
    </div>
  );
}