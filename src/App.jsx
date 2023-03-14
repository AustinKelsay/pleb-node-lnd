import React, { useState, useEffect } from "react";
import Channels from "./components/Channels";
import AddPeer from "./components/AddPeer";
import OpenChannel from "./components/OpenChannel";
import "./App.css";

function App() {
  // State hooks
  const [connectedNode, setConnectedNode] = useState({});
  const [channels, setChannels] = useState([]);
  const [onchainBalance, setOnchainBalance] = useState(0);
  const [lightningBalance, setLightningBalance] = useState(0);

  // Load channels and balances on component mount or when connectedNode changes
  const loadAll = async function () {
    await loadChannels();
    await loadBalances();
  };
  useEffect(() => {
    loadAll();
  }, [connectedNode]);

  // Connect to WebLN provider
  const connect = async () => {
    await window.webln.enable();
    const info = await window.webln.getInfo();
    console.log(info, "infooooo");
    setConnectedNode(info?.node);

    // Check if provider supports walletbalance method
    if (!info.methods || !info.methods.includes("walletbalance")) {
      alert(
        "Your connected WebLN provider is not supported. Please use Alby with a LND node"
      );
      document.location = "/";
      return false;
    }
    return true;
  };

  // Load channels for connectedNode
  const loadChannels = async function () {
    const nodeDetails = await window.webln.request("getnodeinfo", {
      pub_key: connectedNode.pubkey,
    });
    console.log("nodeDetails", nodeDetails);

    const result = await window.webln.request("listchannels");
    const channels = result.channels;
    console.log("channels", channels);

    // Sort channels by local balance
    setChannels(
      channels.sort((a, b) => {
        return b.local_balance - a.local_balance;
      })
    );
  };

  // Load balances for connectedNode
  const loadBalances = async function () {
    await window.webln.enable();

    const channelbalance = await window.webln.request("channelbalance");
    const walletbalance = await window.webln.request("walletbalance");

    const onchain = walletbalance.total_balance;
    const lightning = channelbalance.balance;

    setLightningBalance(lightning);
    setOnchainBalance(onchain);

    console.log({ onchainBalance });
  };

  // Render components
  return (
    <div className="App">
      <header className="App-header">
        <h1>pleb-node-lnd</h1>
        {connectedNode?.pubkey && <p>Connected to: {connectedNode.alias}</p>}
      </header>

      {/* Connect button */}
      {!connectedNode?.pubkey && (
        <button onClick={connect}>Connect to your node</button>
      )}

      {/* Connected */}
      {connectedNode?.pubkey && <h2>Connected to {connectedNode?.pubkey}</h2>}

      {/* Balances */}
      {connectedNode?.pubkey && (
        <div className="balances">
          <div className="balance">
            <h3>Onchain balance</h3>
            <p>{onchainBalance} sats</p>
          </div>
          <div className="balance">
            <h3>Lightning balance</h3>
            <p>{lightningBalance} sats</p>
          </div>
        </div>
      )}

      {/* Add peer */}
      {connectedNode?.pubkey && <AddPeer />}

      {/* Open channel */}
      {connectedNode?.pubkey && <OpenChannel />}

      {/* channels */}
      <Channels channels={channels} />
    </div>
  );
}

export default App;
