import React, { useState, useEffect } from "react";
import About_Card from "./About_Card";
import "../App.css";
import { getContentByKey } from "../services/api";

const defaultCards = [
    { title: "Artificial Intelligence", description: "We help businesses use AI to work more efficiently and think ahead. From automating everyday tasks to analyzing complex data and building intelligent chatbots — our AI solutions are designed to make technology work for you. We turn data into insights, and insights into action."},
    { title: "Custom Software Development", description: "We guide organizations through every step of their digital journey — modernizing processes, adopting the right tools, and improving how teams and customers connect. Whether you’re upgrading internal systems or creating new digital experiences, we help you move from “how it’s done” to “how it should be." },
    { title: "Digital Transformation", description: "Your business has its own rhythm — your software should match it. Our team designs and develops custom applications that fit your exact needs, from workflow automation to large-scale enterprise platforms. Every line of code we write aims to make your work simpler, faster, and smarter." },
    { title: "Internet of Things (IoT)", description: "We create IoT solutions that bring your physical and digital worlds together. From smart sensors and connected devices to real-time monitoring dashboards, we help businesses gain control, visibility, and efficiency like never before. It’s technology that listens, learns, and acts — in real time." },
];

const About = ({ override }) => {
    const [content, setContent] = useState({
        heading: "",
        subheading: "",
        cards: []
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await getContentByKey('about');
                if (data && data.value) {
                    if (Array.isArray(data.value)) {
                         setContent({ heading: "", subheading: "", cards: data.value });
                    } else {
                        setContent(data.value);
                    }
                }
            } catch (error) {
                console.error("Error fetching about content:", error);
            }
        };
        fetchContent();
    }, []);

    const baseCards = (override?.cards && override.cards.length > 0) ? override.cards : (content.cards.length > 0 ? content.cards : defaultCards);
    const displayCards = baseCards.map((item, index) => {
        const fallback = defaultCards[index % defaultCards.length];
        return {
            title: item.title || fallback.title,
            description: item.description || fallback.description
        };
    });

    const heading = override?.heading || override?.title || content.heading || "Our Areas of Expertise";
    const subheading = override?.subheading || override?.subtitle || content.subheading || "We provide tailored solutions that drive success and address challenges in an ever-evolving world.";

    return (
        <section id="about" className="py-5 pb-2 bgp-gradient text-start text-xl-start">
            <div className="container">
                <h2 className="mb-2 fs-40 fw-medium">
                    {heading}
                </h2>
                <p className=" fs-20 fw-normal mb-3">
                    {subheading}
                </p>

                <div className="row justify-content-center mb-5 mx-1">
                    {displayCards.map((item, index) => (
                        <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 p-2" key={index}>
                            <About_Card {...item} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
