import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Landmark, ShieldCheck, Users } from "lucide-react";

export default function AdminDashboard() {
  // Mock data - replace with API calls
  const stats = [
    {
      title: "Tokenization Requests",
      value: "24",
      change: "+12%",
      icon: Activity,
    },
    {
      title: "Verifications Pending",
      value: "8",
      change: "-3%",
      icon: ShieldCheck,
    },
    { title: "Active Insurance", value: "42", change: "+5%", icon: Landmark },
    { title: "Total Users", value: "186", change: "+18%", icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Tokenization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Tokenization Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">Green Valley Farm</p>
                    <p className="text-sm text-gray-500">Nakuru, Kenya</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Blockchain Network", status: "Operational" },
                { name: "Database", status: "Operational" },
                { name: "API Services", status: "Degraded" },
                { name: "File Storage", status: "Operational" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "Operational"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
