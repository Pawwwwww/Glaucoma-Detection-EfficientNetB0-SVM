import { Link } from 'react-router-dom';
import { Eye, ShieldAlert, Activity, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="page-container container fade-in">
      <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center', marginTop: '4rem', marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', borderRadius: '50%', marginBottom: '2rem' }}>
          <Eye size={64} className="text-gradient" />
        </div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          Deteksi Dini <span className="text-gradient">Glaukoma</span><br />dengan AI Presisi Tinggi
        </h1>

        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '3rem' }}>
          Glaucomatous Optic Neuropathy (GON) adalah penyebab utama kebutaan ireversibel. Sistem kami menggunakan model Convolutional Neural Network (EfficientNet) & SVM untuk analisis citra fundus retina secara instan dan akurat.
        </p>

        <Link to="/detect" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.25rem' }}>
            Mulai Deteksi Sekarang
            <ArrowRight size={24} />
          </button>
        </Link>
      </div>

      <div className="grid-2" style={{ marginTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <ShieldAlert size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Apa itu GON?</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Glaucomatous Optic Neuropathy adalah kerusakan saraf optik akibat tekanan intraokular yang tinggi. Deteksi dini sangat krusial karena kerusakan saraf mata akibat glaukoma tidak dapat disembuhkan, namun dapat dicegah agar tidak memburuk.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <Activity size={48} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Teknologi Kami</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Model kami dilatih menggunakan Hillel Yaffe Glaucoma Dataset (HYGD) yang ekstensif. Sistem dilengkapi deteksi kualitas gambar cerdas (Quality-Aware Modeling) untuk memastikan hasil diagnosis tetap sangat akurat dan presisi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
