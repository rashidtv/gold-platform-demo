import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// ⚠️ REPLACE THIS WITH YOUR ACTUAL CONTRACT ADDRESS FROM STEP 2 ⚠️
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Complete ABI for GoldPlatform
const contractABI = [
  {
    "inputs": [],
    "name": "getTotalGoldBars",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
    "name": "getGoldBarDetails",
    "outputs": [
      {"internalType": "uint256", "name": "weight", "type": "uint256"},
      {"internalType": "uint256", "name": "purity", "type": "uint256"},
      {"internalType": "string", "name": "mineOrigin", "type": "string"},
      {"internalType": "string", "name": "refinery", "type": "string"},
      {"internalType": "uint256", "name": "mintDate", "type": "uint256"},
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "string", "name": "vaultLocation", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
];

// BigInt conversion utility
const convertBigInt = (value) => {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return value;
};

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [goldBars, setGoldBars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        setError('');
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const goldContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        
        setContract(goldContract);
        await loadGoldBars(goldContract);
        
        console.log("✅ Wallet connected and contract loaded");
      } catch (error) {
        console.error("❌ Wallet connection failed:", error);
        setError('Connection failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please install MetaMask!');
    }
  };

  const loadGoldBars = async (contractInstance) => {
    try {
      console.log("Loading gold bars...");
      const totalBars = await contractInstance.getTotalGoldBars();
      console.log("Total bars:", totalBars.toString());
      
      const bars = [];
      for (let i = 0; i < totalBars; i++) {
        const details = await contractInstance.getGoldBarDetails(i);
        bars.push({
          tokenId: i,
          weight: convertBigInt(details[0]),
          purity: convertBigInt(details[1]),
          mineOrigin: details[2],
          refinery: details[3],
          mintDate: convertBigInt(details[4]),
          owner: details[5],
          vaultLocation: details[6]
        });
      }
      
      setGoldBars(bars);
      console.log("Gold bars loaded:", bars);
    } catch (error) {
      console.error("Error loading gold bars:", error);
      setError('Failed to load gold bars: ' + error.message);
    }
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '2px solid #d4af37', background: '#f8f9fa' }}>
        <h1 style={{ margin: 0, color: '#d4af37' }}>🏆 Gold Digitalization Platform</h1>
        {error && <div style={{ color: 'red', margin: '10px 0' }}>Error: {error}</div>}
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
            <p>Contract: <strong>{CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</strong></p>
          </div>
        )}
      </header>

      <main style={{ padding: '20px' }}>
        <h2>Gold Certificates</h2>
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {goldBars.map((bar, index) => (
            <div key={index} style={{ 
              border: '2px solid #d4af37', 
              padding: '20px', 
              borderRadius: '10px', 
              background: '#fffdf0'
            }}>
              <h3 style={{ color: '#d4af37', marginTop: 0 }}>Gold Bar #{bar.tokenId}</h3>
              <p><strong>Weight:</strong> {(bar.weight / 1000).toFixed(3)} kg</p>
              <p><strong>Purity:</strong> {(bar.purity / 100).toFixed(2)}%</p>
              <p><strong>Origin:</strong> {bar.mineOrigin}</p>
              <p><strong>Refinery:</strong> {bar.refinery}</p>
              <p><strong>Vault:</strong> {bar.vaultLocation}</p>
            </div>
          ))}
        </div>
        
        {goldBars.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No gold bars loaded. Check contract deployment.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;