import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import { getContentByKey } from "../services/api";

const defaultSlides = [
    {
        title: "AttendPro — Smarter Attendance for Field Teams",
        description:
            "Deployed at Varanasi Nagar Nigam, AttendPro ensures every check-in is real with selfie verification, GPS location, and time-stamped records. Attendance is only marked after completing 7 working hours, bringing discipline and accountability to the workforce. As a result, workers now reach job sites on time, productivity has significantly improved, and fake attendance has been completely stopped — helping the civic body save ₹30–40 lakhs every month while improving public service delivery.",
    },
    {
        title: "AttendPro — Smarter Attendance for Field Teams",
        description:
            "Deployed at Varanasi Nagar Nigam, AttendPro ensures every check-in is real with selfie verification, GPS location, and time-stamped records. Attendance is only marked after completing 7 working hours, bringing discipline and accountability to the workforce. As a result, workers now reach job sites on time, productivity has significantly improved, and fake attendance has been completely stopped — helping the civic body save ₹30–40 lakhs every month while improving public service delivery.",
    },
    {
        title: "AttendPro — Smarter Attendance for Field Teams",
        description:
            "Deployed at Varanasi Nagar Nigam, AttendPro ensures every check-in is real with selfie verification, GPS location, and time-stamped records. Attendance is only marked after completing 7 working hours, bringing discipline and accountability to the workforce. As a result, workers now reach job sites on time, productivity has significantly improved, and fake attendance has been completely stopped — helping the civic body save ₹30–40 lakhs every month while improving public service delivery.",
    },
];

const Success = ({ override }) => {
    const [content, setContent] = useState({
        heading: "",
        subheading: "",
        slides: []
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await getContentByKey('success');
                if (data && data.value) {
                    if (Array.isArray(data.value)) {
                         setContent({ heading: "", subheading: "", slides: data.value });
                    } else {
                        setContent(data.value);
                    }
                }
            } catch (error) {
                console.error("Error fetching success content:", error);
            }
        };
        fetchContent();
    }, []);

    const slides = (override?.slides && override.slides.length > 0) ? override.slides : (content.slides.length > 0 ? content.slides : defaultSlides);

    // Duplicate slides for infinite forward loop
    const loopSlides = [...slides, ...slides];

    const [current, setCurrent] = useState(0);
    const sliderRef = useRef(null);

    // Auto slide forward
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => prev + 1);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Scroll logic (infinite illusion)
    useEffect(() => {
        const container = sliderRef.current;
        if (!container) return;

        const width = container.offsetWidth;

        container.scrollTo({
            left: width * current,
            behavior: "smooth",
        });

        // Silent reset when reaching duplicated slides
        if (current >= slides.length) {
            setTimeout(() => {
                container.scrollTo({
                    left: width * (current - slides.length),
                    behavior: "auto",
                });
                setCurrent((prev) => prev - slides.length);
            }, 400);
        }
    }, [current, slides.length]);

    /* =========================
       TOUCH / SWIPE SUPPORT
    ========================== */
    const startX = useRef(0);
    const isDragging = useRef(false);
    const endX = useRef(0);

    const handleTouchStart = (e) => {
        startX.current = e.touches[0].clientX;
        isDragging.current = true;
    };

    const handleTouchMove = (e) => {
        if (!isDragging.current) return;
        endX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!isDragging.current) return;

        const diff = startX.current - endX.current;

        if (diff > 50) setCurrent((prev) => prev + 1);
        if (diff < -50) setCurrent((prev) => prev - 1);

        isDragging.current = false;
    };

    return (
        <section className="py-5 success-gradient">
            <div className="container">
                <h2 className="mb-2 fs-40 fw-medium mw-290 mx-xl-0">
                    {override?.heading || content.heading || "Success Stories"}
                </h2>

                <p className="fs-20 fw-normal mb-3 mw-740 mx-xl-0">
                    {override?.subheading || content.subheading || "We specialize in creating groundbreaking products that optimize operations, stimulate growth, and pave the way for unparalleled success across diverse sectors"}
                </p>

                <div
                    className="success-slider"
                    ref={sliderRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {loopSlides.map((slide, index) => (
                        <div className="success-slide" key={index}>
                            <div className="card p-5 shadow border-0">
                                <h4 className="mb-3 fs-30">{slide.title}</h4>
                                <p className="fs-20 fw-light mb-4">
                                    {slide.description}
                                </p>
                                <button className="btn text-primary p-2 align-self-start">
                                    Learn more
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots (optional, already correct) */}
                <div className="d-flex justify-content-center gap-2 mt-4">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`dot ${
                                current % slides.length === index
                                    ? "active"
                                    : ""
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Success;
