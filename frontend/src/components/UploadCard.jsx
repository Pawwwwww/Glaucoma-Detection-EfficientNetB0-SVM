import React, { useRef } from 'react';
import { UploadCloud, X, FileImage, Image as ImageIcon } from 'lucide-react';

const UploadCard = ({ file, preview, onSelect, onClear }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelect(e.target.files[0]);
    }
  };

  if (file && preview) {
    return (
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
        <img 
          src={preview} 
          alt="Preview" 
          style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', background: 'rgba(0,0,0,0.5)', display: 'block' }} 
        />
        <div style={{ padding: '0.75rem 1rem', background: 'var(--glass-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileImage size={24} color="var(--primary)" />
            <div>
              <p style={{ fontWeight: 500, margin: 0 }}>{file.name}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button 
            onClick={onClear}
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: 'none', 
              color: 'var(--danger)',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="upload-area" 
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg, image/png, image/jpg" 
        style={{ display: 'none' }} 
      />
      <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
          <UploadCloud size={48} color="var(--primary)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Fundus Image</h3>
          <p style={{ color: 'var(--text-muted)' }}>Click or drag file to this area</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>PNG, JPG (Max. 10MB)</p>
        </div>
      </div>
    </div>
  );
};

export default UploadCard;
