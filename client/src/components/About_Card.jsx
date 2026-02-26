import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";
import "../App.css";

const About_Card = ({ title, description }) => {
    const getParts = (t) => {
        if (t.startsWith("Custom Software")) {
            return { prefix: "Custom Software", suffix: t.replace(/^Custom Software\s*/, "") };
        }
        if (t.startsWith("Internet of")) {
            return { prefix: "Internet of", suffix: t.replace(/^Internet of\s*/, "") };
        }
        const words = t.split(" ");
        return { prefix: words[0], suffix: words.slice(1).join(" ") };
    };

    const { prefix, suffix } = getParts(title);

    return (
        <div className="card card-container h-100 shadow-sm border-0 mw-405 mx-auto text-start text-xl-start hover-scale">
            <div className="card-body card-box p-4">
                <h5 className="card-title fs-30 fw-light pb-1 mw-230 mx-xl-0">
                    <span className="position-relative d-inline-block">
                        {prefix}
                        <FontAwesomeIcon icon={faAngleUp} className="text-primary about-icon-angle-up" />
                    </span>
                </h5>
                <h5 className="card-title fs-30 fw-light pb-2 mw-230 mx-xl-0">
                    {suffix}
                </h5>

                <p className="card-text fw-light">
                    {description}
                </p>
            </div>
            <div className="border-bottom border-primary border-4"></div>
        </div>
    );
};

export default About_Card;
