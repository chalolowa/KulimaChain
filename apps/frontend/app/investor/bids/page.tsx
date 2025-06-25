import BidCard from "@/components/investor/BidCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyBidsPage() {
  return (
    <Tabs defaultValue="pending">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="accepted">Accepted</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>Pending Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "BID-001",
                  token: "Green Valley Farm (GVF)",
                  amount: "12,000 USDC",
                  date: "Jun 20, 2025",
                  status: "pending",
                  farmer: "Samuel Kamau"
                },
                {
                  id: "BID-002",
                  token: "Sunshine Acres (SNA)",
                  amount: "7,800 USDC",
                  date: "Jun 18, 2025",
                  status: "pending",
                  farmer: "Jane Muthoni"
                }
              ].map((bid) => (
                <BidCard key={bid.id} bid={bid} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="accepted">
        <Card>
          <CardHeader>
            <CardTitle>Accepted Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "BID-003",
                  token: "Hilltop Ranch (HTR)",
                  amount: "18,000 USDC",
                  date: "Jun 15, 2025",
                  status: "accepted",
                  farmer: "James Omondi",
                  paymentStatus: "pending"
                },
                {
                  id: "BID-004",
                  token: "Oakwood Fields (OWF)",
                  amount: "16,500 USDC",
                  date: "May 28, 2025",
                  status: "accepted",
                  farmer: "Peter Maina",
                  paymentStatus: "paid"
                }
              ].map((bid) => (
                <BidCard key={bid.id} bid={bid} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="rejected">
        <Card>
          <CardHeader>
            <CardTitle>Rejected Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "BID-005",
                  token: "Meadowlands (MDL)",
                  amount: "6,800 USDC",
                  date: "May 20, 2025",
                  status: "rejected",
                  farmer: "Sarah Atieno",
                  reason: "Bid too low"
                },
                {
                  id: "BID-006",
                  token: "Riverbend Farm (RBF)",
                  amount: "10,500 USDC",
                  date: "May 15, 2025",
                  status: "rejected",
                  farmer: "David Njoroge",
                  reason: "Token no longer available"
                }
              ].map((bid) => (
                <BidCard key={bid.id} bid={bid} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}