"use client";

import RainfallChart from "@/components/farmer/RainfallChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";

export default function InsurancePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Weather Data */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Weather Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <CloudRain className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-medium">Rainfall</h3>
                <p className="text-2xl font-bold">42mm</p>
                <p className="text-sm text-gray-600">this month</p>
              </div>
              <div className="text-center">
                <Droplets className="h-8 w-8 mx-auto text-blue-300" />
                <h3 className="font-medium">Soil Moisture</h3>
                <p className="text-2xl font-bold">58%</p>
                <p className="text-sm text-gray-600">optimal</p>
              </div>
              <div className="text-center">
                <Thermometer className="h-8 w-8 mx-auto text-orange-500" />
                <h3 className="font-medium">Temperature</h3>
                <p className="text-2xl font-bold">22°C</p>
                <p className="text-sm text-gray-600">average</p>
              </div>
              <div className="text-center">
                <Wind className="h-8 w-8 mx-auto text-gray-500" />
                <h3 className="font-medium">Wind</h3>
                <p className="text-2xl font-bold">12km/h</p>
                <p className="text-sm text-gray-600">moderate</p>
              </div>
            </div>
            
            <RainfallChart 
              data={[
                { month: 'Jan', rainfall: 45 },
                { month: 'Feb', rainfall: 52 },
                { month: 'Mar', rainfall: 60 },
                { month: 'Apr', rainfall: 82 },
                { month: 'May', rainfall: 75 },
                { month: 'Jun', rainfall: 42 },
              ]} 
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Insurance Actions */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Drought Protection</h3>
                    <p className="text-sm text-gray-600">Policy #INS-245</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Coverage Progress</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline">View Details</Button>
                  <Button 
                    variant="secondary"
                    className="bg-green-100 hover:bg-green-200 text-green-800"
                  >
                    Claim Payout
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Purchase Insurance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">Drought Protection</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Payout triggered when rainfall falls below 30mm/month
                </p>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold">150 AKS</span>
                    <span className="text-gray-600 text-sm"> / month</span>
                  </div>
                  <Button>Purchase</Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">Flood Protection</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Payout triggered when rainfall exceeds 100mm/month
                </p>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold">120 AKS</span>
                    <span className="text-gray-600 text-sm"> / month</span>
                  </div>
                  <Button>Purchase</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}