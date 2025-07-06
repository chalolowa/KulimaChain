"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import background from "@/assets/farmland-bg.jpg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import UserTypeModal from "@/components/auth/UserTypeModal";
import { useRouter } from "next/navigation";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { userType } = useAuth();
  const router = useRouter();

  // Redirect if logged in and userType is set
  useEffect(() => {
    if (userType) {
      router.replace("/redirect");
    }
  }, [userType, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image with Parallax Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Image 
          src={background}
          alt="Green maize field"
          fill
          priority
          className="object-cover"
          placeholder="blur"
          quality={100}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/70 to-emerald-900/80"></div>
      </div>
      
      {/* Content with Animation */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Transforming <span className="text-green-300">Farmland Ownership</span> with Blockchain
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Tokenize your farmland, trade land shares, and secure your future with our decentralized platform
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >

          <Button className="px-8 py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transform transition hover:-translate-y-1"
          onClick={() => setAuthModalOpen(true)}
          >
            Get Started
          </Button>

          <Link href="/about">
            <Button variant="outline" className="px-8 py-6 text-lg bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:text-white transition-all">
              How It Works
            </Button>
          </Link>
        </motion.div>
      </div>
      
      {/* Scrolling Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce w-8 h-14 rounded-full border-2 border-white/50 flex justify-center">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-white mt-2"
          ></motion.div>
        </div>
      </motion.div>

      {/* User Type Modal */}
      <UserTypeModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      
    </div>
  );
}