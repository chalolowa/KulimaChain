import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { useGovernmentRegistryContract } from "@/hooks/useGovernmentRegistryContract";

interface AddAuthorityModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAuthorityModal({ open, onClose, onSuccess }: AddAuthorityModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { addAuthority } = useGovernmentRegistryContract();

  const handleSubmit = async () => {
    if (!name || !address || !jurisdiction || !endpoint) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsLoading(true);
      const result = await addAuthority(address, name, jurisdiction, endpoint);
      toast.success('Authority added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding authority:', error);
      toast.error('Failed to add authority');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Authority</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Authority Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Authority Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            placeholder="Jurisdiction"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />
          <Input
            placeholder="Endpoint (URL or contact)"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Authority'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}