import React, { useState } from 'react';
import { createImage, updateImage } from '../../services/api';

const ImageUploader = ({ currentImage, currentImageId, onUpload, label, onPersist }) => {
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            let data;
            if (currentImageId) {
                const res = await updateImage(currentImageId, formData);
                data = res.data;
            } else {
                const res = await createImage(formData);
                data = res.data;
            }
            onUpload(data.imageUrl, data.id);
            if (onPersist) {
                setSaving(true);
                try {
                    await onPersist(data.imageUrl, data.id);
                } finally {
                    setSaving(false);
                }
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mb-3">
            <label className="form-label">{label}</label>
            <div className="d-flex align-items-center gap-3">
                {currentImage && (
                    <img src={currentImage} alt="Preview" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                )}
                <input type="file" className="form-control" onChange={handleFileChange} />
                {uploading && <span className="spinner-border spinner-border-sm"></span>}
                {saving && <span className="spinner-border spinner-border-sm text-success"></span>}
            </div>
        </div>
    );
};

export default ImageUploader;
