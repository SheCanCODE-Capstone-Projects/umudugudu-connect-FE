'use client';

const TRANSLATIONS = {
  EN: {
    desc: 'Digitizing village governance in Rwanda — connecting citizens, leaders, and administrators for better service delivery.',
    columns: [
      { title: 'Services', links: ['Umuganda', 'Imihigo', 'Ubudehe', 'Emergency', 'Ibimina'] },
      { title: 'Support',  links: ['Help Center', 'Contact Us', 'SMS Support', 'FAQ'] },
      { title: 'Legal',    links: ['Privacy Policy', 'Terms of Use', 'Accessibility'] },
    ],
    rights: '© 2026 Umudugudu Connect. Republic of Rwanda. All rights reserved.',
    made:   '🇷🇼 Made in Rwanda',
  },
  RW: {
    desc: 'Gukoresha ikoranabuhanga mu buyobozi bw\'imidugudu mu Rwanda — guhuza abaturage, abayobozi, n\'inzego z\'ubuyobozi.',
    columns: [
      { title: 'Serivisi',  links: ['Umuganda', 'Imihigo', 'Ubudehe', 'Ibyihutirwa', 'Ibimina'] },
      { title: 'Inkunga',   links: ['Ikiganiro cy\'Ubufasha', 'Twandikire', 'Ubufasha bwa SMS', 'Ibibazo bikunze'] },
      { title: 'Amategeko', links: ['Politiki y\'Ubuzima bw\'Amakuru', 'Amategeko y\'Ikoreshwa', 'Ibyoroshya'] },
    ],
    rights: '© 2026 Umudugudu Connect. Repubulika y\'u Rwanda. Uburenganzira bwose bwihariwe.',
    made:   '🇷🇼 Byakozwe mu Rwanda',
  },
  FR: {
    desc: 'Numérisation de la gouvernance villageoise au Rwanda — connectant citoyens, dirigeants et administrateurs.',
    columns: [
      { title: 'Services', links: ['Umuganda', 'Imihigo', 'Ubudehe', 'Urgence', 'Ibimina'] },
      { title: 'Support',  links: ['Centre d\'Aide', 'Contactez-nous', 'Support SMS', 'FAQ'] },
      { title: 'Légal',    links: ['Politique de Confidentialité', 'Conditions d\'Utilisation', 'Accessibilité'] },
    ],
    rights: '© 2026 Umudugudu Connect. République du Rwanda. Tous droits réservés.',
    made:   '🇷🇼 Fabriqué au Rwanda',
  },
};

type Lang = 'EN' | 'RW' | 'FR';

export const Footer = ({ lang }: { lang: Lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer style={{ backgroundColor: '#002D1A', padding: '48px 32px 24px' }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '32px', marginBottom: '40px'
      }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #006B3F, #00A86B)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px'
            }}>🏘️</div>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
              Umudugudu Connect
            </span>
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '13px',
            lineHeight: '1.7', margin: '0 0 16px'
          }}>{t.desc}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['📘', '🐦', '📸'].map((icon, i) => (
              <div key={i} style={{
                width: '32px', height: '32px', borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '16px', cursor: 'pointer'
              }}>{icon}</div>
            ))}
          </div>
        </div>

        {/* Links */}
        {t.columns.map((col, i) => (
          <div key={i}>
            <div style={{
              color: 'white', fontWeight: '600',
              fontSize: '14px', marginBottom: '16px'
            }}>{col.title}</div>
            {col.links.map(link => (
              <div key={link} style={{ marginBottom: '10px' }}>
                <a href="#" style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '13px', textDecoration: 'none'
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#7FFFC4')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >{link}</a>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '1100px', margin: '0 auto'
      }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
          {t.rights}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
          {t.made}
        </span>
      </div>
    </footer>
  );
};