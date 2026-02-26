import React, { useEffect, useState } from 'react';
import { getContentByKey, updateContent } from '../../services/api';
import ImageUploader from './ImageUploader';

const defaultContent = {
    hero: { image: '', imageId: '', line1: '', line2: '' },
    about: { title: '', image: '', imageId: '', paragraphs: [''] },
    mission: { title: '', image: '', imageId: '', text: '' },
    started: { title: '', image: '', imageId: '', lead: '', text: '' }
};

const AboutPageEditor = ({ section }) => {
    const [content, setContent] = useState(defaultContent);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getContentByKey('aboutPage');
                setContent({ ...defaultContent, ...(res.data?.value || {}) });
            } catch {
                /* keep defaults */
            }
        };
        load();
    }, []);

    const save = async () => {
        try {
            await updateContent({ key: 'aboutPage', value: content });
            setMessage({ type: 'success', text: 'About page saved successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
        }
    };

    const updateParagraph = (idx, value) => {
        const next = [...(content.about.paragraphs || [])];
        next[idx] = value;
        setContent({ ...content, about: { ...content.about, paragraphs: next } });
    };

    const addParagraph = () => {
        setContent({
            ...content,
            about: { ...content.about, paragraphs: [...(content.about.paragraphs || []), ''] }
        });
    };

    const removeParagraph = (idx) => {
        const next = (content.about.paragraphs || []).filter((_, i) => i !== idx);
        setContent({ ...content, about: { ...content.about, paragraphs: next } });
    };
    const persistHeroImage = async (url, id) => {
        const next = { ...content, hero: { ...content.hero, image: url, imageId: id } };
        setContent(next);
        await updateContent({ key: 'aboutPage', value: next });
        setMessage({ type: 'success', text: 'Hero image saved' });
    };
    const persistOverviewImage = async (url, id) => {
        const next = { ...content, about: { ...content.about, image: url, imageId: id } };
        setContent(next);
        await updateContent({ key: 'aboutPage', value: next });
        setMessage({ type: 'success', text: 'Overview image saved' });
    };
    const persistMissionImage = async (url, id) => {
        const next = { ...content, mission: { ...content.mission, image: url, imageId: id } };
        setContent(next);
        await updateContent({ key: 'aboutPage', value: next });
        setMessage({ type: 'success', text: 'Mission image saved' });
    };
    const persistStartedImage = async (url, id) => {
        const next = { ...content, started: { ...content.started, image: url, imageId: id } };
        setContent(next);
        await updateContent({ key: 'aboutPage', value: next });
        setMessage({ type: 'success', text: 'Started image saved' });
    };

    const renderHero = () => (
        <div className="mb-4">
            <h5 className="mb-3">Hero</h5>
            <div className="mb-2">
                <label className="form-label">Headline Line 1</label>
                <input
                    className="form-control"
                    value={content.hero.line1}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, line1: e.target.value } })}
                />
            </div>
            <div className="mb-2">
                <label className="form-label">Headline Line 2</label>
                <input
                    className="form-control"
                    value={content.hero.line2}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, line2: e.target.value } })}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Background Image</label>
                <ImageUploader
                    currentImage={content.hero.image}
                    currentImageId={content.hero.imageId}
                    onUpload={(url, id) => setContent({ ...content, hero: { ...content.hero, image: url, imageId: id } })}
                    onPersist={persistHeroImage}
                />
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="mb-4">
            <h5 className="mb-3">Overview</h5>
            <div className="mb-2">
                <label className="form-label">Title</label>
                <input
                    className="form-control"
                    value={content.about.title}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Image</label>
                <ImageUploader
                    currentImage={content.about.image}
                    currentImageId={content.about.imageId}
                    onUpload={(url, id) => setContent({ ...content, about: { ...content.about, image: url, imageId: id } })}
                    onPersist={persistOverviewImage}
                />
            </div>
            <div className="mb-2">
                <label className="form-label">Paragraphs</label>
                {(content.about.paragraphs || []).map((p, i) => (
                    <div className="d-flex gap-2 mb-2" key={i}>
                        <textarea
                            className="form-control"
                            value={p}
                            onChange={(e) => updateParagraph(i, e.target.value)}
                        />
                        <button className="btn btn-outline-danger" onClick={() => removeParagraph(i)}>Delete</button>
                    </div>
                ))}
                <button className="btn btn-outline-primary" onClick={addParagraph}>Add Paragraph</button>
            </div>
        </div>
    );

    const renderMission = () => (
        <div className="mb-4">
            <h5 className="mb-3">Mission</h5>
            <div className="mb-2">
                <label className="form-label">Title</label>
                <input
                    className="form-control"
                    value={content.mission.title}
                    onChange={(e) => setContent({ ...content, mission: { ...content.mission, title: e.target.value } })}
                />
            </div>
            <div className="mb-2">
                <label className="form-label">Text</label>
                <textarea
                    className="form-control"
                    value={content.mission.text}
                    onChange={(e) => setContent({ ...content, mission: { ...content.mission, text: e.target.value } })}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Image</label>
                <ImageUploader
                    currentImage={content.mission.image}
                    currentImageId={content.mission.imageId}
                    onUpload={(url, id) => setContent({ ...content, mission: { ...content.mission, image: url, imageId: id } })}
                    onPersist={persistMissionImage}
                />
            </div>
        </div>
    );

    const renderStarted = () => (
        <div>
            <h5 className="mb-3">How We Started</h5>
            <div className="mb-2">
                <label className="form-label">Title</label>
                <input
                    className="form-control"
                    value={content.started.title}
                    onChange={(e) => setContent({ ...content, started: { ...content.started, title: e.target.value } })}
                />
            </div>
            <div className="mb-2">
                <label className="form-label">Lead</label>
                <input
                    className="form-control"
                    value={content.started.lead}
                    onChange={(e) => setContent({ ...content, started: { ...content.started, lead: e.target.value } })}
                />
            </div>
            <div className="mb-2">
                <label className="form-label">Text</label>
                <textarea
                    className="form-control"
                    value={content.started.text}
                    onChange={(e) => setContent({ ...content, started: { ...content.started, text: e.target.value } })}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Image</label>
                <ImageUploader
                    currentImage={content.started.image}
                    currentImageId={content.started.imageId}
                    onUpload={(url, id) => setContent({ ...content, started: { ...content.started, image: url, imageId: id } })}
                    onPersist={persistStartedImage}
                />
            </div>
        </div>
    );

    return (
        <div className="card">
            <div className="card-header">
                <h3>Edit About Page</h3>
            </div>
            <div className="card-body">
                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                        {message.text}
                    </div>
                )}

                {section === 'hero' && renderHero()}
                {section === 'overview' && renderOverview()}
                {section === 'mission' && renderMission()}
                {section === 'started' && renderStarted()}

                {(!section || section === 'all') && (
                    <>
                        {renderHero()}
                        {renderOverview()}
                        {renderMission()}
                        {renderStarted()}
                    </>
                )}

                <div className="mt-3">
                    <button className="btn btn-success" onClick={save}>Save About Page</button>
                </div>
            </div>
        </div>
    );
};

export default AboutPageEditor;
