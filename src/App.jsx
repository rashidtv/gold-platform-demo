import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Your deployed contract address from the deployment output
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// GoldPlatform ABI - simplified version for basic functions
const contractABI = [
  "function goldBars(uint256) view returns (uint256, uint256, string, string, uint256, address, string)",
  "function getGoldBarDetails(uint256) view returns (uint256 weight, uint256 purity, string mineOrigin, string refinery, uint256 mintDate, address owner, string vaultLocation)",
  "function getSupplyChainHistory(uint256) view returns (string[])",
  "function getTotalGoldBars() view returns (uint256)",
  "function mintGoldCertificate(uint256, uint256, string, string, string) returns (uint256)",
  "function transferCertificate(uint256, address)",
  "function certificateOwners(uint256) view returns (address)",
  "event CertificateMinted(uint256, uint256, uint256, string)",
  "event CertificateTransferred(uint256, address, address)"
];

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [goldBars, setGoldBars] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
        
        // Connect to local Hardhat network
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const goldContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        
        setContract(goldContract);
        await loadGoldBars(goldContract);
        
        console.log("✅ Wallet connected and contract loaded");
      } catch (error) {
        console.error("❌ Wallet connection failed:", error);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const loadGoldBars = async (contractInstance) => {
    try {
      const totalBars = await contractInstance.getTotalGoldBars();
      const bars = [];
      
      for (let i = 0; i < totalBars; i++) {
        const details = await contractInstance.getGoldBarDetails(i);
        bars.push({
          tokenId: i,
          weight: details[0],
          purity: details[1],
          mineOrigin: details[2],
          refinery: details[3],
          mintDate: details[4],
          owner: details[5],
          vaultLocation: details[6]
        });
      }
      
      setGoldBars(bars);
    } catch (error) {
      console.error("Error loading gold bars:", error);
    }
  };

  const mintNewCertificate = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const tx = await contract.mintGoldCertificate(
        250, // 250g
        9990, // 99.90%
        "Pueblo Viejo, Dominican Republic",
        "Global Refinery, UK", 
        "London Vault C3"
      );
      await tx.wait();
      await loadGoldBars(contract);
      alert("✅ New gold certificate minted!");
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalGoldWeight = () => {
    return goldBars.reduce((sum, bar) => sum + Number(bar.weight), 0) / 1000;
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '2px solid #gold', background: '#f8f9fa' }}>
        <h1 style={{ margin: 0, color: '#d4af37' }}>🏆 Gold Digitalization Platform</h1>
        {!account ? (
          <button 
            onClick={connectWallet}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              background: '#d4af37',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div style={{ marginTop: '10px' }}>
            <p>Connected: <strong>{account.slice(0, 6)}...{account.slice(-4)}</strong></p>
            <p>Total Gold Bars: <strong>{goldBars.length}</strong></p>
          </div>
        )}
      </header>

      <nav style={{ padding: '15px', background: '#f5f5f5', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ padding: '10px 15px', border: '1px solid #d4af37', background: activeTab === 'dashboard' ? '#d4af37' : 'white', color: activeTab === 'dashboard' ? 'white' : '#d4af37' }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('certificates')}
          style={{ padding: '10px 15px', border: '1px solid #d4af37', background: activeTab === 'certificates' ? '#d4af37' : 'white', color: activeTab === 'certificates' ? 'white' : '#d4af37' }}
        >
          Gold Certificates
        </button>
        <button 
          onClick={() => setActiveTab('supplychain')}
          style={{ padding: '10px 15px', border: '1px solid #d4af37', background: activeTab === 'supplychain' ? '#d4af37' : 'white', color: activeTab === 'supplychain' ? 'white' : '#d4af37' }}
        >
          Supply Chain
        </button>
      </nav>

      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h2>Platform Overview</h2>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <div style={{ border: '2px solid #d4af37', padding: '20px', borderRadius: '10px', minWidth: '200px', background: 'white' }}>
                <h3>Total Gold Reserves</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>{getTotalGoldWeight().toFixed(3)} kg</p>
              </div>
              <div style={{ border: '2px solid #d4af37', padding: '20px', borderRadius: '10px', minWidth: '200px', background: 'white' }}>
                <h3>Active Certificates</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>{goldBars.length} bars</p>
              </div>
            </div>
            
            <div style={{ background: '#fffdf0', padding: '20px', borderRadius: '10px', border: '1px solid #d4af37' }}>
              <h3>Demo Actions</h3>
              <button 
                onClick={mintNewCertificate} 
                style={{ 
                  padding: '12px 24px', 
                  background: '#d4af37', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                disabled={loading || !account}
              >
                {loading ? 'Minting...' : 'Mint New Gold Certificate (Demo)'}
              </button>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                This will create a new 250g gold certificate from Dominican Republic
              </p>
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div>
            <h2>Digital Gold Certificates</h2>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
              {goldBars.map((bar, index) => (
                <div key={index} style={{ 
                  border: '2px solid #d4af37', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  background: '#fffdf0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ color: '#d4af37', marginTop: 0 }}>Gold Bar #{bar.tokenId}</h3>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <p><strong>Weight:</strong> {(bar.weight / 1000).toFixed(3)} kg</p>
                    <p><strong>Purity:</strong> {(bar.purity / 100).toFixed(2)}%</p>
                    <p><strong>Origin:</strong> {bar.mineOrigin}</p>
                    <p><strong>Refinery:</strong> {bar.refinery}</p>
                    <p><strong>Vault:</strong> {bar.vaultLocation}</p>
                    <p><strong>Owner:</strong> {bar.owner?.slice(0, 6)}...{bar.owner?.slice(-4)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'supplychain' && (
          <div>
            <h2>Supply Chain Tracking</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              {goldBars.map((bar, index) => (
                <div key={index} style={{ 
                  marginBottom: '20px', 
                  border: '1px solid #ddd', 
                  padding: '20px', 
                  borderRadius: '10px',
                  background: 'white'
                }}>
                  <h3 style={{ color: '#d4af37' }}>Bar #{bar.tokenId} - {bar.mineOrigin}</h3>
                  <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                    <h4>Journey History:</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li>✅ Minted: {bar.weight}g gold bar from {bar.mineOrigin}</li>
                      <li>✅ Refined: {bar.refinery} - {(bar.purity / 100).toFixed(2)}% purity</li>
                      <li>✅ Vaulted: {bar.vaultLocation} - Secure storage</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;