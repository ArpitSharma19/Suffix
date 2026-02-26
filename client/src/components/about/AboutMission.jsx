import React from "react";

const AboutMission = ({ title, text, image }) => {
    return (
        <section className="container py-4">
            <div className="row align-items-center g-4">
                <div className="col-md-6 order-md-1 order-2">
                    <h2 className="mb-3">{title}</h2>
                    <p className="text-muted">{text}</p>
                </div>
                <div className="col-md-6 order-md-2 order-1">
                    <img src={image} alt="Mission" className="img-fluid rounded shadow-sm hover-scale" />
                </div>
            </div>
        </section>
    );
};

export default AboutMission;
