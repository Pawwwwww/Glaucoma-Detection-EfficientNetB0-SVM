import { CheckCircle, AlertTriangle, RefreshCw, BarChart3, Activity } from 'lucide-react';

const ResultCard = ({ result, originalImage, onReset }) => {
  const isGonPlus = result.label === "GON+";
  const mainColor = isGonPlus ? "var(--danger)" : "var(--success)";
  const bgWarning = isGonPlus ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)";

  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '50%',
          background: bgWarning,
          marginBottom: '1rem'
        }}>
          {isGonPlus ? <AlertTriangle size={48} color={mainColor} /> : <CheckCircle size={48} color={mainColor} />}
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Diagnosis: <span style={{ color: mainColor }}>{result.label}</span>
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Quality Score (QS): {result.quality_score} / 10</p>
      </div>

      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Images */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Citra Asli</p>
            <img
              src={originalImage}
              alt="Original"
              style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
            />
          </div>
          {result.gradcam_image && (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Area Perhatian (Grad-CAM)</p>
              <img
                src={`data:image/jpeg;base64,${result.gradcam_image}`}
                alt="Grad-CAM"
                style={{ width: '100%', borderRadius: '12px', border: `2px solid ${mainColor}` }}
              />
            </div>
          )}
        </div>

        {/* Metrics & Recommendation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BarChart3 color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem' }}>Metrik Deteksi</h3>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Confidence ({result.label})</span>
                <span style={{ fontWeight: 600 }}>{result.confidence}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${result.confidence}%`, height: '100%', background: mainColor, borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Probabilitas GON+</span>
                <span style={{ fontWeight: 600 }}>{result.prob_gon_plus}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${result.prob_gon_plus}%`, height: '100%', background: 'var(--danger)', borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Probabilitas GON-</span>
                <span style={{ fontWeight: 600 }}>{result.prob_gon_minus}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${result.prob_gon_minus}%`, height: '100%', background: 'var(--success)', borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: bgWarning, borderColor: `rgba(${isGonPlus ? '239, 68, 68' : '16, 185, 129'}, 0.3)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Activity color={mainColor} />
              <h3 style={{ fontSize: '1.25rem', color: mainColor }}>Rekomendasi</h3>
            </div>
            <p style={{ lineHeight: 1.6 }}>{result.saran}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={onReset}>
          <RefreshCw size={20} />
          <span>Analisis Citra Baru</span>
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
