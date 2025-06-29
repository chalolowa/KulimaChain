import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";
import { useGovernmentRegistryContract } from "@/hooks/useGovernmentRegistryContract";

interface Authority {
  address: string;
  endpoint: string;
  name: string;
  jurisdiction: string;
}

interface EditAuthorityModalProps {
  authority: Authority;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditAuthorityModal({ authority, onClose, onSuccess }: EditAuthorityModalProps) {
  const [endpoint, setEndpoint] = useState(authority.endpoint);
  const [isLoading, setIsLoading] = useState(false);
  
  const { updateAuthority } = useGovernmentRegistryContract();

  const handleSubmit = async () => {
    if (!endpoint) {
      toast.error('Please enter a valid endpoint');
      return;
    }

    try {
      setIsLoading(true);
      const tx = await updateAuthority(authority.address, endpoint);
      toast.success('Authority updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating authority:', error);
      toast.error('Failed to update authority');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Authority</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">{authority.name}</p>
            <p className="text-sm text-gray-500">{authority.jurisdiction}</p>
          </div>
          
          <Input
            placeholder="New Endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Authority'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}