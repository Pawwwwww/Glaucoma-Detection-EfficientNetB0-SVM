import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import UploadCard from '../components/UploadCard';
import ResultCard from '../components/ResultCard';

const DetectionPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [result, setResult] = useState(null);

  const showError = (message) => {
    setError(message);
    setErrorVisible(true);
    setTimeout(() => {
      setErrorVisible(false);
      setTimeout(() => setError(null), 400); // Wait for exit animation
    }, 3000);
  };

  const handleFileSelect = (selectedFile) => {
    setError(null);
    setResult(null);

    if (selectedFile.size > 10 * 1024 * 1024) {
      showError("File size is too large! Maximum 10MB.");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
      showError("Unsupported file format. Please use JPG or PNG.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Server error occurred");
      }

      setResult(data);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container fade-in" style={{ paddingBottom: '1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', marginTop: '6.5rem', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', textAlign: 'center' }}>
          Detection <span className="text-gradient">Portal</span>
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Upload your retinal fundus image for instant analysis.
        </p>

        {!result ? (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <UploadCard
              file={file}
              preview={preview}
              onSelect={handleFileSelect}
              onClear={clearSelection}
            />

            {error && (
              <div style={{
                position: 'fixed',
                top: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                background: 'rgba(239, 68, 68, 0.15)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.3)',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#fca5a5',
                animation: errorVisible 
                  ? 'slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                  : 'slideUpFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}>
                <AlertCircle size={24} />
                <span style={{ fontWeight: 500, letterSpacing: '0.02em' }}>{error}</span>
              </div>
            )}

            {file && (
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                >
                  {loading ? (
                    <div className="flex-center" style={{ gap: '0.5rem' }}>
                      <div className="spinner"></div>
                      <span>Analyzing Image...</span>
                    </div>
                  ) : (
                    "Analyze Image Now"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <ResultCard result={result} onReset={clearSelection} originalImage={preview} />
        )}
      </div>
    </div>
  );
};

export default DetectionPage;
