import { CheckCircle, AlertTriangle, RefreshCw, BarChart3, Activity } from 'lucide-react';

const ResultCard = ({ result, originalImage, onReset }) => {
  const isGonPlus = result.label === "GON+";
  const mainColor = isGonPlus ? "var(--danger)" : "var(--success)";
  const bgWarning = isGonPlus ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)";

  return (
    <div className="glass-panel fade-in" style={{ padding: '1.25rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          borderRadius: '50%',
          background: bgWarning,
          marginBottom: '0.25rem'
        }}>
          {isGonPlus ? <AlertTriangle size={24} color={mainColor} /> : <CheckCircle size={24} color={mainColor} />}
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0' }}>
          Prediction: <span style={{ color: mainColor }}>{result.label}</span>
        </h2>
      </div>

      <div className="grid-2" style={{ marginBottom: '1rem', gap: '1rem' }}>
        {/* Images - Side by side horizontally */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Original Image</p>
            <img
              src={originalImage}
              alt="Original"
              style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
            />
          </div>
          {result.gradcam_image && (
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Attention Area</p>
              <img
                src={`data:image/jpeg;base64,${result.gradcam_image}`}
                alt="Grad-CAM"
                style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: `2px solid ${mainColor}` }}
              />
            </div>
          )}
        </div>

          {/* Metrics */}
          <div style={{ display: 'flex', marginTop: '1rem' }}>
            <div className="glass-panel" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <BarChart3 color="var(--primary)" size={16} />
                <h3 style={{ fontSize: '0.9rem' }}>Detection Metrics</h3>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Confidence ({result.label})</span>
                  <span style={{ fontWeight: 600 }}>{result.confidence}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${result.confidence}%`, height: '100%', background: mainColor, borderRadius: '3px' }}></div>
                </div>
              </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Probability GON+</span>
                <span style={{ fontWeight: 600 }}>{result.prob_gon_plus}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${result.prob_gon_plus}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Probability GON-</span>
                <span style={{ fontWeight: 600 }}>{result.prob_gon_minus}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${result.prob_gon_minus}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation - Centered Bottom */}
      <div className="glass-panel" style={{ padding: '0.75rem 1rem', background: bgWarning, borderColor: `rgba(${isGonPlus ? '239, 68, 68' : '16, 185, 129'}, 0.3)`, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Activity color={mainColor} size={16} />
          <h3 style={{ fontSize: '0.9rem', color: mainColor }}>Recommendation</h3>
        </div>
        <p style={{ lineHeight: 1.3, fontSize: '0.8rem', margin: 0 }}>{result.saran}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <button className="btn-secondary" onClick={onReset}>
          <RefreshCw size={16} />
          <span style={{ fontSize: '0.9rem' }}>Analyze New Image</span>
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
