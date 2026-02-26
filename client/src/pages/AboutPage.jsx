import React, { useEffect, useState } from "react";
import { getContentByKey } from "../services/api";
import "../App.css";
import AboutHero from "../components/about/AboutHero";
import AboutOverview from "../components/about/AboutOverview";
import AboutMission from "../components/about/AboutMission";
import AboutStarted from "../components/about/AboutStarted";

const defaultContent = {
    hero: {
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=60",
        line1: "THE ROAD TO SUCCESS IS A LOT EASIER",
        line2: "when You are Working with a Pro"
    },
    about: {
        title: "About Student Profile Pro",
        image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=800&q=60",
        paragraphs: [
            "We believe that every high school student deserves to be seen as more than just grades and certificates.",
            "Our services help students create and amplify a personalised digital profile that captures the essence of your passions, achievements and potential.",
            "In a world where every student is chasing top scores, what sets you apart is your authentic story and strengths."
        ]
    },
    mission: {
        title: "Our Mission",
        image: "https://images.unsplash.com/photo-1515165562835-c3b8c2e62a68?auto=format&fit=crop&w=900&q=60",
        text: "Helping students craft a digital identity that goes beyond test scores—highlighting desires, extracurricular achievements and true personality."
    },
    started: {
        title: "How we Started",
        image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=800&q=60",
        lead: "Student Profile Pro was founded with a clear vision: help students discover their potential using digital media.",
        text: "Working with students across India and the US, we noticed a gap: many focused on exams, but few used digital media to showcase themselves meaningfully. We’re changing that."
    }
};

const AboutPage = () => {
    const [content, setContent] = useState(defaultContent);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getContentByKey("aboutPage");
                if (res.data && res.data.value) {
                    const v = res.data.value;
                    setContent({
                        hero: { ...defaultContent.hero, ...(v.hero || {}) },
                        about: { ...defaultContent.about, ...(v.about || {}) },
                        mission: { ...defaultContent.mission, ...(v.mission || {}) },
                        started: { ...defaultContent.started, ...(v.started || {}) }
                    });
                }
            } catch {
                /* keep defaults */
            }
        };
        load();
    }, []);

    return (
        <>
            <main>
                <div id="aboutHero" className="page-section page-section-aboutHero" data-section="aboutHero">
                    <div className="page-section-inner">
                        <AboutHero image={content.hero.image} line1={content.hero.line1} line2={content.hero.line2} />
                    </div>
                </div>
                <div id="aboutOverview" className="page-section page-section-aboutOverview" data-section="aboutOverview">
                    <div className="page-section-inner">
                        <AboutOverview title={content.about.title} image={content.about.image} paragraphs={content.about.paragraphs} />
                    </div>
                </div>
                <div id="aboutMission" className="page-section page-section-aboutMission" data-section="aboutMission">
                    <div className="page-section-inner">
                        <AboutMission title={content.mission.title} text={content.mission.text} image={content.mission.image} />
                    </div>
                </div>
                <div id="aboutStarted" className="page-section page-section-aboutStarted" data-section="aboutStarted">
                    <div className="page-section-inner">
                        <AboutStarted title={content.started.title} lead={content.started.lead} text={content.started.text} image={content.started.image} />
                    </div>
                </div>
            </main>
        </>
    );
};

export default AboutPage;
