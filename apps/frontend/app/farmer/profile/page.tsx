import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Shield, User, Wallet } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-green-800" />
                </div>
                <Button variant="outline">Change Photo</Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Samuel" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Kamau" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue="samuel@greenvalleyfarm.ke" 
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  defaultValue="+254712345678" 
                />
              </div>
              
              <Button className="mt-4">Update Profile</Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Land Details */}
        <Card>
          <CardHeader>
            <CardTitle>Farmland Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-gray-600">Nakuru County, Kenya</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium">Land Title</h3>
                  <p className="text-gray-600">Nakuru/Molo/12345</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                </svg>
                <div>
                  <h3 className="font-medium">Total Area</h3>
                  <p className="text-gray-600">5.2 Hectares</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium">Primary Crop</h3>
                  <p className="text-gray-600">Coffee</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Wallet & Security */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start mb-4">
              <Wallet className="h-5 w-5 text-gray-500 mr-3 mt-1" />
              <div>
                <h3 className="font-medium">Connected Wallet</h3>
                <p className="text-sm text-gray-600 break-all">
                  0x742d35Cc6634C0532925a3b844Bc454e4438f44e
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline">Change Wallet</Button>
              <Button variant="secondary">View Transactions</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start mb-4">
              <Shield className="h-5 w-5 text-gray-500 mr-3 mt-1" />
              <div>
                <h3 className="font-medium">KYC Verification</h3>
                <p className="text-sm text-gray-600">Status: Verified</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full">Change Password</Button>
              <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
              <Button variant="outline" className="w-full">View Activity Log</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}