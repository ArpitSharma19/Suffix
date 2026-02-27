import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Hero from "../components/Hero";
import About from "../components/About";
import Products from "../components/Products";
import Success from "../components/Success";
import ImageGrid from "../components/ImageGrid";

const Home = () => {
    const { section } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        if (!section) return;
        const lower = section.toString().toLowerCase();
        const alias = {
            hero: "home",
            imagegrid: "imageGrid",
            career: "imageGrid",
            careers: "imageGrid"
        };
        const target = alias[lower] || lower;
        const nav = document.querySelector("nav.fixed-top");
        const navH = nav ? nav.getBoundingClientRect().height : 0;

        let attempts = 0;
        const maxAttempts = 40; // allow ~40 frames
        const tick = () => {
            attempts += 1;
            const el = document.getElementById(target);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                if (navH > 0) setTimeout(() => window.scrollBy(0, -navH), 0);
                return;
            }
            if (attempts < maxAttempts) {
                requestAnimationFrame(tick);
            } else {
                navigate("/home", { replace: true });
            }
        };
        requestAnimationFrame(tick);
    }, [section, navigate]);
    return (
        <>
            <section id="home">
                <Hero />
            </section>

            <section id="about">
                <About />
            </section>

            <section id="products">
                <Products />
            </section>

            <section id="solutions">
                <Success />
            </section>

            <section id="imageGrid">
                <ImageGrid />
            </section>
        </>
    );
};

export default Home;
