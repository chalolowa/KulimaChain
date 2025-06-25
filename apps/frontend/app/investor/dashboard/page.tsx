"use client";

import PortfolioChart from "@/components/investor/PortfolioChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Coins, Handshake, Landmark, TrendingUp } from "lucide-react";

export default function InvestorDashboard() {
  const stats = [
    { 
      title: "Portfolio Value", 
      value: "$86,500", 
      change: "+12.4% this month",
      icon: Coins,
      color: "text-blue-500"
    },
    { 
      title: "Active Bids", 
      value: "4 Offers", 
      change: "2 pending response",
      icon: Handshake,
      color: "text-yellow-500"
    },
    { 
      title: "Land Shares", 
      value: "12 Properties", 
      change: "5.2 hectares total",
      icon: Landmark,
      color: "text-green-500"
    },
    { 
      title: "ROI", 
      value: "18.2%", 
      change: "All-time average",
      icon: TrendingUp,
      color: "text-purple-500"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart 
              data={[
                { month: 'Jan', value: 42000 },
                { month: 'Feb', value: 48000 },
                { month: 'Mar', value: 52000 },
                { month: 'Apr', value: 61000 },
                { month: 'May', value: 73000 },
                { month: 'Jun', value: 86500 },
              ]} 
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  action: "Bid Accepted", 
                  token: "Green Valley Farm", 
                  amount: "12,000 USDC",
                  time: "4 hours ago",
                  status: "success"
                },
                { 
                  action: "New Token Available", 
                  token: "Riverbend Farm", 
                  amount: "",
                  time: "1 day ago",
                  status: "info"
                },
                { 
                  action: "Bid Placed", 
                  token: "Sunshine Acres", 
                  amount: "7,800 USDC",
                  time: "2 days ago",
                  status: "pending"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start border-b pb-3 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-full mr-3 mt-1 ${
                    item.status === "success" ? "bg-green-100" : 
                    item.status === "pending" ? "bg-yellow-100" : "bg-blue-100"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === "success" ? "bg-green-500" : 
                      item.status === "pending" ? "bg-yellow-500" : "bg-blue-500"
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-gray-600">{item.token}</p>
                    {item.amount && <p className="text-sm font-medium text-green-600">{item.amount}</p>}
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Token Distribution by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { region: "Nakuru", percentage: 42, value: "$36,300" },
              { region: "Kiambu", percentage: 24, value: "$20,800" },
              { region: "Nyeri", percentage: 18, value: "$15,600" },
              { region: "Meru", percentage: 10, value: "$8,700" },
              { region: "Other", percentage: 6, value: "$5,100" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mx-auto mb-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <span className="text-lg font-bold">{item.percentage}%</span>
                  </div>
                </div>
                <h3 className="font-medium">{item.region}</h3>
                <p className="text-sm text-gray-600">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}