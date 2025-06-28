"use client";

import { motion } from 'framer-motion';
import { BarChart, LandPlot, Loader, User, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserTypeModal({open, onOpenChange}: UserTypeModalProps) {
  const { user, userType, loading, login } = useAuth();

  const handleSelect = (type: 'farmer' | 'investor') => {
    login(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-xl font-bold">
            Join KulimaChain
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 px-4">
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
              onClick={() => handleSelect('farmer')}
              className={`
                border rounded-xl p-5 text-left transition-all
                ${userType === 'farmer' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start">
                <LandPlot className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-bold text-lg mb-1">I'm a Farmer</h4>
                  <p className="text-gray-600 text-sm">
                    Tokenize your land, sell shares, and purchase crop insurance
                  </p>
                  {userType === 'farmer' && loading && (
                    <div className="mt-2 flex items-center text-green-600">
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={() => handleSelect('investor')}
              className={`
                border rounded-xl p-5 text-left transition-all
                ${userType === 'investor' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start">
                <BarChart className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-bold text-lg mb-1">I'm an Investor</h4>
                  <p className="text-gray-600 text-sm">
                    Invest in farmland shares and grow your portfolio
                  </p>
                  {userType === 'investor' && loading && (
                    <div className="mt-2 flex items-center text-blue-600">
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          </div>
          
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