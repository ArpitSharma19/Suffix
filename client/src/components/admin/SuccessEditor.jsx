import React, { useState, useEffect } from 'react';
import { getContentByKey, updateContent } from '../../services/api';

const SuccessEditor = () => {
    const [content, setContent] = useState({ heading: '', subheading: '', slides: [] });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchContent = async () => {
        try {
            const { data } = await getContentByKey('success');
            if (data) setContent(data.value);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching success content:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            fetchContent();
        }, 0);
    }, []);

    const handleSave = async () => {
        try {
            await updateContent({ key: 'success', value: content });
            setMessage({ type: 'success', text: 'Success section updated successfully' });
        } catch (error) {
            console.error('Error updating success section:', error);
            setMessage({ type: 'error', text: 'Error updating success section' });
        }
    };

    const updateSlide = (index, field, value) => {
        const newSlides = [...content.slides];
        newSlides[index][field] = value;
        setContent({ ...content, slides: newSlides });
    };

    const addSlide = () => {
        setContent({
            ...content,
            slides: [...content.slides, { title: '', description: '' }]
        });
    };

    const removeSlide = (index) => {
        const newSlides = content.slides.filter((_, i) => i !== index);
        setContent({ ...content, slides: newSlides });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card">
            <div className="card-header">
                <h3>Success Section Editor</h3>
            </div>
            <div className="card-body">
                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                        {message.text}
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Heading</label>
                    <input
                        type="text"
                        className="form-control"
                        value={content.heading}
                        onChange={(e) => setContent({ ...content, heading: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Subheading</label>
                    <textarea
                        className="form-control"
                        value={content.subheading}
                        onChange={(e) => setContent({ ...content, subheading: e.target.value })}
                    />
                </div>

                <h4>Slides</h4>
                {content.slides.map((slide, index) => (
                    <div key={index} className="card mb-3">
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={slide.title}
                                    onChange={(e) => updateSlide(index, 'title', e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={slide.description}
                                    onChange={(e) => updateSlide(index, 'description', e.target.value)}
                                />
                            </div>
                            <button 
                                className="btn btn-danger"
                                onClick={() => removeSlide(index)}
                            >
                                Remove Slide
                            </button>
                        </div>
                    </div>
                ))}
                <button className="btn btn-secondary mb-3" onClick={addSlide}>Add Slide</button>

                <div>
                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default SuccessEditor;
