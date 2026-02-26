import React, { useState, useEffect } from "react";
import "../App.css";
import { getContentByKey } from "../services/api";

// Import all images from src/assets
import ExperienceImg from "../assets/experience.jpg";
import InsightImg from "../assets/insight.jpg";
import InnovateImg from "../assets/innovate.jpg";
import AccelerateImg from "../assets/accelerate.jpg";
import AssureImg from "../assets/assure.jpg";

const ImageGrid = ({ override }) => {
    const [content, setContent] = useState({
        experience: { image: "", link: "#", label: "Experience" },
        insight: { image: "", link: "#", label: "Insight" },
        innovate: { image: "", link: "#", label: "Innovate" },
        accelerate: { image: "", link: "#", label: "Accelerate" },
        assure: { image: "", link: "#", label: "Assure" }
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await getContentByKey('imageGrid');
                if (data && data.value) setContent(data.value);
            } catch (error) {
                console.error("Error fetching imageGrid content:", error);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="py-6 bg-white">
            <div className="container overflow-hidden">
                <div className="row g-0"> {/* g-0 removes all gutters */}
                    {/* Large left section */}
                    <div className="col-md-6">
                        <div
                            className="d-flex align-items-end p-3 text-white grid-tile grid-tile-lg justify-content-center justify-content-xl-start"
                            style={{ backgroundImage: `url(${(override?.experience?.image) || content.experience?.image || ExperienceImg})` }}
                        >
                            <h5 className="mb-0"><a href={(override?.experience?.link) || content.experience?.link || "#"} className="text-decoration-none text-white fs-24 fw-bold">{(override?.experience?.label) || content.experience?.label || "Experience"}</a></h5>
                        </div>
                    </div>

                    {/* Right grid */}
                    <div className="col-md-6">
                        <div className="row g-0"> {/* g-0 removes spacing between small images */}
                            <div className="col-6">
                                <div
                                    className="d-flex align-items-end p-2 text-white grid-tile justify-content-center justify-content-xl-start hover-scale"
                                    style={{ backgroundImage: `url(${(override?.insight?.image) || content.insight?.image || InsightImg})` }}
                                >
                                    <a href={(override?.insight?.link) || content.insight?.link || "#"} className="text-decoration-none text-white fs-20 fw-bold">{(override?.insight?.label) || content.insight?.label || "Insight"}</a>
                                </div>
                            </div>
                            <div className="col-6">
                                <div
                                    className="d-flex align-items-end p-2 text-white grid-tile justify-content-center justify-content-xl-start"
                                    style={{ backgroundImage: `url(${(override?.innovate?.image) || content.innovate?.image || InnovateImg})` }}
                                >
                                    <a href={(override?.innovate?.link) || content.innovate?.link || "#"} className="text-decoration-none text-white fs-20 fw-bold">{(override?.innovate?.label) || content.innovate?.label || "Innovate"}</a>
                                </div>
                            </div>
                            <div className="col-6">
                                <div
                                    className="d-flex align-items-end p-2 text-white grid-tile justify-content-center justify-content-xl-start"
                                    style={{ backgroundImage: `url(${(override?.accelerate?.image) || content.accelerate?.image || AccelerateImg})` }}
                                >
                                    <a href={(override?.accelerate?.link) || content.accelerate?.link || "#"} className="text-decoration-none text-white fs-20 fw-bold">{(override?.accelerate?.label) || content.accelerate?.label || "Accelerate"}</a>
                                </div>
                            </div>
                            <div className="col-6">
                                <div
                                    className="d-flex align-items-end p-2 text-white grid-tile justify-content-center justify-content-xl-start"
                                    style={{ backgroundImage: `url(${(override?.assure?.image) || content.assure?.image || AssureImg})` }}
                                >
                                    <a href={(override?.assure?.link) || content.assure?.link || "#"} className="text-decoration-none text-white fs-20 fw-bold">{(override?.assure?.label) || content.assure?.label || "Assure"}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageGrid;
