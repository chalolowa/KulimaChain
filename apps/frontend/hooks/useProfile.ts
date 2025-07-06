import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export const useProfile = () => {
  const { selfId } = useAuth();
  const [basicProfile, setBasicProfile] = useState(null);
  const [kulimaChainProfile, setKulimaChainProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profiles from Ceramic
  useEffect(() => {
    const loadProfiles = async () => {
      if (!selfId) return;
      
      try {
        setLoading(true);
        const basic = await selfId.get('basicProfile');
        const kulima = await selfId.get('kulimaChainProfile');
        
        setBasicProfile(basic || {});
        setKulimaChainProfile(kulima || {});
      } catch (err) {
        setError('Failed to load profile');
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [selfId]);

  // Update basic profile
  const updateBasicProfile = async (updates: any) => {
    if (!selfId) return;
    
    try {
      setLoading(true);
      const newProfile = { ...(basicProfile || {}), ...updates };
      await selfId.set('basicProfile', newProfile);
      setBasicProfile(newProfile);
      return true;
    } catch (err) {
      setError('Failed to update profile');
      console.error('Profile update error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update kulima profile
  const updateKulimaProfile = async (updates: any) => {
    if (!selfId) return;
    
    try {
      setLoading(true);
      const newProfile = { ...(kulimaChainProfile || {}), ...updates };
      await selfId.set('kulimaChainProfile', newProfile);
      setKulimaChainProfile(newProfile);
      return true;
    } catch (err) {
      setError('Failed to update profile');
      console.error('Profile update error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    basicProfile,
    kulimaChainProfile,
    loading,
    error,
    updateBasicProfile,
    updateKulimaProfile
  };
};