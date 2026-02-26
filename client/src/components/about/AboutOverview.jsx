import React from "react";

const AboutOverview = ({ title, image, paragraphs }) => {
    return (
        <section className="container py-5">
            <div className="row align-items-center g-4">
                <div className="col-md-5">
                    <img src={image} alt="About" className="img-fluid rounded shadow-sm hover-scale" />
                </div>
                <div className="col-md-7">
                    <h2 className="mb-3">{title}</h2>
                    {(paragraphs || []).map((p, i) => (
                        <p key={i} className="text-muted">{p}</p>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutOverview;
