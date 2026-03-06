import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Shield, Activity, Share2, AlertTriangle, Eye, ShieldCheck, Database, Key, QrCode } from "lucide-react";
import { motion } from "framer-motion";

const contractAddress = "0xbF144B079d290eaE62Ae97274D39DFa71E012Eb9";
const abi = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_drugName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_mfgDate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_expDate",
                "type": "string"
            }
        ],
        "name": "createBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            }
        ],
        "name": "recallBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "_newOwner",
                "type": "address"
            }
        ],
        "name": "transferBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "batches",
        "outputs": [
            {
                "internalType": "string",
                "name": "batchId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "drugName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "manufactureDate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "expiryDate",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "recalled",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "regulator",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_batchId",
                "type": "string"
            }
        ],
        "name": "verifyBatch",
        "outputs": [
            {
                "internalType": "string",
                "name": "batchId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "drugName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "manufactureDate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "expiryDate",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "recalled",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

function Dashboard() {
    const [createTxHash, setCreateTxHash] = useState("");
    const [transferTxHash, setTransferTxHash] = useState("");
    const [recallTxHash, setRecallTxHash] = useState("");

    const [account, setAccount] = useState(null);
    const [role, setRole] = useState("Manufacturer");
    const [contract, setContract] = useState(null);

    const [batchId, setBatchId] = useState("");
    const [drugName, setDrugName] = useState("");
    const [mfgDate, setMfgDate] = useState("");
    const [expDate, setExpDate] = useState("");
    const [lastCreatedBatch, setLastCreatedBatch] = useState(null);

    const [transferId, setTransferId] = useState("");
    const [newOwner, setNewOwner] = useState("");

    const [verifyId, setVerifyId] = useState("");
    const [batchData, setBatchData] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    const [recallId, setRecallId] = useState("");
    const [loading, setLoading] = useState(false);

    // Glitch effect state
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        const glitchInterval = setInterval(() => {
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 200);
        }, Math.random() * 5000 + 3000); // Random glitch every 3-8s

        return () => clearInterval(glitchInterval);
    }, []);

    // QR Optical Scanner hook for the consumer tab
    useEffect(() => {
        if (showScanner) {
            // Give the DOM a tiny bit of time to render the #qr-reader div
            setTimeout(() => {
                const scanner = new Html5QrcodeScanner("qr-reader", {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    rememberLastUsedCamera: true,
                    aspectRatio: 1.0,
                }, false);

                scanner.render(
                    (decodedText) => {
                        try {
                            const parsed = JSON.parse(decodedText);
                            setVerifyId(parsed.BatchID || parsed.batchId || decodedText);
                        } catch (e) {
                            setVerifyId(decodedText);
                        }
                        scanner.clear();
                        setShowScanner(false);
                    },
                    (err) => {
                        // ignore frame-level scanning errors
                    }
                );

                // Cleanup on unmount or component hide
                return () => {
                    scanner.clear().catch(console.error);
                };
            }, 100);
        }
    }, [showScanner]);

    async function connectWallet() {
        if (!window.ethereum) {
            alert("WARNING: WEB3 PROVIDER NOT DETECTED. INSTALL METAMASK.");
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            setAccount(accounts[0]);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const medchainContract = new ethers.Contract(
                contractAddress,
                abi,
                signer
            );

            setContract(medchainContract);
        } catch (err) {
            console.error(err);
        }
    }

    async function createBatch() {
        if (!contract) {
            alert("WARNING: UNAUTHORIZED. CONNECT WALLET TO PROCEED.");
            return;
        }

        if (!batchId || !drugName || !mfgDate || !expDate) {
            alert("ERROR: INCOMPLETE DATA PAYLOAD.");
            return;
        }

        try {
            setLoading(true);
            setCreateTxHash(""); // clear old hash

            const tx = await contract.createBatch(
                batchId,
                drugName,
                mfgDate,
                expDate
            );
            setCreateTxHash(tx.hash);
            await tx.wait();

            alert("SUCCESS: BATCH APPENDED TO LEDGER.");

            // Store it so the QR code generates persistently below the form
            setLastCreatedBatch({
                batchId, drugName, mfgDate, expDate
            });

            // Clear the inputs
            setBatchId("");
            setDrugName("");
            setMfgDate("");
            setExpDate("");

        } catch (error) {
            console.error(error);
            alert("ERROR: BATCH CREATION FAILED. TX REVERTED.");
        } finally {
            setLoading(false);
        }
    }

    async function transferBatch() {
        if (!contract) {
            alert("WARNING: UNAUTHORIZED.");
            return;
        }

        if (!transferId || !newOwner) {
            alert("ERROR: INCOMPLETE DATA PAYLOAD.");
            return;
        }

        try {
            setLoading(true);
            setTransferTxHash(""); // clear old hash

            const tx = await contract.transferBatch(transferId, newOwner);
            setTransferTxHash(tx.hash);
            await tx.wait();

            alert("SUCCESS: CUSTODY TRANSFERRED.");

            setTransferId("");
            setNewOwner("");

        } catch (error) {
            console.error(error);
            alert("ERROR: TRANSFER FAILED. VERIFY OWNERSHIP PRIVILEGES.");
        } finally {
            setLoading(false);
        }
    }

    async function recallBatch() {
        if (!contract) {
            alert("WARNING: UNAUTHORIZED.");
            return;
        }

        if (!recallId) {
            alert("ERROR: BATCH_ID REQUIRED.");
            return;
        }

        try {
            setLoading(true);
            setRecallTxHash(""); // clear old hash

            const tx = await contract.recallBatch(recallId);
            setRecallTxHash(tx.hash);
            await tx.wait();

            alert("CRITICAL ALERT: BATCH OFFICIALLY RECALLED.");

            setRecallId("");

        } catch (error) {
            console.error(error);
            alert("ERROR: RECALL FAILED. INSUFFICIENT CLEARANCE.");
        } finally {
            setLoading(false);
        }
    }

    async function verifyBatch() {
        if (!contract) {
            alert("WARNING: WEB3 PROVIDER NEEDED FOR QUERY.");
            return;
        }

        if (!verifyId) {
            alert("ERROR: BATCH_ID REQUIRED.");
            return;
        }

        try {
            setLoading(true);
            setBatchData(null); // clear old data

            const data = await contract.verifyBatch(verifyId);

            setBatchData({
                batchId: data[0],
                drugName: data[1],
                mfgDate: data[2],
                expDate: data[3],
                owner: data[4],
                recalled: data[5],
            });

        } catch (error) {
            console.error(error);
            alert("ERROR: 404 BATCH NOT FOUND IN LEDGER.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`dashboard-container ${isGlitching ? 'glitch-window' : ''}`}
        >
            <div className="header">
                <h1 className="glitch" data-text="TERMINAL_ACCESS">TERMINAL_ACCESS</h1>
                <p className="typewriter">SECURE PROTOCOL // MEDCHAIN LOGISTICS CORE</p>
            </div>

            <div className="system-status">
                <div className="status-indicator">
                    <Database size={16} /> LEDGER: {account ? <span className="text-green">ONLINE</span> : <span className="text-red">OFFLINE</span>}
                </div>
                <div className="status-indicator">
                    <Key size={16} /> NETWORK: SEPOLIA
                </div>
            </div>

            <div className="wallet-section">
                <button onClick={connectWallet} className={account ? "btn-connected" : "btn-primary"}>
                    {account ? "[_SESSION_ACTIVE_]" : "[_INITIALIZE_CONNECTION_]"}
                </button>
                {account && <div className="wallet-address">SYS.ID: {account}</div>}
            </div>

            <div className="divider" />

            <div className="role-selector">
                <h3>[ SELECT_CLEARANCE_LEVEL ]</h3>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option>Manufacturer</option>
                    <option>Distributor</option>
                    <option>Pharmacy</option>
                    <option>Regulator</option>
                    <option>Consumer</option>
                </select>
                <p>ACTIVE PRIVILEGE: <span className="role-badge">{role}</span></p>
            </div>

            <div className="divider" />

            <div className="panels-container">
                {role === "Manufacturer" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="action-section">
                        <h3><Activity size={20} /> [ INITIALIZE_NEW_BATCH ]</h3>
                        <div className="form-group">
                            <input
                                placeholder="BATCH_ID_"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                            />
                            <input
                                placeholder="DRUG_DESIGNATION_"
                                value={drugName}
                                onChange={(e) => setDrugName(e.target.value)}
                            />
                            <input
                                placeholder="MFG_DATE_"
                                value={mfgDate}
                                onChange={(e) => setMfgDate(e.target.value)}
                            />
                            <input
                                placeholder="EXP_DATE_"
                                value={expDate}
                                onChange={(e) => setExpDate(e.target.value)}
                            />
                            <button onClick={createBatch} disabled={loading} className="btn-action">
                                {loading ? "EXECUTING..." : "COMMIT_BATCH"}
                            </button>
                        </div>

                        {createTxHash && (
                            <div className="tx-info">
                                <p>TX.HASH:</p>
                                <a href={`https://sepolia.etherscan.io/tx/${createTxHash}`} target="_blank" rel="noopener noreferrer">
                                    {createTxHash}
                                </a>
                            </div>
                        )}
                        {lastCreatedBatch && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="qr-container">
                                <h4>VISUAL_KEY</h4>
                                <div className="qr-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <QRCodeCanvas
                                        value={JSON.stringify({
                                            BatchID: lastCreatedBatch.batchId,
                                            Drug: lastCreatedBatch.drugName,
                                            Mfg: lastCreatedBatch.mfgDate,
                                            Exp: lastCreatedBatch.expDate
                                        }, null, 2)}
                                        size={200}
                                        fgColor="#00ff00"
                                        bgColor="#001a00"
                                    />
                                    <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#0f0', textShadow: '0 0 5px #0f0' }}>SCAN FOR FULL PAYLOAD</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {(role === "Manufacturer" || role === "Distributor" || role === "Pharmacy") && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="action-section">
                        <h3><Share2 size={20} /> [ TRANSFER_CUSTODY ]</h3>
                        <div className="form-group">
                            <input
                                placeholder="BATCH_ID_"
                                value={transferId}
                                onChange={(e) => setTransferId(e.target.value)}
                            />
                            <input
                                placeholder="NEW_OWNER_ADDRESS_"
                                value={newOwner}
                                onChange={(e) => setNewOwner(e.target.value)}
                            />
                            <button onClick={transferBatch} disabled={loading} className="btn-action">
                                {loading ? "EXECUTING..." : "INITIATE_TRANSFER"}
                            </button>
                        </div>

                        {transferTxHash && (
                            <div className="tx-info">
                                <p>TX.HASH:</p>
                                <a href={`https://sepolia.etherscan.io/tx/${transferTxHash}`} target="_blank" rel="noopener noreferrer">
                                    {transferTxHash}
                                </a>
                            </div>
                        )}
                    </motion.div>
                )}

                {role === "Regulator" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="action-section danger-section">
                        <h3 className="text-red"><AlertTriangle size={20} /> [ EMERGENCY_RECALL ]</h3>
                        <div className="form-group">
                            <input
                                placeholder="BATCH_ID_"
                                value={recallId}
                                onChange={(e) => setRecallId(e.target.value)}
                                className="input-danger"
                            />
                            <button onClick={recallBatch} disabled={loading} className="btn-danger">
                                {loading ? "EXECUTING..." : "BROADCAST_RECALL"}
                            </button>
                        </div>

                        {recallTxHash && (
                            <div className="tx-info">
                                <p>TX.HASH:</p>
                                <a href={`https://sepolia.etherscan.io/tx/${recallTxHash}`} target="_blank" rel="noopener noreferrer">
                                    {recallTxHash}
                                </a>
                            </div>
                        )}
                    </motion.div>
                )}

                {role === "Consumer" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="action-section">
                        <h3><Eye size={20} /> [ SCAN_BATCH_INTEGRITY ]</h3>
                        <div className="form-group">
                            <input
                                placeholder="ENTER_BATCH_ID_"
                                value={verifyId}
                                onChange={(e) => setVerifyId(e.target.value)}
                            />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={verifyBatch} disabled={loading} className="btn-action" style={{ flex: 1 }}>
                                    {loading ? "SCANNING..." : "VERIFY_INTEGRITY"}
                                </button>

                                <button onClick={() => setShowScanner(!showScanner)} className={showScanner ? "btn-connected" : "btn-action"} style={{ flex: 1 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                        <QrCode size={18} /> {showScanner ? "CLOSE SENSOR" : "OPTICAL_SCAN"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {showScanner && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ width: '100%', maxWidth: '400px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #0f0' }}>
                                <div id="qr-reader" style={{ width: '100%', backgroundColor: '#001a00' }}></div>
                            </motion.div>
                        )}

                        {batchData && (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`status-card ${batchData.recalled ? "status-recalled" : "status-safe"}`}
                            >
                                <h3>
                                    {batchData.recalled ? (
                                        <span className="flex-center"><AlertTriangle className="icon-mr" /> ! CRITICAL: RECALLED !</span>
                                    ) : (
                                        <span className="flex-center"><ShieldCheck className="icon-mr" /> INTEGRITY: SECURE</span>
                                    )}
                                </h3>

                                <div className="scanner-line"></div>

                                <div className="status-grid">
                                    <div className="status-item">
                                        <span>BATCH_ID</span>
                                        <strong>{batchData.batchId}</strong>
                                    </div>
                                    <div className="status-item">
                                        <span>DESIGNATION</span>
                                        <strong>{batchData.drugName}</strong>
                                    </div>
                                    <div className="status-item">
                                        <span>MFG_DATE</span>
                                        <strong>{batchData.mfgDate}</strong>
                                    </div>
                                    <div className="status-item">
                                        <span>EXP_DATE</span>
                                        <strong>{batchData.expDate}</strong>
                                    </div>
                                    <div className="status-item">
                                        <span>NODE_OWNER</span>
                                        <strong>{batchData.owner}</strong>
                                    </div>
                                    <div className="status-item">
                                        <span>RECALL_STATUS</span>
                                        <strong className={batchData.recalled ? "text-red" : "text-green"}>
                                            {batchData.recalled ? "COMPROMISED" : "CLEAR"}
                                        </strong>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8em', marginBottom: '10px' }}>[ EXPORT_PORTABLE_RECORD ]</p>
                                    <div className="qr-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent' }}>
                                        <QRCodeCanvas
                                            value={JSON.stringify({
                                                BatchID: batchData.batchId,
                                                Drug: batchData.drugName,
                                                Mfg: batchData.mfgDate,
                                                Exp: batchData.expDate,
                                                Status: batchData.recalled ? "RECALLED" : "VERIFIED",
                                                Network: "MedChain (Sepolia)"
                                            }, null, 2)}
                                            size={120}
                                            fgColor={batchData.recalled ? "#ff003c" : "#00ff00"}
                                            bgColor="#000"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default Dashboard;
