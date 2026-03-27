import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import UploadCard from '../components/UploadCard';
import ResultCard from '../components/ResultCard';

const DetectionPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    setResult(null);

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Ukuran file terlalu besar! Maksimal 10MB.");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
      setError("Format file tidak didukung. Harap gunakan JPG atau PNG.");
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
        throw new Error(data.detail || "Terjadi kesalahan pada server");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          Portal <span className="text-gradient">Deteksi</span>
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
          Unggah citra fundus retina Anda untuk mendapatkan analisis langsung.
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
              <div className="error-banner fade-in">
                <AlertCircle size={20} />
                <span>{error}</span>
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
                      <span>Menganalisis Citra...</span>
                    </div>
                  ) : (
                    "Analisis Citra Sekarang"
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
