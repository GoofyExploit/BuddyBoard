import { PenLine, ArrowRight, Sparkles, Layers, Lock, Zap, Cloud, Palette, Search } from "lucide-react";
import styles from "../css/Landing.module.css";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Your notes sync instantly across all devices. No loading, no waiting.",
  },
  {
    icon: Layers,
    title: "Organized by Design",
    description: "Nested folders, tags, and smart categories keep everything in its place.",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "End-to-end encryption ensures your thoughts stay yours alone.",
  },
  {
    icon: Cloud,
    title: "Always Backed Up",
    description: "Never lose a word. Automatic cloud backup with version history.",
  },
  {
    icon: Palette,
    title: "Beautiful Themes",
    description: "Customize your workspace with elegant themes and typography.",
  },
  {
    icon: Search,
    title: "Instant Search",
    description: "Find any note in milliseconds with powerful full-text search.",
  },
];

const Landing = () => {
  return (
    <div className={styles.page}>
      {/* Announcement Banner */}
      <div className={styles.banner}>
        <Sparkles className={styles.bannerIcon} />
        <span>New: AI-powered organization is here!</span>
      </div>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <PenLine className={styles.logoSvg} />
            </div>
            <span className={styles.logoText}>BuddyBoard</span>
          </div>
          
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>What's New</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
            <a href="#about" className={styles.navLink}>Blog</a>
            <a href="#help" className={styles.navLink}>Help</a>
          </div>

          <div className={styles.navActions}>
            <button className={styles.btnGhost}>Log in</button>
            <button className={styles.btnPrimary}>Go to BuddyBoard</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Better Notes. <span className={styles.heroHighlight}>Beyond Paper.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The Unparalleled Writing Experience.
          </p>
          <p className={styles.heroTagline}>
            Now with <strong>collaboration</strong>.
          </p>

          <div className={styles.heroCtas}>
            <button className={styles.btnPrimary}>
              Start Writing Free
              <ArrowRight className={styles.btnIcon} />
            </button>
            <button className={styles.btnOutline}>
              See how it works
            </button>
          </div>

          <div className={styles.socialProof}>
            <span className={styles.proofText}>Trusted by 10K+ writers worldwide</span>
          </div>
        </div>

        {/* App Preview */}
        <div className={styles.previewContainer}>
          <div className={styles.previewCard}>
            <div className={styles.previewDots}>
              <span className={styles.dotRed}></span>
              <span className={styles.dotYellow}></span>
              <span className={styles.dotGreen}></span>
            </div>
            <div className={styles.previewContent}>
              <div className={styles.previewTitle}></div>
              <div className={styles.previewLine}></div>
              <div className={styles.previewLine}></div>
              <div className={styles.previewLine}></div>
              <div className={styles.previewLineShort}></div>
              <div className={styles.previewGrid}>
                <div className={styles.previewBlock}></div>
                <div className={styles.previewBlock}></div>
                <div className={styles.previewBlock}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Crafted for clarity</h2>
            <p className={styles.sectionSubtitle}>
              Every feature designed to help you think better, write faster, and stay organized.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <feature.icon className={styles.featureSvg} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to write?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of writers and thinkers who've made BuddyBoard their home for ideas.
          </p>
          <button className={styles.btnPrimary}>
            Get Started — It's Free
            <ArrowRight className={styles.btnIcon} />
          </button>
          <p className={styles.ctaNote}>
            No credit card required • Free forever for personal use
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.logo}>
            <div className={styles.logoIconSmall}>
              <PenLine className={styles.logoSvgSmall} />
            </div>
            <span className={styles.logoTextSmall}>BuddyBoard</span>
          </div>
          
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>Privacy</a>
            <a href="#" className={styles.footerLink}>Terms</a>
            <a href="#" className={styles.footerLink}>Contact</a>
          </div>
          
          <p className={styles.copyright}>© 2026 BuddyBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
