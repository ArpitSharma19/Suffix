import React, { useState, useEffect } from 'react';
import { getContentByKey, updateContent } from '../../services/api';
import ImageUploader from './ImageUploader';

const ProductsEditor = () => {
    const [data, setData] = useState({ heading: '', subheading: '', cards: [] });

    const loadData = async () => {
        try {
            const res = await getContentByKey('products');
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
            await updateContent({ key: 'products', value: data });
            alert('Products section saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };
    const persistCardImage = (index) => async (url, id) => {
        const next = { ...data };
        next.cards[index] = { ...next.cards[index], images: url, imageId: id };
        setData(next);
        await updateContent({ key: 'products', value: next });
        alert('Product image saved!');
    };

    const addCard = () => {
        setData({ 
            ...data, 
            cards: [...data.cards, { title: '', subtitle: '', description: '', bg: 'bg-1', images: '', imageId: '' }] 
        });
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
            <h3>Products Section</h3>

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
                        <h5>Product {index + 1}</h5>
                        <button className="btn btn-danger btn-sm" onClick={() => removeCard(index)}>Delete</button>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-2">
                                <label>Title</label>
                                <input
                                    className="form-control"
                                    value={card.title}
                                    onChange={(e) => updateCard(index, 'title', e.target.value)}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Subtitle</label>
                                <input
                                    className="form-control"
                                    value={card.subtitle}
                                    onChange={(e) => updateCard(index, 'subtitle', e.target.value)}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Background Class</label>
                                <select 
                                    className="form-control"
                                    value={card.bg}
                                    onChange={(e) => updateCard(index, 'bg', e.target.value)}
                                >
                                    <option value="bg-1">bg-1</option>
                                    <option value="bg-2">bg-2</option>
                                    <option value="bg-3">bg-3</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <ImageUploader 
                                label="Product Image" 
                                currentImage={card.images}
                                currentImageId={card.imageId}
                                onUpload={(url, id) => {
                                    const newCards = [...data.cards];
                                    newCards[index] = { ...newCards[index], images: url, imageId: id };
                                    setData({ ...data, cards: newCards });
                                }} 
                                onPersist={persistCardImage(index)}
                            />
                        </div>
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
            <button className="btn btn-primary me-2" onClick={addCard}>Add Product</button>
            <button className="btn btn-success" onClick={handleSave}>Save Changes</button>
        </div>
    );
};

export default ProductsEditor;
