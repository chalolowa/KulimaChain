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
      //Create contract instance
      const contractInstance = new ethers.Contract(
        GOVERNMENT_REGISTRY_ADDRESS,
        GovernmentRegistryABI
      );

      return contractInstance;
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
    if (!contract || !smartAccount) throw new Error('Contract or smartAccount not initialized');
    
    try {
      // For write operations with Biconomy Smart Account, we need to use sendTransaction
      const txData = contract.interface.encodeFunctionData("addAuthority", [
        address, 
        name, 
        jurisdiction, 
        endpoint
      ]);

      const transaction = {
        to: GOVERNMENT_REGISTRY_ADDRESS,
        data: txData,
        value: 0, // assuming no ETH transfer needed
      };

      // Send transaction through Biconomy Smart Account
      const userOpResponse = await smartAccount.sendTransaction(transaction);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      
      return transactionHash;
    } catch (error) {
      console.error('Add authority transaction failed:', error);
      throw error;
    }
  };

  const updateAuthority = async (
    address: string,
    newEndpoint: string
  ) => {
    if (!contract || !smartAccount) throw new Error('Contract or smartAccount not initialized');
    
    try {
      const txData = contract.interface.encodeFunctionData("updateAuthority", [
        address, 
        newEndpoint
      ]);

      const transaction = {
        to: GOVERNMENT_REGISTRY_ADDRESS,
        data: txData,
        value: 0,
      };

      const userOpResponse = await smartAccount.sendTransaction(transaction);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      
      return transactionHash;
    } catch (error) {
      console.error('Update authority transaction failed:', error);
      throw error;
    }
  };

  const deactivateAuthority = async (address: string) => {
    if (!contract || !smartAccount) throw new Error('Contract or smartAccount not initialized');
    
    try {
      const txData = contract.interface.encodeFunctionData("deactivateAuthority", [address]);

      const transaction = {
        to: GOVERNMENT_REGISTRY_ADDRESS,
        data: txData,
        value: 0,
      };

      const userOpResponse = await smartAccount.sendTransaction(transaction);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      
      return transactionHash;
    } catch (error) {
      console.error('Deactivate authority transaction failed:', error);
      throw error;
    }
  };

  const verifyDocument = async (
    proofHash: string,
    titleDeedHash: string,
    nationalIdHash: string
  ) => {
    if (!contract || !smartAccount) throw new Error('Contract or Smart Account not initialized');
    
    try {
      const txData = contract.interface.encodeFunctionData("verifyDocument", [
        proofHash,
        titleDeedHash,
        nationalIdHash
      ]);

      const transaction = {
        to: GOVERNMENT_REGISTRY_ADDRESS,
        data: txData,
        value: 0,
      };

      const userOpResponse = await smartAccount.sendTransaction(transaction);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      
      return transactionHash;
    } catch (error) {
      console.error('Verify document transaction failed:', error);
      throw error;
    }
  };

  const revokeVerification = async (proofHash: string) => {
    if (!contract || !smartAccount) throw new Error('Contract or Smart Account not initialized');
    
    try {
      const txData = contract.interface.encodeFunctionData("revokeVerification", [proofHash]);

      const transaction = {
        to: GOVERNMENT_REGISTRY_ADDRESS,
        data: txData,
        value: 0,
      };

      const userOpResponse = await smartAccount.sendTransaction(transaction);
      const { transactionHash } = await userOpResponse.waitForTxHash();
      
      return transactionHash;
    } catch (error) {
      console.error('Revoke verification transaction failed:', error);
      throw error;
    }
  };

  // Helper function for read operations using JSON-RPC
  const getAuthority = async (address: string) => {
    if (!contract || !smartAccount) throw new Error('Contract or Smart Account not initialized');
    
    try {
      // For read operations, we can make direct RPC calls
      const callData = contract.interface.encodeFunctionData("getAuthority", [address]);
      
      // eth_call through the direct RPC call
      const rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc"; // Avalanche Fuji
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: GOVERNMENT_REGISTRY_ADDRESS,
              data: callData,
            },
            'latest',
          ],
          id: 1,
        }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      
      // Decode the result
      return contract.interface.decodeFunctionResult("getAuthority", result.result);
    } catch (error) {
      console.error('Get authority call failed:', error);
      throw error;
    }
  };

  const isAuthorityActive = async (address: string) => {
    if (!contract || !smartAccount) throw new Error('Contract or Smart Account not initialized');
    
    try {
      const callData = contract.interface.encodeFunctionData("isAuthorityActive", [address]);
      
      const rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc"; // Avalanche Fuji
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: GOVERNMENT_REGISTRY_ADDRESS,
              data: callData,
            },
            'latest',
          ],
          id: 1,
        }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      
      return contract.interface.decodeFunctionResult("isAuthorityActive", result.result)[0];
    } catch (error) {
      console.error('Is authority active call failed:', error);
      throw error;
    }
  };
  
  // Helper function to check if a document is verified
  const isDocumentVerified = async (proofHash: string) => {
    if (!contract || !smartAccount) throw new Error('Contract or Smart Account not initialized');
    
    try {
      const callData = contract.interface.encodeFunctionData("isDocumentVerified", [proofHash]);
      
      const rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc"; // Avalanche Fuji
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: GOVERNMENT_REGISTRY_ADDRESS,
              data: callData,
            },
            'latest',
          ],
          id: 1,
        }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      
      return contract.interface.decodeFunctionResult("isDocumentVerified", result.result)[0];
    } catch (error) {
      console.error('Is document verified call failed:', error);
      throw error;
    }
  };

  // Helper function to get document verification details
  const getDocumentVerification = async (proofHash: string) => {
    if (!contract || !smartAccount) throw new Error('Contract or Smart Account not initialized');
    
    try {
      const callData = contract.interface.encodeFunctionData("getDocumentVerification", [proofHash]);
      
      const rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc"; // Avalanche Fuji
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: GOVERNMENT_REGISTRY_ADDRESS,
              data: callData,
            },
            'latest',
          ],
          id: 1,
        }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      
      return contract.interface.decodeFunctionResult("getDocumentVerification", result.result);
    } catch (error) {
      console.error('Get document verification call failed:', error);
      throw error;
    }
  };

  return {
    contract,
    smartAccount,
    // Authorities management functions
    addAuthority,
    updateAuthority,
    deactivateAuthority,
    getAuthority,
    isAuthorityActive,
    // Documents verification functions
    verifyDocument,
    revokeVerification,
    isDocumentVerified,
    getDocumentVerification
  };
}