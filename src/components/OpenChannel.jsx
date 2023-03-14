import React, { useState } from "react";
import "./components.css";

function OpenChannel() {
  // Initialize state variables with useState hook
  const [showForm, setShowForm] = useState(false);
  const [pubkey, setPubkey] = useState("");
  const [localAmount, setLocalAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // Convert hex string to base64 string
  function hexToBase64(hexstring) {
    return window.btoa(
      hexstring
        .match(/\w{2}/g)
        .map(function (a) {
          return String.fromCharCode(parseInt(a, 16));
        })
        .join("")
    );
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert pubkey to base64 format
    const formattedPubkey = hexToBase64(pubkey);

    try {
      // Send request to open a channel using webln API
      const channelRequest = await window.webln.request("openchannel", {
        node_pubkey: formattedPubkey,
        local_funding_amount: localAmount,
      });

      // Log the response and set success message
      console.log("channelRequest", channelRequest);
      setSuccessMessage("Channel opened successfully");
    } catch (error) {
      // Set error message if there was an error
      setSuccessMessage("Error: " + error.message);
    }
  };

  return (
    <div>
      {/* Button to toggle the form */}
      <button onClick={() => setShowForm(!showForm)}>Open Channel</button>

      {/* Form to input channel details */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <label>Node Pubkey:</label>
            <input
              type="text"
              value={pubkey}
              onChange={(e) => setPubkey(e.target.value)}
            />
          <label>Funding Amount:</label>
            <input
              type="text"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
            />
          <button type="submit">Submit</button>
        </form>
      )}

      {/* Display success or error message */}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
    </div>
  );
}

export default OpenChannel;
