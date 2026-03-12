import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ---- Particle Globe ---- */
function ParticleGlobe() {
    const meshRef = useRef();
    const count = 4000;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Fibonacci sphere distribution
            const y = 1 - (i / (count - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = ((Math.sqrt(5) - 1) / 2) * i * Math.PI * 2;
            pos[i * 3] = Math.cos(theta) * radius * 2.5;
            pos[i * 3 + 1] = y * 2.5;
            pos[i * 3 + 2] = Math.sin(theta) * radius * 2.5;
        }
        return pos;
    }, []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.08;
            meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#999999"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

function GlobeScene() {
    return (
        <>
            <ambientLight intensity={1} />
            <ParticleGlobe />
        </>
    );
}

/* ---- Navbar ---- */
function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-logo">SentinelChain</div>
            <div className="nav-links">
                <a href="#features">Platform</a>
                <a href="#industries">Industries</a>
                <a href="#security">Security</a>
                <a href="#docs">Docs</a>
            </div>
            <div className="nav-right">
                <span className="nav-login">Log in</span>
                <Link to="/app" className="btn-primary">
                    Launch App <span>→</span>
                </Link>
            </div>
        </nav>
    );
}

/* ---- Metrics Row ---- */
function Metrics() {
    const stats = [
        { number: '$500B+', label: 'Global counterfeit market', brand: 'WHO Estimate' },
        { number: '7+', label: 'Industries protected', brand: 'Cross-Sector' },
        { number: '100%', label: 'Tamper-proof records', brand: 'Blockchain Verified' },
        { number: '<2s', label: 'Verification time', brand: 'Real-time' },
    ];

    return (
        <div className="metrics-row">
            {stats.map((s, i) => (
                <motion.div
                    className="metric-item"
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.15 }}
                >
                    <div className="metric-number">{s.number}</div>
                    <div className="metric-label">{s.label}</div>
                    <div className="metric-brand">{s.brand}</div>
                </motion.div>
            ))}
        </div>
    );
}

/* ---- Landing Page ---- */
export default function Landing() {
    return (
        <>
            <Navbar />

            <section className="hero">
                <div className="hero-left">
                    <motion.span
                        className="hero-label"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        Universal Anti-Counterfeit Intelligence
                    </motion.span>

                    <motion.h1
                        className="hero-headline"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                    >
                        Sentinel
                        <br />
                        Chain
                    </motion.h1>

                    <motion.p
                        className="hero-paragraph"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        Decentralized product authenticity platform powered by blockchain.
                        Detect counterfeits, verify origins, and track supply chains across
                        pharmaceuticals, electronics, luxury goods, and more.
                    </motion.p>

                    <motion.div
                        className="hero-buttons"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <Link to="/app" className="btn-primary" style={{ textDecoration: 'none' }}>
                            Get Started <span>→</span>
                        </Link>
                        <a href="#features" className="btn-secondary" style={{ textDecoration: 'none' }}>
                            How it works
                        </a>
                    </motion.div>
                </div>

                <div className="hero-right">
                    <div className="globe-canvas">
                        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                            <GlobeScene />
                        </Canvas>
                    </div>
                </div>
            </section>

            <Metrics />
        </>
    );
}
