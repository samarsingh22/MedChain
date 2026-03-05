import { Link } from 'react-router-dom';
import { Shield, Database, Search, Network } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
    return (
        <div className="landing-container">
            <div className="hero-section">
                <motion.div
                    className="glitch-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-glitch" data-text="MEDCHAIN">MEDCHAIN</h1>
                    <h2 className="subtitle">DECENTRALIZED PHARMACEUTICAL SUPPLY PROTOCOL</h2>
                </motion.div>

                <motion.p
                    className="hero-description terminal-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    &gt; System initialized...<br />
                    &gt; Eradicating counterfeit drugs via immutable blockchain ledger.<br />
                    &gt; Providing verifiable transparency from manufacturer to consumer.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <Link to="/app" className="launch-btn">
                        [ INITIATE_DAPP ]
                    </Link>
                </motion.div>
            </div>

            <div className="features-grid">
                <motion.div
                    className="feature-card"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px #0f0" }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Database className="feature-icon" />
                    <h3>IMMUTABLE LEDGER</h3>
                    <p>Every batch record is cryptographically secured on the Ethereum network.</p>
                </motion.div>

                <motion.div
                    className="feature-card"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px #0f0" }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Network className="feature-icon" />
                    <h3>SUPPLY TRACKING</h3>
                    <p>Trace the exact chain of custody from production to pharmacy shelves.</p>
                </motion.div>

                <motion.div
                    className="feature-card"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px #0f0" }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Shield className="feature-icon" />
                    <h3>RECALL PROTOCOL</h3>
                    <p>Instantaneous, network-wide flagging of compromised batches by regulators.</p>
                </motion.div>

                <motion.div
                    className="feature-card"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px #0f0" }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Search className="feature-icon" />
                    <h3>CONSUMER AUDIT</h3>
                    <p>Consumers can scan and verify the exact origin of their medication trustlessly.</p>
                </motion.div>
            </div>

            <div className="matrix-bg"></div>
        </div>
    );
}
