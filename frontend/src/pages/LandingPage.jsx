import { Link } from 'react-router-dom';
import { Eye, ShieldAlert, Activity, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="page-container container fade-in">
      <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center', marginTop: '6rem', marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', borderRadius: '50%', marginBottom: '2rem' }}>
          <Eye size={64} className="text-gradient" />
        </div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          Early Detection of <span className="text-gradient">Glaucoma</span><br />with High Precision AI
        </h1>

        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '3rem' }}>
          Glaucomatous Optic Neuropathy (GON) is the leading cause of irreversible blindness. Perform the check below.
        </p>

        <Link to="/detect" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.25rem' }}>
            Start Check Now
            <ArrowRight size={24} />
          </button>
        </Link>
      </div>

      <div className="grid-2" style={{ marginTop: '2rem', paddingBottom: '6rem' }}>
        <div className="glass-panel hover-cyber" style={{ padding: '2.5rem' }}>
          <ShieldAlert size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>What is GON?</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Glaucomatous Optic Neuropathy is optic nerve damage caused by high intraocular pressure. Early detection is crucial because vision loss due to glaucoma is irreversible, but it can be prevented from worsening.
          </p>
        </div>

        <div className="glass-panel hover-cyber" style={{ padding: '2.5rem' }}>
          <Activity size={48} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Our Technology</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Our model is trained using the extensive Hillel Yaffe Glaucoma Dataset (HYGD). The system is equipped with an intelligent Quality-Aware Modeling detection to ensure diagnostic results remain highly accurate and precise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
