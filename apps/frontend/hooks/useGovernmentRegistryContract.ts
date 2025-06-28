import { useAuth } from "@/context/AuthContext";
import { ethers } from "ethers";
import { useMemo } from "react";
import GovernmentRegistryABI from "../../subgraph/abis/GovernmentRegistry.json"; 

export function useGovernmentRegistryContract() {
  const { smartAccount } = useAuth();

  const GOVERNMENT_REGISTRY_ADDRESS = "0x12d310dca3fbdba91eb3d6300d6b0c231185abfe";

  const contract = useMemo(() => {
    if ( !smartAccount?.getAccountAddress()) return null;
    
    try {
      // Get the provider from the smart account
      const provider = smartAccount.rpcProvider;

      return new ethers.Contract(
        GOVERNMENT_REGISTRY_ADDRESS,
        GovernmentRegistryABI
      );
    } catch (error) {
      console.error('Failed to create contract instance:', error);
      return null;
    }
  }, [smartAccount]);

  const addAuthority = async (
    address: string,
    name: string,
    jurisdiction: string,
    endpoint: string
  ) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.addAuthority(address, name, jurisdiction, endpoint);
  };

  const updateAuthority = async (
    address: string,
    newEndpoint: string
  ) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.updateAuthority(address, newEndpoint);
  };

  const deactivateAuthority = async (address: string) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.deactivateAuthority(address);
  };

  return {
    contract,
    addAuthority,
    updateAuthority,
    deactivateAuthority,
  };
}