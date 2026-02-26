import React from "react";

const AboutHero = ({ image, line1, line2 }) => {
    return (
        <section
            className="about-hero d-flex align-items-center justify-content-center text-center text-white py-5 mt-9"
            style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "60vh"
            }}
        >
            <div>
                <h1 className="display-6 fw-bold" style={{ letterSpacing: 1 }}>
                    <span style={{ color: "#d7ff46" }}>{line1}</span>
                </h1>
                <p className="mt-2 fs-5">{line2}</p>
            </div>
        </section>
    );
};

export default AboutHero;

