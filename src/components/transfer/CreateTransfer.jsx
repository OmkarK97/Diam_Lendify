import React, { useState } from "react";
import {
  Keypair,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
  Asset,
} from "diamante-base";
import { Horizon } from "diamante-sdk-js";
import { Buffer } from "buffer";

const server = new Horizon.Server("https://diamtestnet.diamcircle.io/");

// Make sure Buffer is available globally
window.Buffer = Buffer;

const CreateTransfer = ({ walletData }) => {
  const [senderSecret, setSenderSecret] = useState("");
  const [receiverPublicKey, setReceiverPublicKey] = useState("");
  const [transactionLink, setTransactionLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const senderPair = Keypair.fromSecret(senderSecret);
      const receiverPair = Keypair.fromPublicKey(receiverPublicKey);

      // Create account for receiver
      await createAccount(receiverPair);

      // Perform transfer
      const result = await transferDiam(senderPair, receiverPair);
      setTransactionLink(result._links.transaction.href);
    } catch (error) {
      setTransactionLink(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const transferDiam = async (senderPair, receiverPair) => {
    try {
      const senderAcc = await server.loadAccount(senderPair.publicKey());
      const transaction = new TransactionBuilder(senderAcc, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: receiverPair.publicKey(),
            asset: Asset.native(),
            amount: "10",
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(senderPair);

      return await server.submitTransaction(transaction);
    } catch (error) {
      throw new Error("Transaction failed: " + error.message);
    }
  };

  const createAccount = async (newPair) => {
    try {
      const response = await fetch(
        `https://friendbot.diamcircle.io?addr=${encodeURIComponent(
          newPair.publicKey()
        )}`
      );
      return await response.json();
    } catch (error) {
      throw new Error("Failed to create account: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center pt-[12rem] -mt-[5.25rem]">
      <div className="bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Diamante Transfer</h1>
        <div className="mb-4">
          <label className="block mb-2">Sender Secret Key:</label>
          <input
            type="text"
            value={senderSecret}
            onChange={(e) => setSenderSecret(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Receiver Public Key:</label>
          <input
            type="text"
            value={receiverPublicKey}
            onChange={(e) => setReceiverPublicKey(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleTransfer}
          disabled={loading}
          className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? "Transferring..." : "Transfer"}
        </button>
        {transactionLink && (
          <div className="mt-4 p-4 bg-gray-700 rounded">
            <h2 className="text-xl font-bold mb-2">Transaction Link</h2>
            <a
              href={transactionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              {transactionLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTransfer;
