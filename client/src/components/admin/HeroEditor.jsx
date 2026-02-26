import React, { useState, useEffect } from 'react';
import { getContentByKey, updateContent } from '../../services/api';
import ImageUploader from './ImageUploader';

const HeroEditor = () => {
    const [data, setData] = useState({
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        main1: '',
        main2: '',
        main3: '',
        main1Id: '',
        main2Id: '',
        main3Id: '',
        partnerText: '',
        partnerLogos: []
    });

    const loadData = async () => {
        try {
            const res = await getContentByKey('hero');
            if (res.data && res.data.value) setData(res.data.value);
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
            await updateContent({ key: 'hero', value: data });
            alert('Hero section saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };
    const persistMainImage = (field) => async (url, id) => {
        const idField = `${field}Id`;
        const next = { ...data, [field]: url, [idField]: id };
        setData(next);
        await updateContent({ key: 'hero', value: next });
        alert('Hero image saved!');
    };

    const addPartnerLogo = (url) => {
        setData({ ...data, partnerLogos: [...data.partnerLogos, url] });
    };

    const removePartnerLogo = (index) => {
        const newLogos = data.partnerLogos.filter((_, i) => i !== index);
        setData({ ...data, partnerLogos: newLogos });
    };

    return (
        <div>
            <h3>Hero Section</h3>
            <div className="mb-3">
                <label>Title</label>
                <input
                    className="form-control"
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                />
            </div>
            <div className="mb-3">
                <label>Subtitle</label>
                <textarea
                    className="form-control"
                    value={data.subtitle}
                    onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                />
            </div>

            <div className="row mb-3">
                <div className="col-md-6">
                    <label>Button Text</label>
                    <input
                        className="form-control"
                        value={data.buttonText || ''}
                        onChange={(e) => setData({ ...data, buttonText: e.target.value })}
                    />
                </div>
                <div className="col-md-6">
                    <label>Button Link</label>
                    <input
                        className="form-control"
                        value={data.buttonLink || ''}
                        onChange={(e) => setData({ ...data, buttonLink: e.target.value })}
                    />
                </div>
            </div>
            
            <div className="row">
                <div className="col-md-4">
                    <ImageUploader 
                        label="Main Image 1" 
                        currentImage={data.main1}
                        currentImageId={data.main1Id}
                        onUpload={(url, id) => setData({ ...data, main1: url, main1Id: id })} 
                        onPersist={persistMainImage('main1')}
                    />
                </div>
                <div className="col-md-4">
                    <ImageUploader 
                        label="Main Image 2" 
                        currentImage={data.main2}
                        currentImageId={data.main2Id}
                        onUpload={(url, id) => setData({ ...data, main2: url, main2Id: id })} 
                        onPersist={persistMainImage('main2')}
                    />
                </div>
                <div className="col-md-4">
                    <ImageUploader 
                        label="Main Image 3" 
                        currentImage={data.main3}
                        currentImageId={data.main3Id}
                        onUpload={(url, id) => setData({ ...data, main3: url, main3Id: id })} 
                        onPersist={persistMainImage('main3')}
                    />
                </div>
            </div>

            <div className="mb-3 mt-4">
                <label>Partner Text</label>
                <input
                    className="form-control"
                    value={data.partnerText || ''}
                    onChange={(e) => setData({ ...data, partnerText: e.target.value })}
                />
            </div>

            <h4>Partner Logos</h4>
            <div className="d-flex flex-wrap gap-2 mb-3">
                {data.partnerLogos.map((logo, index) => (
                    <div key={index} className="position-relative">
                        <img src={logo} alt="Partner" style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid #ddd' }} />
                        <button 
                            className="btn btn-danger btn-sm position-absolute top-0 end-0"
                            onClick={() => removePartnerLogo(index)}
                        >x</button>
                    </div>
                ))}
            </div>
            <ImageUploader label="Add Partner Logo" onUpload={addPartnerLogo} />

            <button className="btn btn-success mt-3" onClick={handleSave}>Save Changes</button>
        </div>
    );
};

export default HeroEditor;
