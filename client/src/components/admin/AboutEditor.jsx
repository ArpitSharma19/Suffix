import React, { useState, useEffect } from 'react';
import { getContentByKey, updateContent } from '../../services/api';

const AboutEditor = () => {
    const [data, setData] = useState({ heading: '', subheading: '', cards: [] });

    const loadData = async () => {
        try {
            const res = await getContentByKey('about');
            if (res.data && res.data.value) {
                if (Array.isArray(res.data.value)) {
                     setData({ heading: '', subheading: '', cards: res.data.value });
                } else {
                    setData(res.data.value);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            loadData();
        }, 0);
    }, []);

    const handleSave = async () => {
        try {
            await updateContent({ key: 'about', value: data });
            alert('About section saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };

    const addCard = () => {
        setData({ ...data, cards: [...data.cards, { title: '', description: '' }] });
    };

    const removeCard = (index) => {
        const newCards = data.cards.filter((_, i) => i !== index);
        setData({ ...data, cards: newCards });
    };

    const updateCard = (index, field, value) => {
        const newCards = [...data.cards];
        newCards[index][field] = value;
        setData({ ...data, cards: newCards });
    };

    return (
        <div>
            <h3>About Section (Expertise)</h3>
            
            <div className="mb-3">
                <label>Heading</label>
                <input
                    className="form-control"
                    value={data.heading || ''}
                    onChange={(e) => setData({ ...data, heading: e.target.value })}
                />
            </div>
            <div className="mb-3">
                <label>Subheading</label>
                <textarea
                    className="form-control"
                    value={data.subheading || ''}
                    onChange={(e) => setData({ ...data, subheading: e.target.value })}
                />
            </div>

            {data.cards.map((card, index) => (
                <div key={index} className="card mb-3 p-3">
                    <div className="d-flex justify-content-between">
                        <h5>Card {index + 1}</h5>
                        <button className="btn btn-danger btn-sm" onClick={() => removeCard(index)}>Delete</button>
                    </div>
                    <div className="mb-2">
                        <label>Title</label>
                        <input
                            className="form-control"
                            value={card.title}
                            onChange={(e) => updateCard(index, 'title', e.target.value)}
                        />
                    </div>
                    <div className="mb-2">
                        <label>Description</label>
                        <textarea
                            className="form-control"
                            value={card.description}
                            onChange={(e) => updateCard(index, 'description', e.target.value)}
                        />
                    </div>
                </div>
            ))}
            <button className="btn btn-primary me-2" onClick={addCard}>Add Card</button>
            <button className="btn btn-success" onClick={handleSave}>Save Changes</button>
        </div>
    );
};

export default AboutEditor;
