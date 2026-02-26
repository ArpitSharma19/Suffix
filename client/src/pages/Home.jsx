import React from "react";

import Hero from "../components/Hero";
import About from "../components/About";
import Products from "../components/Products";
import Success from "../components/Success";
import ImageGrid from "../components/ImageGrid";

const Home = () => {
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

            <section id="careers">
                <ImageGrid />
            </section>
        </>
    );
};

export default Home;
