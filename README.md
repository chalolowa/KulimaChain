# KulimaChain

KulimaChain is a decentralized insurance fund and fractional farmland ownership platform for Africa and **is built utilizing Chainlink’s backend infrastructure and a Next.js frontend**. Here’s a breakdown of how this dapp addresses key challenges and enables implementation:

---

### **Technical Architecture Overview**
#### **Backend (Chainlink)**  
Chainlink’s decentralized oracle network and modular services provide critical infrastructure for reliability and real-world data integration:  
1. **Parametric Insurance Triggers**  
   - Use **Chainlink Oracles** to fetch weather data (e.g., rainfall, temperature) from APIs openWeather and Tomorrow.io. This enables automated payouts for crop insurance ( drought triggers).  

2. **Land Registry Verification**  ]
   - Easy government onboarding to validate land ownership records for African registries, enabling trustless fractionalization of farmland.  

3. **Stablecoin Integration**  
   - Use **Chainlink CCIP** (Cross-Chain Interoperability Protocol) to facilitate cross-border payments and connect AKS stablecoin to DeFi protocols.  

4. **Fraud Prevention**  
   - Leverage **Chainlink VRF** (Verifiable Random Function) for transparent claim verification and fraud detection in insurance pools.  

---

#### **Frontend (Next.js)**  
Next.js provides a scalable, user-friendly interface optimized for low-bandwidth environments:  
1. **Mobile-First Design**  
   - Built lightweight Progressive Web Apps (PWAs) with Next.js to ensure accessibility on low-end smartphones, even with intermittent internet.  

2. **Wallet Integration**  
   - Used **Biconomy** or **Web3Auth** libraries to connect MetaMask, create smart wallet and enable Google-signin authentication for premium payments and token purchases.  

3. **Localization**  
   - Implement multilingual support (e.g., Swahili, Yoruba) and region-specific UI/UX patterns ( SMS-based 2FA for farmers without smartphones).    

---

### **Challenges to Address**  
| **Challenge**                 | **Solution with Chainlink + Next.js**                                                                 |  
|--------------------------------|-------------------------------------------------------------------------------------------------------|  
| **Unreliable Internet**        | Offline-first Next.js caching + Chainlink’s decentralized oracle redundancy for data availability.     |    
| **Regulatory Compliance**      | T-REX implementation for KYC/AML.|  
| **High Gas Fees**              | Deploy on Chainlink-supported L2s (Avalanche Fuji) for sub-$0.01 transactions.                   |  

---

### **Example Use Case: Drought Insurance in Kenya**  
1. **Backend**:  
   - Chainlink oracles pull rainfall data from Kenyan Meteorological Department APIs.  
   - Smart contract automatically pays out stablecoins to farmers’ wallets if rainfall < 50mm/month.  

2. **Frontend**:  
   - Next.js app displays real-time weather data and payout status.  
   - Farmers claim via USSD codes (*544#) if they lack smartphones.  

---

### **Tech Stack Applied**  
- **Blockchain**: Ethereum Avalanche for scalability.  
- **Oracles**: Chainlink Data Feeds + Functions for off-chain computation.  
- **Frontend**: Next.js + Tailwind CSS + The Graph (for querying on-chain data).  
- **Mobile Integration**: Partnered with Africa’s Talking for SMS/USSD gateways.  
