import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";
import "../App.css";

const Product_Card = ({ title, subtitle, description, bg, images }) => {
    return (
        <div className={`card h-100 text-white border-0 ${bg} mx-auto text-start text-xl-start hover-scale`}>
            <div className="card-body p-4 pb-5">

                <small className="fs-6 position-relative d-inline-block">
                    {subtitle}
                    <FontAwesomeIcon icon={faAngleUp} className="icon-angle-up text-white" />
                </small>

                <div className="my-3 product-header justify-content-center justify-content-xl-start">
                    <h4 className="fw-light fs-40 mw-235 mb-0 product-title mx-auto mx-xl-0">
                        {title}
                    </h4>
                    <img
                        src={images}
                        alt={title}
                        className="rounded product-image"
                    />
                </div>

                <p className="fw-light">{description}</p>

                <button className="btn text-white p-2 cursor-pointer">
                    Learn more
                </button>
            </div>
        </div>
    );
};


export default Product_Card;
