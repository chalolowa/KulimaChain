"use client";

import { useWalletUI } from "@web3auth/modal/react";

export function WalletBadge({ label, color }: { label: string; color: string }) {
  const { showWalletUI, loading, error } = useWalletUI();

  return (
    <>
      <button
        className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center focus:outline-none`}
        title="Show Wallet"
        onClick={() => showWalletUI()}
        disabled={loading}
      >
        <span className={`font-medium text-${color}-800`}>{label}</span>
      </button>
      {error && <div className="text-xs text-red-500">{error.message}</div>}
    </>
  );
}