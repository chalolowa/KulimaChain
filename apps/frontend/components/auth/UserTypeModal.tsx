"use client";

import { motion } from 'framer-motion';
import { BarChart, LandPlot, Loader, User, Wallet, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserTypeModal({open, onOpenChange}: UserTypeModalProps) {
  const { userType, loading, socialLogin, walletConnectLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<'selectRole' | 'selectMethod'>('selectRole'); // 'selectRole' or 'selectMethod'
  
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setLoginStep('selectMethod');
  };

  const handleLoginMethod = (method: string) => {
    if (method === 'social') {
      socialLogin(selectedRole);
    } else {
      walletConnectLogin(selectedRole);
    }
  };

  const handleBack = () => {
    if (loginStep === 'selectMethod') {
      setLoginStep('selectRole');
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
        <DialogHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-4"
            onClick={handleBack}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-center text-xl font-bold pt-2">
            {loginStep === 'selectRole' ? 'Join KulimaChain' : 'Connect Wallet'}
          </DialogTitle>
          {loginStep === 'selectMethod' && (
            <DialogDescription className="text-center">
              Continue as {selectedRole === 'farmer' ? 'Farmer' : 'Investor'}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4 px-4">
          {loginStep === 'selectRole' ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Select Your Role</h3>
                <p className="text-gray-600">
                  Choose how you want to use KulimaChain
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={() => handleRoleSelect('farmer')}
                  className="border rounded-xl p-5 text-left transition-all border-gray-200 hover:border-green-300"
                >
                  <div className="flex items-start">
                    <LandPlot className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">I'm a Farmer</h4>
                      <p className="text-gray-600 text-sm">
                        Tokenize your land, sell shares, and purchase crop insurance
                      </p>
                    </div>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={() => handleRoleSelect('investor')}
                  className="border rounded-xl p-5 text-left transition-all border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-start">
                    <BarChart className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">I'm an Investor</h4>
                      <p className="text-gray-600 text-sm">
                        Invest in farmland shares and grow your portfolio
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600">
                  Choose your preferred login method
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={() => handleLoginMethod('social')}
                  className="border rounded-xl p-5 text-left transition-all border-gray-200 hover:border-green-300"
                >
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-lg p-2 mr-4">
                      <div className="flex">
                        <div className="w-6 h-6 rounded-full bg-red-500 -ml-1"></div>
                        <div className="w-6 h-6 rounded-full bg-green-500 -ml-1"></div>
                        <div className="w-6 h-6 rounded-full bg-blue-500 -ml-1"></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Social Login</h4>
                      <p className="text-gray-600 text-sm">
                        Google, Twitter, etc. (No private keys)
                      </p>
                    </div>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={() => handleLoginMethod('walletconnect')}
                  className="border rounded-xl p-5 text-left transition-all border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center">
                    <div className="bg-[#3b99fc] rounded-lg p-2 mr-4">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">WalletConnect</h4>
                      <p className="text-gray-600 text-sm">
                        Connect existing wallet (Advanced users)
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
              
              {loading && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    <span>
                      {userType === 'farmer' 
                        ? "Setting up farmer account..." 
                        : "Setting up investor account..."}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}