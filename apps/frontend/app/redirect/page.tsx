"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { userType, loading } = useAuth();  
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (userType === 'farmer') {
        router.replace('/farmer/dashboard');
      } else if (userType === 'investor') {
        router.replace('/investor/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [userType, loading, router]);

  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}