const TRANSLATIONS = {
  EN: {
    title: 'Our Impact',
    stats: [
      { number: '15K+', label: 'Registered Citizens' },
      { number: '500+', label: 'Villages Connected' },
      { number: '98%',  label: 'Service Availability' },
      { number: '2min', label: 'Average Response Time' },
    ],
  },
  RW: {
    title: 'Ingaruka Zacu',
    stats: [
      { number: '15K+', label: 'Abaturage Biyandikishije' },
      { number: '500+', label: 'Imidugudu Ihujwe' },
      { number: '98%',  label: 'Imikorere ya Serivisi' },
      { number: '2min', label: 'Igihe cyo Gusubiza' },
    ],
  },
  FR: {
    title: 'Notre Impact',
    stats: [
      { number: '15K+', label: 'Citoyens Enregistrés' },
      { number: '500+', label: 'Villages Connectés' },
      { number: '98%',  label: 'Disponibilité des Services' },
      { number: '2min', label: 'Temps de Réponse Moyen' },
    ],
  },
};

type Lang = 'EN' | 'RW' | 'FR';

export const StatsBar = ({ lang }: { lang: Lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div style={{
      backgroundColor: 'white', padding: '24px 32px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        maxWidth: '900px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px'
      }}>
        {t.stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#006B3F' }}>{s.number}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};