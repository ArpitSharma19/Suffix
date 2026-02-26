import React, { useState, useEffect } from 'react';
import { getContentByKey, updateContent } from '../../services/api';
import ImageUploader from './ImageUploader';

const ImageGridEditor = () => {
    const [content, setContent] = useState({
        experience: { image: "", link: "#", imageId: "", label: "Experience" },
        insight: { image: "", link: "#", imageId: "", label: "Insight" },
        innovate: { image: "", link: "#", imageId: "", label: "Innovate" },
        accelerate: { image: "", link: "#", imageId: "", label: "Accelerate" },
        assure: { image: "", link: "#", imageId: "", label: "Assure" }
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchContent = async () => {
        try {
            const { data } = await getContentByKey('imageGrid');
            if (data) setContent(data.value);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching image grid content:', error);
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
            await updateContent({ key: 'imageGrid', value: content });
            setMessage({ type: 'success', text: 'Image Grid updated successfully' });
        } catch (error) {
            console.error('Error updating image grid:', error);
            setMessage({ type: 'error', text: 'Error updating image grid' });
        }
    };

    const updateItem = (key, field, value) => {
        setContent({
            ...content,
            [key]: {
                ...content[key],
                [field]: value
            }
        });
    };
    const persistItemImage = (key) => async (url, id) => {
        const next = {
            ...content,
            [key]: {
                ...content[key],
                image: url,
                imageId: id
            }
        };
        setContent(next);
        await updateContent({ key: 'imageGrid', value: next });
        setMessage({ type: 'success', text: 'Image saved' });
    };

    if (loading) return <div>Loading...</div>;

    const gridItems = [
        { key: 'experience', label: 'Experience' },
        { key: 'insight', label: 'Insight' },
        { key: 'innovate', label: 'Innovate' },
        { key: 'accelerate', label: 'Accelerate' },
        { key: 'assure', label: 'Assure' }
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h3>Image Grid Editor</h3>
            </div>
            <div className="card-body">
                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                        {message.text}
                    </div>
                )}

                <div className="row">
                    {gridItems.map((item) => (
                        <div key={item.key} className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5>{item.label}</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Image</label>
                                        <ImageUploader 
                                            onUpload={(url, id) => {
                                                updateItem(item.key, 'image', url);
                                                updateItem(item.key, 'imageId', id);
                                            }}
                                            onPersist={persistItemImage(item.key)}
                                            currentImage={content[item.key]?.image}
                                            currentImageId={content[item.key]?.imageId}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={content[item.key]?.label || ''}
                                            onChange={(e) => updateItem(item.key, 'label', e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Link</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={content[item.key]?.link || ''}
                                            onChange={(e) => updateItem(item.key, 'link', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default ImageGridEditor;
