import { FileText, Landmark, MapPin, Percent, Ruler, User } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function TokenDetailsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Green Valley Farm (GVF)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Land Details</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">Nakuru County, Kenya</p>
                    <p className="text-sm">Coordinates: -0.303099, 36.080025</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Ruler className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Size</p>
                    <p className="text-sm text-gray-600">5.2 Hectares</p>
                    <p className="text-sm">Cultivated Area: 4.5 Hectares</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Percent className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Your Ownership</p>
                    <p className="text-sm text-gray-600">15% Share</p>
                    <p className="text-sm">Total Tokens: 10,000</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Legal & Documentation</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Landmark className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Jurisdiction</p>
                    <p className="text-sm text-gray-600">Nakuru County Government</p>
                    <p className="text-sm">Land Registry ID: NKR/ML/12345</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Documents</p>
                    <p className="text-sm text-blue-600">Title Deed (IPFS CID: bafy...1234)</p>
                    <p className="text-sm text-blue-600">Survey Map (IPFS CID: bafy...5678)</p>
                    <p className="text-sm text-blue-600">Ownership Certificate (IPFS CID: bafy...9012)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Farmer Information</h3>
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-500 mr-3 mt-1" />
              <div>
                <p className="font-medium">Samuel Kamau</p>
                <p className="text-sm text-gray-600">10+ years farming experience</p>
                <p className="text-sm">Contact: samuel@greenvalleyfarm.ke</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline">View Land History</Button>
            <div className="space-x-2">
              <Button variant="outline">Generate Report</Button>
              <Button>Sell Shares</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}