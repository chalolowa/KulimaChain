"use client";

import { FileUpload } from "@/components/farmer/FileUpload";
import TokenStatusBadge from "@/components/farmer/TokenStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { grantAccess, uploadFiles, UploadResult } from "@/lib/lighthouse";
import { useState } from "react";
import { toast } from "sonner";

export default function TokenizationPage() {
  const { user, smartAccount } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadResult>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!user || !smartAccount || selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const wallet_address = await smartAccount.getAccountAddress();
      // Upload files
      const results = await uploadFiles(selectedFiles, wallet_address);
      setUploadStatus(results);

      // Get successful uploads
      const successfulCids = Object.entries(results)
        .filter(([_, status]) => status.status === 'pending')
        .map(([_, status]) => status.cid);

      // Grant access to verifiers
      if (successfulCids.length > 0) {
        await grantAccess(successfulCids, '0xVerifierAddress1');
        await grantAccess(successfulCids, '0xVerifierAddress2');
      }

      // Submit tokenization request
      await submitTokenizationRequest();
    } catch (error) {
      console.error('Upload process failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const submitTokenizationRequest = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Submitting verification request...',
        success: () => {
          return 'Verification request submitted! Authorities will review your documents';
        },
        error: 'Failed to submit request'
      }
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="create">Create Token</TabsTrigger>
          <TabsTrigger value="status">Verification Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Tokenize Your Farmland</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tokenName">Token Name</Label>
                    <Input 
                      id="tokenName" 
                      placeholder="Green Valley Farm" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="tokenSymbol">Token Symbol</Label>
                    <Input 
                      id="tokenSymbol" 
                      placeholder="GVF25" 
                      maxLength={5}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Land Documents</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload land title deed, survey maps, national id and ownership proofs
                  </p>
                  <FileUpload 
                    accept=".pdf,.jpg,.png,.doc" 
                    maxFiles={5} 
                    maxSize={10 * 1024 * 1024} 
                    onFilesSelected={() => {setSelectedFiles}} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="landSize">Land Size (Hectares)</Label>
                  <Input 
                    id="landSize" 
                    type="number" 
                    placeholder="5.2" 
                    step="0.1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Nakuru, Kenya" 
                  />
                </div>
                
                <Button className="mt-4 w-full sm:w-auto" onClick={handleUpload}>
                  Submit for Verification
                </Button>
                {/* Display upload status */}
              {Object.entries(uploadStatus).map(([fileName, status]) => (
                <div key={fileName}>
                  {fileName}: {status.status === 'pending' 
                    ? `Uploaded (CID: ${status.cid.slice(0, 12)}...)` 
                    : 'Failed'}
                </div>
              ))}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Tokenization Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Green Valley Farm",
                    symbol: "GVF",
                    date: "Jun 15, 2025",
                    status: "approved",
                    cid: "bafybeigdyr..."
                  },
                  {
                    name: "Sunshine Acres",
                    symbol: "SNA",
                    date: "Jun 10, 2025",
                    status: "pending",
                    cid: "bafybeigdyr..."
                  },
                  {
                    name: "Riverbend Farm",
                    symbol: "RBF",
                    date: "May 28, 2025",
                    status: "rejected",
                    cid: "bafybeigdyr..."
                  }
                ].map((token, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{token.name} ({token.symbol})</div>
                      <div className="text-sm text-gray-600">Submitted: {token.date}</div>
                      {token.cid && (
                        <div className="text-xs text-blue-600 mt-1 truncate max-w-[200px]">
                          CID: {token.cid}
                        </div>
                      )}
                    </div>
                    <TokenStatusBadge status={token.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}