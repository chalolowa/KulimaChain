import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { useGovernmentRegistryContract } from "@/hooks/useGovernmentRegistryContract";

interface Authority {
  address: string;
  name: string;
  jurisdiction: string;
  isActive: boolean;
}

interface DeactivateAuthorityModalProps {
  authority: Authority;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeactivateAuthorityModal({ authority, onClose, onSuccess }: DeactivateAuthorityModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { deactivateAuthority, isAuthorityActive } = useGovernmentRegistryContract();

  const handleAction = async () => {
    try {
      setIsLoading(true);

      const authorityStatus = await isAuthorityActive(authority.address)
      
      if (authorityStatus) {
        const tx = await deactivateAuthority(authority.address);
        toast.success('Authority deactivated successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating authority status:', error);
      toast.error(`Failed to ${authority.isActive ? 'deactivate' : 'activate'} authority`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {authority.isActive ? 'Deactivate Authority' : 'Activate Authority'}
          </DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to {authority.isActive ? 'deactivate' : 'activate'} this authority?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-4">
          <p><span className="font-medium">Name:</span> {authority.name}</p>
          <p><span className="font-medium">Jurisdiction:</span> {authority.jurisdiction}</p>
          <p><span className="font-medium">Current Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              authority.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              {authority.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant={authority.isActive ? "destructive" : "default"} 
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading 
              ? 'Processing...' 
              : authority.isActive ? 'Deactivate' : 'Activate'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}