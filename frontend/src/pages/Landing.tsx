import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Database, Search, FileText } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagicRings from '../components/ui/MagicRings';
import Doc2DigitalLogo from '../components/ui/Doc2DigitalLogo';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Hero GSAP Animation
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2 })
      .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '-=0.6')
      .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .fromTo('.hero-actions', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .fromTo('.hero-visual', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2 }, '-=0.4');

    // Scroll GSAP Animations
    gsap.utils.toArray('.scroll-fade').forEach((element: any) => {
      gsap.fromTo(element,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Abstract Grid Background */}
      <div className="landing-bg-grid" />

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="sidebar-brand" style={{ border: 'none', padding: 0 }}>
            <div className="sidebar-logo">
              <Doc2DigitalLogo size={20} color="#5a9e6f" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Doc2Digital</span>
            </div>
          </div>
          <div className="landing-nav-links">
            <a href="#platform">Platform</a>
            <a href="#technology">Technology</a>
            <a href="#security">Security</a>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/app/overview')}>
            Explore Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Magic Rings Dynamic Background */}
        <div className="hero-rings-backdrop" aria-hidden="true">
          <MagicRings
            color="#ffffff"
            colorTwo="#f8fafc"
            ringCount={6}
            speed={0.85}
            attenuation={14}
            lineThickness={2}
            baseRadius={0.38}
            radiusStep={0.11}
            scaleRate={0.08}
            opacity={0.8}
            blur={0}
            noiseAmount={0.03}
            rotation={0}
            ringGap={1.45}
            fadeIn={0.7}
            fadeOut={0.5}
            followMouse={true}
            mouseInfluence={0.25}
            hoverScale={1.15}
            parallax={0.05}
            clickBurst={true}
          />
        </div>

        <div className="hero-content">
          <div className="hero-badge">AI-POWERED LAND RECORD INTELLIGENCE</div>
          <h1 className="hero-title">
            Turn legacy land records into trusted digital data.
          </h1>
          <p className="hero-desc">
            Doc2Digital uses OCR, Computer Vision, NLP and intelligent validation to transform scanned, handwritten and historical land records into accurate, searchable and interoperable digital records.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/app/overview')}>
              Explore Platform <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary btn-lg">
              See how it works
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="hero-visual">
          <div className="hero-visual-container glass">
            {/* Left: Document */}
            <div className="hero-visual-col doc-col">
              <div className="hero-visual-header">Historical Record</div>
              <div className="doc-sim-mini">
                <div className="doc-header-row">
                  <div className="doc-stamp" />
                  <div className="doc-title-line" style={{ width: 120 }} />
                </div>
                <div className="doc-text-line" style={{ width: '80%', opacity: 0.3 }} />
                <div className="doc-text-line" style={{ width: '60%', opacity: 0.3 }} />
                <div className="ocr-box-sim active" style={{ top: '40%', height: 24 }} />
                <div className="doc-text-line" style={{ width: '90%', opacity: 0.3 }} />
                <div className="ocr-box-sim" style={{ top: '60%', height: 24 }} />
                <div className="doc-text-line" style={{ width: '70%', opacity: 0.3 }} />
              </div>
            </div>

            {/* Center: Processing */}
            <div className="hero-visual-center">
              <div className="processing-line" />
              <div className="processing-nodes">
                <div className="node active">OCR</div>
                <div className="node active">NLP</div>
                <div className="node active">Validation</div>
              </div>
            </div>

            {/* Right: Data */}
            <div className="hero-visual-col data-col">
              <div className="hero-visual-header">Structured Data</div>
              <div className="data-sim-mini">
                <div className="data-row-sim">
                  <span>Owner</span>
                  <span className="text-primary">Rajendra Patil</span>
                </div>
                <div className="data-row-sim">
                  <span>Survey No.</span>
                  <span className="text-accent">124/3A</span>
                </div>
                <div className="data-row-sim">
                  <span>Area</span>
                  <span className="text-primary">2.48 ha</span>
                </div>
                <div className="data-row-sim">
                  <span>Status</span>
                  <span className="badge badge-verified">Verified</span>
                </div>
                <div className="data-row-sim">
                  <span>Confidence</span>
                  <span className="text-accent">98.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section scroll-fade" id="platform">
        <div className="section-container">
          <h2 className="section-heading text-center">Enterprise-grade extraction pipeline.</h2>

          <div className="features-grid">
            <div className="feature-card glass">
              <FileText className="feature-icon" />
              <h3>Document Intelligence</h3>
              <p>Advanced Computer Vision models trained on historical Indian land records. Automatically detects layout, tables, signatures, and seals across varying document qualities.</p>
            </div>

            <div className="feature-card glass">
              <Search className="feature-icon" />
              <h3>Handwriting & OCR</h3>
              <p>State-of-the-art TrOCR and PaddleOCR pipelines optimized for major Indian languages including Marathi, Hindi, and Tamil, handling cursive and degraded text.</p>
            </div>

            <div className="feature-card glass">
              <Database className="feature-icon" />
              <h3>Entity Extraction</h3>
              <p>IndicBERT-powered NLP accurately identifies owners, survey numbers, areas, and relationships, mapping unstructured text to a standardized cadastral schema.</p>
            </div>

            <div className="feature-card glass">
              <ShieldCheck className="feature-icon" />
              <h3>Automated Validation</h3>
              <p>Extracted data is instantly cross-referenced against spatial databases, format rules, and existing registries to flag anomalies before human verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section scroll-fade">
        <div className="cta-box glass">
          <h2>Ready to digitize your jurisdiction?</h2>
          <p>Experience the precision and speed of Doc2Digital.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/app/overview')}>
            Enter Platform <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="sidebar-brand" style={{ border: 'none', padding: 0 }}>
            <div className="sidebar-logo">
              <Doc2DigitalLogo size={18} color="#5a9e6f" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Doc2Digital</span>
            </div>
          </div>
          <div className="footer-links">
            <span>© 2026 Doc2Digital GovTech. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
