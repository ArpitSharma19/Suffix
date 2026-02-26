import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Hero from "../components/Hero";
import About from "../components/About";
import Products from "../components/Products";
import Success from "../components/Success";
import ImageGrid from "../components/ImageGrid";
import ContactSection from "../components/ContactSection";
import { getContentByKey } from "../services/api";
import AboutHero from "../components/about/AboutHero";
import AboutOverview from "../components/about/AboutOverview";
import AboutMission from "../components/about/AboutMission";
import AboutStarted from "../components/about/AboutStarted";

const DynamicPage = () => {
    const { slug, section } = useParams();
    const [page, setPage] = useState(null);
    const [aboutContent, setAboutContent] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getContentByKey('page-' + slug);
                setPage(res.data ? res.data.value : null);
            } catch {
                setPage(null);
            }
            try {
                const aboutRes = await getContentByKey('aboutPage');
                setAboutContent(aboutRes.data ? aboutRes.data.value : null);
            } catch {
                setAboutContent(null);
            }
        };
        load();
    }, [slug]);

    const sections = useMemo(() => page?.sections || [], [page]);
    const normalized = useMemo(() => {
        const list = Array.isArray(sections) ? sections : [];
        return list.map((item) => {
            if (typeof item === 'string') {
                return { type: item, overrides: page?.overrides?.[item] || {} };
            }
            return { type: item?.type, overrides: item?.overrides || {} };
        });
    }, [sections, page]);

    useEffect(() => {
        if (!section) return;
        const lower = section.toString().toLowerCase();
        const nav = document.querySelector("nav.fixed-top");
        const navH = nav ? nav.getBoundingClientRect().height : 0;
        const all = Array.from(document.querySelectorAll("[id]"));
        const target = all.find(el => (el.id || "").toLowerCase() === lower);
        if (target) {
            const rect = target.getBoundingClientRect();
            const y = Math.max(0, rect.top + window.pageYOffset - navH);
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    }, [section, normalized]);

    return (
        <>
            <main>
                {(() => {
                    const list = normalized.filter((s) => s.type !== 'navbar' && s.type !== 'footer');
                    const totals = {};
                    list.forEach(s => { totals[s.type] = (totals[s.type] || 0) + 1; });
                    const seen = {};
                    return list.map((s, i) => {
                    seen[s.type] = (seen[s.type] || 0) + 1;
                    const idx = seen[s.type];
                    const id = totals[s.type] > 1 ? `${s.type}${idx}` : s.type;
                    const wrap = (node) => (
                        <div id={id} className={`page-section page-section-${s.type}`} data-section={s.type} key={`${s.type}-${i}`}>
                            <div className="page-section-inner">
                                {node}
                            </div>
                        </div>
                    );
                    if (s.type === 'hero') {
                        return wrap(<Hero override={s.overrides} />);
                    }
                    if (s.type === 'about') {
                        return wrap(<About override={s.overrides} />);
                    }
                    if (s.type === 'products') {
                        return wrap(<Products override={s.overrides} />);
                    }
                    if (s.type === 'solutions') {
                        return wrap(<Success override={s.overrides} />);
                    }
                    if (s.type === 'imageGrid') {
                        return wrap(<ImageGrid override={s.overrides} />);
                    }
                    if (s.type === 'contact') {
                        return wrap(<ContactSection override={s.overrides} />);
                    }
                    if (s.type === 'aboutHero' && (aboutContent || s.overrides)) {
                        return wrap(
                            <AboutHero
                                image={s.overrides?.image || aboutContent?.hero?.image}
                                line1={s.overrides?.line1 || s.overrides?.title || aboutContent?.hero?.line1}
                                line2={s.overrides?.line2 || s.overrides?.subtitle || aboutContent?.hero?.line2}
                            />
                        );
                    }
                    if (s.type === 'aboutOverview' && (aboutContent || s.overrides)) {
                        return wrap(
                            <AboutOverview
                                title={s.overrides?.title || aboutContent?.about?.title}
                                image={s.overrides?.image || aboutContent?.about?.image}
                                paragraphs={s.overrides?.paragraphs || aboutContent?.about?.paragraphs}
                            />
                        );
                    }
                    if (s.type === 'aboutMission' && (aboutContent || s.overrides)) {
                        return wrap(
                            <AboutMission
                                title={s.overrides?.title || aboutContent?.mission?.title}
                                text={s.overrides?.text || s.overrides?.body || aboutContent?.mission?.text}
                                image={s.overrides?.image || aboutContent?.mission?.image}
                            />
                        );
                    }
                    if (s.type === 'aboutStarted' && (aboutContent || s.overrides)) {
                        return wrap(
                            <AboutStarted
                                title={s.overrides?.title || aboutContent?.started?.title}
                                lead={s.overrides?.lead || s.overrides?.subtitle || aboutContent?.started?.lead}
                                text={s.overrides?.text || s.overrides?.body || aboutContent?.started?.text}
                                image={s.overrides?.image || aboutContent?.started?.image}
                            />
                        );
                    }
                    return null;
                });
                })()}
            </main>
        </>
    );
};

export default DynamicPage;
