import React from 'react'
import {Hero, KnowAboutUs, WhatWedo, DonationsCta } from "../../components/index.js"

function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <main>
                <section className="relative z-10" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                    <Hero />
                </section>

                <section className="relative z-20 py-16" style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    padding: '2rem'
                }}>
                    <KnowAboutUs />
                </section>

                <section className="relative z-30" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                    <WhatWedo />
                </section>

                <section className="relative z-40" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                    <DonationsCta />
                </section>
            </main>
        </div>
    )
}

export default LandingPage;