import Link from "next/link";
import { ConnectWalletButton } from "./ConnectButton";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-2 px-4 md:px-8 bg-slate-900 text-white rounded-full">
      <div className="font-black text-lg md:text-xl text-white">
        Sample header
      </div>
      <div className="flex items-center gap-4">
        <ConnectWalletButton />
      </div>
    </header>
  );
}