"use client";

import { useContext, useState, ReactNode, createContext, SetStateAction } from "react";
import { BiconomyPaymaster, BiconomySmartAccountV2, Bundler, DEFAULT_ECDSA_OWNERSHIP_MODULE, DEFAULT_ENTRYPOINT_ADDRESS, ECDSAOwnershipValidationModule } from "@biconomy/account";
import { SelfID, EthereumAuthProvider } from "@self.id/web";
import WalletConnectProvider from "@walletconnect/web3-provider"
import { Provider } from "@self.id/react"
import { SafeEventEmitterProvider } from "@web3auth/base";

type AuthContextType = {
  smartAccount: any;
  selfId: SelfID | null;
  userType: any;
  loading: boolean;
  authMethod: any;
  socialLogin: (role: any) => Promise<void>;
  walletConnectLogin: (role: any) => Promise<void>;
  logout: () => void;
  connectionStatus: any;
};

const AuthContext = createContext<AuthContextType>({
  smartAccount: null,
  selfId: null,
  userType: null,
  loading: false,
  authMethod: null,
  socialLogin: async (_role: any) => { },
  walletConnectLogin: async (_role: any) => { },
  logout: () => { },
  connectionStatus: undefined
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
  const [selfId, setSelfId] = useState<SelfID | null>(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<null | "social" | "walletconnect">(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected")

  // Initialize Self.ID
  const initializeSelfID = async (provider: SafeEventEmitterProvider | WalletConnectProvider, address: string) => {
    try {
      setConnectionStatus('connecting');
      const authProvider = new EthereumAuthProvider(provider, address);
      // Authenticate with Ceramic using the static method
      const selfId = await SelfID.authenticate({
        ceramic: "https://ceramic-clay.3boxlabs.com",
        connectNetwork: 'testnet-clay',
        authProvider,
      });
      setSelfId(selfId);
      setConnectionStatus('connected');
      return selfId;
    } catch (error) {
      console.error('Self.ID initialization error:', error);
      setConnectionStatus('failed');
      throw error;
    }
  };


  // Initialize Biconomy Smart Account V2
  const initSmartAccount = async (provider: SafeEventEmitterProvider | WalletConnectProvider, role: SetStateAction<null>) => {
    setLoading(true);
    try {
      const chainId = 43113;
      
      // 1. Setup Bundler
      const bundler = new Bundler({
        bundlerUrl: `https://bundler.biconomy.io/api/v2/43113/${process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_API_KEY}`,
        chainId: chainId,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      });

      // 2. Setup Paymaster (for AKS gas payments)
      const paymaster = new BiconomyPaymaster({
        paymasterUrl: `https://paymaster.biconomy.io/api/v1/43113/${process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY}`
      });

      // 3. Create Smart Account
      const biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: chainId,
        bundler: bundler,
        paymaster: paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: await getEcdsaModule(Provider),
        activeValidationModule: await getEcdsaModule(Provider),
      });

      // 4. Get user address
      const address = await biconomySmartAccount.getAccountAddress();
      
      // 5. Initialize Self.ID
      const selfIdInstance = await initializeSelfID(provider, address);
      
      // 6. Update state
      setSmartAccount(biconomySmartAccount);
      setSelfId(selfIdInstance);
      setUserType(role);
      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper to get ECDSA module
  const getEcdsaModule = async (provider: any) => {
    const web3Provider = Provider(provider);
    const signer = web3Provider.getSigner();
    return ECDSAOwnershipValidationModule.create({
      signer: signer,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
    });
  };

  const socialLogin = async (role: any) => {
    setAuthMethod('social');

    if (typeof window === "undefined") return;

    const { default: SocialLogin } = await import("@biconomy/web3-auth");

    try {
      // Initialize SocialLogin
      const socialLogin = new SocialLogin();
      await socialLogin.init({
        chainId: "0xa869",
        network: "testnet"
      });
      
      socialLogin.showWallet();

      // Poll for provider to be available
      const pollProvider = async () => {
        return new Promise<void>((resolve, reject) => {
          const interval = setInterval(async () => {
            if (socialLogin.provider) {
              clearInterval(interval);
              await initSmartAccount(socialLogin.provider, role);
              resolve();
            }
          }, 500);
          // Optional: timeout after 2 minutes
          setTimeout(() => {
            clearInterval(interval);
            reject(new Error("Social login timed out"));
          }, 120000);
        });
      };

      await pollProvider();
    } catch (error) {
      console.error('Social login error:', error);
    }
  };

  const walletConnectLogin = async (role: any) => {
    setAuthMethod('walletconnect');
    try {
      const provider = new WalletConnectProvider({
        rpc: {
          43113: "https://api.avax-test.network/ext/bc/c/rpc",
        },
        infuraId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
        chainId: 43113
      });
      
      await provider.enable();
      await initSmartAccount(provider, role);
    } catch (error) {
      console.error('WalletConnect error:', error);
    }
  };

  const logout = () => {
    setSmartAccount(null);
    setSelfId(null);
    setUserType(null);
    setAuthMethod(null);
    setConnectionStatus('disconnected');
  };

  return (
    <AuthContext.Provider value={{
      smartAccount,
      selfId,
      userType,
      loading,
      authMethod,
      socialLogin,
      walletConnectLogin,
      logout,
      connectionStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
