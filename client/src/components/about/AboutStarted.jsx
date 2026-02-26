import React from "react";

const AboutStarted = ({ title, lead, text, image }) => {
    return (
        <section className="container py-5">
            <div className="row align-items-center g-4">
                <div className="col-md-6">
                    <h2 className="mb-3">{title}</h2>
                    <p className="fw-semibold">{lead}</p>
                    <p className="text-muted">{text}</p>
                </div>
                <div className="col-md-6">
                    <img src={image} alt="How we started" className="img-fluid rounded shadow-sm hover-scale" />
                </div>
            </div>
        </section>
    );
};

export default AboutStarted;
