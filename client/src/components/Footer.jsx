import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { getContentByKey } from "../services/api";

const Footer = () => {
    const [content, setContent] = useState({
        products: [],
        solutions: [],
        company: []
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await getContentByKey('footer');
                if (data && data.value) setContent(data.value);
            } catch (error) {
                console.error("Error fetching footer content:", error);
            }
        };
        fetchContent();
    }, []);

    // Default fallbacks
    const defaultProducts = [
        { text: "AttendPro - Smart Attendance System", link: "#" },
        { text: "Smart - Sanitation Management System", link: "#" },
        { text: "AutoPro - Vehicle Management System", link: "#" }
    ];

    const defaultSolutions = [
        { text: "Artificial Intelligence", link: "#" },
        { text: "Custom Software Development", link: "#" },
        { text: "Digital Transformation", link: "#" },
        { text: "Internet of Things (IoT)", link: "#" }
    ];

    const defaultCompany = [
        { text: "About", link: "#" },
        { text: "Awards", link: "#" },
        { text: "Leadership Team", link: "#" },
        { text: "Case Study", link: "#" },
        { text: "Our Clients", link: "#" },
        { text: "Newsroom", link: "#" },
        { text: "Careers", link: "#" },
        { text: "Contact", link: "#" }
    ];

    const products = (content.products?.length > 0 ? content.products : defaultProducts).map((item, i) => {
        const f = defaultProducts[i % defaultProducts.length];
        return { text: item.text || f.text, link: item.link || f.link };
    });

    const solutions = (content.solutions?.length > 0 ? content.solutions : defaultSolutions).map((item, i) => {
        const f = defaultSolutions[i % defaultSolutions.length];
        return { text: item.text || f.text, link: item.link || f.link };
    });

    const company = (content.company?.length > 0 ? content.company : defaultCompany).map((item, i) => {
        const f = defaultCompany[i % defaultCompany.length];
        return { text: item.text || f.text, link: item.link || f.link };
    });

    return (
        <footer id="contact" className="bg-light py-5">
            <div className="container">
                <div className="row text-start text-xl-start">

                    <div className="col-md-4">
                        <h4>Products</h4>
                        <ul className="list-unstyled">
                            {products.map((item, index) => (
                                <li key={index}>
                                    <FontAwesomeIcon icon={faAngleRight} />
                                    <a href={item.link} className="text-decoration-none text-dark fs-14"> {item.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-md-4">
                        <h4>Solutions</h4>
                        <ul className="list-unstyled">
                            {solutions.map((item, index) => (
                                <li key={index}>
                                    <FontAwesomeIcon icon={faAngleRight} />
                                    <a href={item.link} className="text-decoration-none text-dark fs-14"> {item.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-md-4">
                        <h4>Company</h4>
                        <ul className="list-unstyled d-flex flex-wrap justify-content-start justify-content-xl-start">
                            {company.map((item, index) => (
                                <li className="w-50" key={index}>
                                    <FontAwesomeIcon icon={faAngleRight} />
                                    <a href={item.link} className="text-decoration-none text-dark fs-14"> {item.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
