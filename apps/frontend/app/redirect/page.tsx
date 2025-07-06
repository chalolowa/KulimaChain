"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardRedirect() {
  const { selfId, userType, loading, connectionStatus } = useAuth();
  const router = useRouter();
  const [profileInitialized, setProfileInitialized] = useState(false);

  // Initialize user profile in Ceramic
  useEffect(() => {
    const initializeProfile = async () => {
      if (selfId && !profileInitialized) {
        try {
          // Check if profile exists
          const existingProfile = await selfId.get('basicProfile');
          
          if (!existingProfile || !existingProfile.role) {
            // Create new profile with user type
            await selfId.set('basicProfile', {
              name: 'New User',
              description: '',
              role: userType,
            });
            
            // Create custom kulimaProfile
            await selfId.set('kulimaChainProfile', {
              userType,
              ...(userType === 'farmer' ? { farmSize: 0 } : { investmentPreference: '' })
            });
          }
          
          setProfileInitialized(true);
        } catch (error) {
          console.error('Profile initialization error:', error);
        }
      }
    };

    initializeProfile();
  }, [selfId, userType, profileInitialized]);

  // Handle redirection
  useEffect(() => {
    if (!loading && profileInitialized && userType) {
      if (userType === 'farmer') {
        router.replace('/farmer/dashboard');
      } else if (userType === 'investor') {
        router.replace('/investor/dashboard');
      }
    } else if (!loading && !userType) {
      router.replace('/');
    }
  }, [userType, loading, router, profileInitialized]);

  // Connection status messages
  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return "Connecting to Ceramic network...";
      case 'connected':
        return profileInitialized 
          ? "Redirecting to your dashboard..." 
          : "Setting up your profile...";
      case 'failed':
        return "Connection failed. Retrying...";
      default:
        return "Preparing your smart wallet...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      <p className="text-lg text-gray-700">
        {getStatusMessage()}
      </p>
      <div className="mt-4 text-sm text-gray-500 max-w-md text-center">
        {connectionStatus === 'connecting' && (
          <p>Establishing secure connection to decentralized identity network...</p>
        )}
        {profileInitialized && (
          <p>Your profile is ready! Taking you to your dashboard.</p>
        )}
      </div>
    </div>
  );
}