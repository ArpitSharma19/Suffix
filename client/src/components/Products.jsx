import React, { useState, useEffect } from "react";
import Product_Card from "./Products_Card";
import Product1 from "../assets/product1.png";
import Product2 from "../assets/product2.png";
import Product3 from "../assets/product3.png";
import "../App.css";
import { getContentByKey } from "../services/api";

const defaultProducts = [
    {
        title: "Smart Attendance System",
        subtitle: "AttendPro",
        description:
            "AttendPro is a smart attendance solution for field teams. It verifies on-site presence with selfie check-ins, GPS and time stamps, and only marks attendance after 7 working hours, keeping records accurate and tamper-proof.",
        bg: "bg-1",
        images: Product1,
    },
    {
        title: "Sanitation Management System",
        subtitle: "SMART",
        description:
            "AttendPro is a smart attendance solution for field teams. It verifies on-site presence with selfie check-ins, GPS and time stamps, and only marks attendance after 7 working hours, keeping records accurate and tamper-proof.",
        bg: "bg-2",
        images: Product2,
    },
    {
        title: "Vehicle Management System",
        subtitle: "AutoPro",
        description:
            "AttendPro is a smart attendance solution for field teams. It verifies on-site presence with selfie check-ins, GPS and time stamps, and only marks attendance after 7 working hours, keeping records accurate and tamper-proof.",
        bg: "bg-3",
        images: Product3,
    },
];

const Products = ({ override }) => {
    const [content, setContent] = useState({
        heading: "",
        subheading: "",
        cards: []
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await getContentByKey('products');
                if (data && data.value) {
                    if (Array.isArray(data.value)) {
                        setContent({ heading: "", subheading: "", cards: data.value });
                    } else {
                        setContent(data.value);
                    }
                }
            } catch (error) {
                console.error("Error fetching products content:", error);
            }
        };
        fetchContent();
    }, []);

    const baseCards = (override?.cards && override.cards.length > 0) ? override.cards : (content.cards.length > 0 ? content.cards : defaultProducts);
    const displayProducts = baseCards.map((item, index) => {
        const fallback = defaultProducts[index % defaultProducts.length];
        return {
            title: item.title || fallback.title,
            subtitle: item.subtitle || fallback.subtitle,
            description: item.description || fallback.description,
            bg: item.bg || fallback.bg,
            images: item.images || fallback.images
        };
    });

    return (
        <section id="products" className="pb-2 pt-5 text-start text-xl-start">
            <div className="container">
                <h2 className="fs-40 mw-290 fw-medium mx-xl-0">
                    {override?.heading || content.heading || "Our Products"}
                </h2>
                <p className="fs-20 fw-normal mb-3 mw-760 mx-xl-0">
                    {override?.subheading || content.subheading || "We specialize in creating groundbreaking products that optimize operations, stimulate growth, and pave the way for unparalleled success across diverse sectors."}
                </p>

                <div className="row justify-content-center g-5 mb-5">
                    {displayProducts.map((item, index) => (
                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-4" key={index}>
                            <Product_Card {...item} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Products;
