import React from 'react';
import { Hero, KnowAboutUs, WhatWedo, DonationsCta } from "../../components/index.js";

function LandingPage() {
    return (
        <div className="page-container"> {/* Use general page container if needed */}
            <main>
                <section className="landing-page-section hero-section-wrapper">
                    <Hero />
                </section>
                <section className="landing-page-section">
                    <KnowAboutUs />
                </section>
                <section className="landing-page-section">
                    <WhatWedo />
                </section>
                <section className="landing-page-section">
                    <DonationsCta />
                </section>
            </main>
        </div>
    )
}

export default LandingPage;