"use client";

import { useContext, useState, useEffect, ReactNode, createContext, useCallback } from "react";
import { CHAIN_NAMESPACES, Web3Auth, WEB3AUTH_NETWORK } from "@web3auth/modal";
import { BiconomyPaymaster, BiconomySmartAccountV2, BiconomySmartAccountV2Config, Bundler, DEFAULT_ENTRYPOINT_ADDRESS, IBundler, IPaymaster } from "@biconomy/account";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { getResolver } from "key-did-resolver"
import { Wallet } from "ethers";
import { DID } from "dids";
import { fromString } from "uint8arrays/from-string";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any;
  userType: 'farmer' | 'investor' | null;
  loading: boolean;
  error: string | null;
  login: (type: 'farmer' | 'investor') => Promise<void>;
  logout: () => void;
  ceramicClient: CeramicClient | null;
  smartAccount: BiconomySmartAccountV2 | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<"farmer" | "investor" | null>(null);
  const [ceramicClient, setCeramicClient] = useState<CeramicClient | null>(null);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0xa869", // Avalanche Fuji
          rpcTarget: "https://api.avax-test.network/ext/bc/C/rpc",
          displayName: "Avalanche Fuji",
          blockExplorer: "https://testnet.snowtrace.io",
          ticker: "AVAX",
          tickerName: "Avalanche",
        };

        const web3AuthInstance = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
          //chainConfig: chainConfig,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          uiConfig: {
            appName: "KulimaChain",
            theme: "light" as any,
            loginMethodsOrder: ["google"],
            defaultLanguage: "en",
            modalZIndex: "2147483647",
          },
        });

        await web3AuthInstance.init();
        setWeb3auth(web3AuthInstance);
      } catch (err) {
        console.error("Web3Auth init error:", err);
        setError("Web3Auth initialization failed.");
      }
    };

    initWeb3Auth();

    return () => {
      web3auth?.logout();
    };
  }, []);

  const createDID = async (privateKey: string): Promise<DID> => {
    let hex = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
    // Pad with leading zeros if needed
    if (hex.length < 64) {
      hex = hex.padStart(64, "0");
    }
    const seed = fromString(hex, "base16").slice(0, 32);
    const provider = new Ed25519Provider(seed);
    const did = new DID({ provider, resolver: getResolver() });
    await did.authenticate();
    return did;
  };

  const authenticateCeramic = async (did: DID) => {
    const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com");
    ceramic.did = did;
    await ceramic.did.authenticate();
    return ceramic;
  };

  const setupBiconomy = async (
    privateKey: string
  ): Promise<BiconomySmartAccountV2> => {
    const wallet = new Wallet(privateKey);

    const bundler: IBundler = new Bundler({
      bundlerUrl: `https://bundler.biconomy.io/api/v2/43113/${process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_API_KEY}`,
      chainId: 43113,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    });

    const paymaster: IPaymaster = new BiconomyPaymaster({
      paymasterUrl: `https://paymaster.biconomy.io/api/v1/43113/${process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY}`,
    });

    const config: BiconomySmartAccountV2Config = {
      signer: wallet,
      chainId: 43113,
      bundler,
      paymaster,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    };

    const smartAccount = await BiconomySmartAccountV2.create(config);
    return smartAccount;
  };

  const login = useCallback(async (type: "farmer" | "investor") => {
    if (!web3auth) {
      setError("Web3Auth not ready");
      return;
    }

    setLoading(true);
    setError(null);
    setUserType(type);

    try {
      const provider = await web3auth.connect();
      if (!provider) {
        setError("Failed to connect to provider.");
        setLoading(false);
        return;
      }

      const privateKey = await provider.request({ method: "private_key" });

      const did = await createDID(privateKey as string);
      const ceramic = await authenticateCeramic(did);
      setCeramicClient(ceramic);

      const smartAccount = await setupBiconomy(privateKey as string);
      setSmartAccount(smartAccount);

      const userInfo = await web3auth.getUserInfo();
      const accountAddress = await smartAccount.getAccountAddress();
      setUser({
        ...userInfo,
        did: did.id,
        address: accountAddress,
      });

      localStorage.setItem("userType", type);
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Login failed. Try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [web3auth]);

  const logout = useCallback(async () => {
    if (web3auth) await web3auth.logout();
    setUser(null);
    setUserType(null);
    setCeramicClient(null);
    setSmartAccount(null);
    localStorage.removeItem("userType");
  }, [web3auth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        error,
        login,
        logout,
        ceramicClient,
        smartAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
