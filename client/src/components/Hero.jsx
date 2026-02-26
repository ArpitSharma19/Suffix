import React, { useState, useEffect } from "react";
import "../App.css";
import Main1 from "../assets/main1.png";
import Main2 from "../assets/main2.png";
import Main3 from "../assets/main3.png";
import { getContentByKey } from "../services/api";

import Keystone from "../assets/keystone.png";
import Mis from "../assets/mis.jpg";
import Tapestry from "../assets/tapestry.jpg";
import Agency from "../assets/agency.png";
import Lig from "../assets/lig.png";
import Horizon from "../assets/horizon.png";

const defaultPartnerLogos = [Keystone, Mis, Tapestry, Agency, Lig, Horizon];

const Hero = ({ override, overrideImage }) => {
    const [content, setContent] = useState({
        title: "",
        subtitle: "",
        buttonText: "",
        buttonLink: "",
        main1: "",
        main2: "",
        main3: "",
        partnerText: "",
        partnerLogos: []
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await getContentByKey('hero');
                if (data && data.value) setContent(data.value);
            } catch (error) {
                console.error("Error fetching hero content:", error);
            }
        };
        fetchContent();
    }, []);

    const displayTitle = (override?.title) || content.title || "Delivering Technology That Powers the Next Generation of Public & Enterprise Services";
    const displaySubtitle = (override?.subtitle) || content.subtitle || "From AI to IoT, we turn modern technology into real transformation — smarter operations, seamless experiences, and measurable growth.";
    const main1Src = override?.main1 || overrideImage || override?.image || content.main1 || Main1;
    const main2Src = override?.main2 || content.main2 || Main2;
    const main3Src = override?.main3 || content.main3 || Main3;
    const partners = (override?.partnerLogos && override.partnerLogos.length > 0)
        ? override.partnerLogos
        : (content.partnerLogos.length > 0 ? content.partnerLogos : defaultPartnerLogos);

    return (
        <>
            <section id="home" className="py-5 mt-9">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 text-start text-xl-start">
                            <h1 className="display-5 fw-light mw-765 mb-4 fs-50 mx-auto mx-xl-0">
                                {displayTitle}
                            </h1>
                            <p className="lead mw-676 fs-24 mx-auto mx-xl-0">
                                {displaySubtitle}
                            </p>
                            <a href={override?.buttonLink || content.buttonLink || "#"} className="btn btn-primary btn-lg mt-3 mb-3">
                                {override?.buttonText || content.buttonText || "Learn More"}
                            </a>
                        </div>

                        <div className="col-md-6 mt-3">
                            <div className="row">
                                <div className="col-6">
                                    <img src={main1Src} className="img-fluid mb-3 hover-scale" alt="Main 1" />
                                    <img src={main2Src} className="img-fluid hover-scale" alt="Main 2" />
                                </div>
                                <div className="col-6 d-flex align-items-center">
                                    <img src={main3Src} className="img-fluid hover-scale" alt="Main 3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-left my-4">
                        <h5 className="text-muted fst-italic fw-light mw-270 fs-30">
                            {override?.partnerText || content.partnerText || "We're proud to partner with the best"}
                        </h5>

                        <div className="carousel-container">
                            <div className="carousel-track">
                                {[...partners, ...partners].map((logo, index) => (
                                    <div className="carousel-item" key={index}>
                                        <img src={logo} alt={`partner-${index}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Hero;
