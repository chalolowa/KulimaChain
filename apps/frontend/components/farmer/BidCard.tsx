export default function BidCard({ bid }: { bid: any }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{bid.token}</h3>
          <p className="text-sm text-gray-600">From: {bid.investor}</p>
        </div>
        <span className="text-lg font-bold text-green-600">{bid.amount}</span>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">{bid.date}</span>

        {bid.status === "pending" ? (
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Accept
            </button>
            <button className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Reject
            </button>
          </div>
        ) : (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Accepted
          </span>
        )}
      </div>
    </div>
  );
}
