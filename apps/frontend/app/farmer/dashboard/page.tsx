"use client";

import TokenStatusChart from "@/components/farmer/TokenStatusChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Handshake, ShieldCheck, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

export default function FarmerDashboard() {
  const stats = [
    { 
      title: "Total Tokens", 
      value: "15", 
      change: "+3 this month",
      icon: Coins,
      color: "text-blue-500"
    },
    { 
      title: "Active Insurance", 
      value: "2 Policies", 
      change: "Renew in 30 days",
      icon: ShieldCheck,
      color: "text-green-500"
    },
    { 
      title: "Pending Bids", 
      value: "5 Offers", 
      change: "2 new today",
      icon: Handshake,
      color: "text-yellow-500"
    },
    { 
      title: "Token Value", 
      value: "$24,500", 
      change: "+12% this month",
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
        {/* Token Status */}
        <Card>
          <CardHeader>
            <CardTitle>Token Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenStatusChart 
              data={[
                { name: "Verified", value: 8 },
                { name: "Pending", value: 3 },
                { name: "Rejected", value: 1 },
                { name: "Sold", value: 3 },
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
                  action: "New Bid Received", 
                  token: "Green Valley Farm", 
                  amount: "12,000 USDC",
                  time: "2 hours ago"
                },
                { 
                  action: "Insurance Payment", 
                  token: "Policy #INS-245", 
                  amount: "150 USDC",
                  time: "1 day ago"
                },
                { 
                  action: "Token Approved", 
                  token: "Sunshine Acres", 
                  amount: "",
                  time: "3 days ago"
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start border-b pb-3 last:border-0 last:pb-0">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <div className="bg-blue-500 w-2 h-2 rounded-full"></div>
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

      {/* Weather Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <CardTitle>Weather Advisory</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Low rainfall expected in your region (Nakuru County) next week. 
            Consider irrigation preparations. Current soil moisture: 42%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}