"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart, Handshake, LandPlot, Leaf, Mail, Phone, ShieldCheck, User } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const sections = [
  {
    icon: <LandPlot className="w-8 h-8 text-green-600" />,
    title: "Land Tokenization",
    description: "Farmers tokenize land using government-verified documents. Each token represents fractional ownership of real farmland with transparent records on the Avalanche blockchain.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
    title: "Crop Insurance",
    description: "Farmers purchase parametric insurance against droughts and floods. Using Chainlink Functions and AI weather models, our platform automatically triggers payouts based on rainfall data.",
  },
  {
    icon: <Handshake className="w-8 h-8 text-amber-600" />,
    title: "Investor Marketplace",
    description: "Investors buy verified farmland tokens, monitor ownership, and receive rewards. Token data includes location, title deed CID, and share size with transparent valuation metrics.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"
        >
          How KulimaChain Works
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-600"
        >
          Connecting farmers, AI weather models, and global investors through blockchain technology
        </motion.p>
      </motion.div>

      {/* Process Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-10 max-w-5xl mx-auto mb-20"
      >
        {sections.map((section, idx) => (
          <motion.div key={idx} variants={item}>
            <Card className="bg-white border-0 shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-xl">
              <CardHeader className="flex flex-row items-start space-y-0">
                <div className="bg-emerald-50 p-3 rounded-lg">
                  {section.icon}
                </div>
                <div className="ml-4">
                  <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{section.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tokenization Process */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl font-bold mb-4">Farmland Tokenization Journey</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
          Revolutionizing agricultural investment through blockchain technology
        </p>
      </motion.div>

      {/* Process Steps */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
      >
        <motion.div variants={item}>
          <Card className="h-full border-0 shadow-lg rounded-xl hover:shadow-xl transition-all">
            <CardHeader>
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-emerald-800">1</span>
              </div>
              <CardTitle className="text-xl">Land Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Farmer uploads land documents (title deed, survey maps) for verification. 
                Request is forwarded to government authorities for approval through our 
                decentralized verification system.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full border-0 shadow-lg rounded-xl hover:shadow-xl transition-all">
            <CardHeader>
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-emerald-800">2</span>
              </div>
              <CardTitle className="text-xl">Token Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Approved farms are tokenized with details (name, symbol, geolocation) 
                on the Avalanche blockchain. Farmer receives tokens representing ownership 
                shares of their land.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full border-0 shadow-lg rounded-xl hover:shadow-xl transition-all">
            <CardHeader>
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-emerald-800">3</span>
              </div>
              <CardTitle className="text-xl">Trading & Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Farmer offers percentage for sale. Investors bid, pay in AKS (Avalanche Kenya Shilling). AKS tokens are backed by Kenya Shillings (KES) at a 1:1 ratio protecting against volatility.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Benefits Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Platform Benefits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-0 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-green-700 mr-2" />
                  <CardTitle className="text-green-800">For Farmers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-start">
                    <Leaf className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Access investment capital by selling land shares while maintaining ownership</span>
                  </li>
                  <li className="flex items-start">
                    <ShieldCheck className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Automated weather insurance protects against droughts and floods</span>
                  </li>
                  <li className="flex items-start">
                    <BarChart className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Transparent pricing through competitive bidding marketplace</span>
                  </li>
                  <li className="flex items-start">
                    <Handshake className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Easy AKS (Avalanche Kenya Shilling) withdrawals to mobile money</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full border-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <BarChart className="w-6 h-6 text-blue-700 mr-2" />
                  <CardTitle className="text-blue-800">For Investors</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-blue-700">
                  <li className="flex items-start">
                    <LandPlot className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Fractional ownership of farmland assets with transparent records</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0">⦿</div>
                    <span>Diversify portfolio with stable agricultural investments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0">⦿</div>
                    <span>Potential for land appreciation and agricultural dividends</span>
                  </li>
                  <li className="flex items-start">
                    <Handshake className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Secondary market for trading land tokens with liquidity</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 shadow-lg mb-12"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Contact KulimaChain</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <Mail className="w-6 h-6 text-emerald-700" />
              </div>
              Company Information
            </h3>
            
            <address className="text-gray-700 not-italic space-y-4">
              <div className="flex items-start">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <User className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="font-medium">KulimaChain</p>
                  <p>Nairobi, Kenya</p>
                  <p>P.O. Box 00100</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <Mail className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p>locha.softwaredev@gmail.com</p>
                </div>
              </div>
            </address>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <Phone className="w-6 h-6 text-emerald-700" />
              </div>
              Get In Touch
            </h3>
            
            <p className="text-gray-700 mb-8">
              Our team is ready to assist you with any inquiries about farmland tokenization, 
              investments, or platform features.
            </p>
            
            <Link href="mailto:locha.softwaredev@gmail.com">
              <Button className="w-full py-6 text-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg transform transition hover:-translate-y-0.5">
                Send a Message
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Back to Home */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <Link href="/">
          <Button variant="outline" className="px-8 py-6 text-lg border-emerald-600 text-emerald-600 hover:bg-emerald-50">
            Back to Homepage
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}