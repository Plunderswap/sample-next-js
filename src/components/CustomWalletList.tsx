import { useEffect, useState } from 'react';
import { useConnectors, useConnect } from 'wagmi';

interface WalletInfo {
  id: string;
  name: string;
  type: string;
  icon?: string;
  connector?: any;
  provider?: any;
}

interface CustomWalletListProps {
  onClose: () => void;
  openRainbowKitModal: () => void;
}

export default function CustomWalletList({ onClose, openRainbowKitModal }: CustomWalletListProps) {
  const { connect } = useConnect();
  const connectors = useConnectors();
  const [eip6963Wallets, setEip6963Wallets] = useState<WalletInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    // Listen for EIP-6963 announcements
    const handleAnnouncement = (event: any) => {
      if (event.detail && event.detail.info) {
        setEip6963Wallets(prev => {
          // Check if this wallet is already in our list by UUID
          const exists = prev.some(w => w.id === event.detail.info.uuid);
          if (exists) return prev;

          // Check if a wallet with the same name already exists
          const nameExists = prev.some(w => 
            w.name.toLowerCase() === event.detail.info.name.toLowerCase()
          );
          if (nameExists) return prev;

          // Add the new wallet
          return [...prev, {
            id: event.detail.info.uuid,
            name: event.detail.info.name,
            type: 'EIP-6963',
            icon: event.detail.info.icon,
            provider: event.detail.provider
          }];
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('eip6963:announceProvider', handleAnnouncement);

      // Dispatch request event to get wallet announcements
      window.dispatchEvent(new Event('eip6963:requestProvider'));

      return () => {
        window.removeEventListener('eip6963:announceProvider', handleAnnouncement);
      };
    }
  }, [refreshCount]);

  const handleConnectWallet = async (wallet: WalletInfo) => {
    setIsLoading(true);
    setError(null);

    try {
      if (wallet.type === 'EIP-6963' && wallet.provider) {
        // For EIP-6963 wallets, we need to request accounts directly
        const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });

        // Check if we got accounts back
        if (accounts && accounts.length > 0) {
          // Detect mobile devices (iOS, Android) and in-app browsers
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
          const isAndroid = /Android/.test(navigator.userAgent);
          const isInAppBrowser = /(CriOS|FxiOS|EdgiOS|Instagram|Facebook|Twitter|LinkedIn|FBAV|FBAN|Line|NAVER|KAKAOTALK|Snapchat|Pinterest|WhatsApp|GSA|UCBrowser|DuckDuckGo|SamsungBrowser|Silk)/.test(navigator.userAgent) || 
            (/Android/.test(navigator.userAgent) && /wv/.test(navigator.userAgent));
          const isMobile = isIOS || isAndroid;
          
          // Apply special handling for all mobile devices and in-app browsers
          if (isMobile || isInAppBrowser) {
            try {
              // Try to find a matching connector for this wallet
              const matchingConnector = connectors.find(c => 
                c.type === 'injected' || 
                c.name.toLowerCase().includes(wallet.name.toLowerCase())
              );

              if (matchingConnector) {
                await connect({ connector: matchingConnector });
              } else {
                // If no matching connector, try the injected connector
                const injectedConnector = connectors.find(c => c.id === 'injected');
                if (injectedConnector) {
                  await connect({ connector: injectedConnector });
                }
              }
            } catch (innerError) {
              // Continue anyway since we already have the accounts
            }
          }

          onClose();
        } else {
          throw new Error('No accounts returned from wallet');
        }
      } else if (wallet.connector) {
        // For regular connectors, use wagmi's connect function
        await connect({ connector: wallet.connector });
        onClose();
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(`Failed to connect: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh wallet list
  const refreshWalletList = () => {
    if (typeof window !== 'undefined') {
      // Clear existing wallets to prevent duplicates
      setEip6963Wallets([]);

      // Increment refresh count to trigger useEffect
      setRefreshCount(prev => prev + 1);

      // Dispatch request event to get wallet announcements
      window.dispatchEvent(new Event('eip6963:requestProvider'));
    }
  };

  // Only show EIP-6963 wallets in this custom list
  const eip6963WalletsList = eip6963Wallets.map(wallet => {
    // Convert SVG data URL to a usable format if needed
    const iconUrl = wallet.icon || '';

    return (
      <button
        key={wallet.id}
        onClick={() => handleConnectWallet(wallet)}
        disabled={isLoading}
        className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-3">
          {iconUrl && (
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-1">
              <img 
                src={iconUrl} 
                alt={`${wallet.name} icon`}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <span className="font-medium text-white">{wallet.name}</span>
        </div>
      </button>
    );
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-900 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {eip6963WalletsList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-3">
              {eip6963WalletsList}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">No EIP-6963 wallets detected</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center mt-4">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            <p className="text-white mt-2">Connecting...</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              onClose();
              openRainbowKitModal();
            }}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Show more wallets
          </button>
        </div>
      </div>
    </div>
  );
} 