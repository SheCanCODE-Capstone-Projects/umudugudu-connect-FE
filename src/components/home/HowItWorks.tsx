const TRANSLATIONS = {
  EN: {
    tag:   'HOW IT WORKS',
    title: 'Simple. Fast. Transparent.',
    steps: [
      { step: '01', title: 'Register',        desc: 'Enter your phone number and verify with a one-time password sent via SMS' },
      { step: '02', title: 'Access Services', desc: 'Navigate to the service you need from your role-based dashboard' },
      { step: '03', title: 'Submit & Track',  desc: 'Submit requests and track their status in real time with notifications' },
    ],
  },
  RW: {
    tag:   'UBURYO BIKORA',
    title: 'Byoroshye. Byihuse. Bisobanutse.',
    steps: [
      { step: '01', title: 'Iyandikishe',      desc: 'Injiza nimero ya telefoni yawe hanyuma ugenzure ukoresheje code yoherezwa kuri SMS' },
      { step: '02', title: 'Injira Serivisi',  desc: 'Genda kuri serivisi ukeneye ukoresheje dashboard yawe' },
      { step: '03', title: 'Ohereza & Kurikirana', desc: 'Ohereza ibisabwa ukurikire imimerere yazo mu gihe nyacyo' },
    ],
  },
  FR: {
    tag:   'COMMENT ÇA MARCHE',
    title: 'Simple. Rapide. Transparent.',
    steps: [
      { step: '01', title: 'S\'inscrire',       desc: 'Entrez votre numéro de téléphone et vérifiez avec un mot de passe envoyé par SMS' },
      { step: '02', title: 'Accéder aux Services', desc: 'Naviguez vers le service dont vous avez besoin depuis votre tableau de bord' },
      { step: '03', title: 'Soumettre & Suivre', desc: 'Soumettez des demandes et suivez leur statut en temps réel avec des notifications' },
    ],
  },
};

type Lang = 'EN' | 'RW' | 'FR';

export const HowItWorks = ({ lang }: { lang: Lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div style={{ backgroundColor: '#004D2E', padding: '60px 32px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            color: '#7FFFC4', fontSize: '13px',
            fontWeight: '600', letterSpacing: '2px', marginBottom: '8px'
          }}>{t.tag}</div>
          <h2 style={{ fontSize: '32px', color: 'white', margin: 0 }}>
            {t.title}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {t.steps.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                backgroundColor: 'rgba(127,255,196,0.15)',
                border: '2px solid #7FFFC4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '18px', fontWeight: 'bold', color: '#7FFFC4'
              }}>{s.step}</div>
              <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px', marginTop: 0 }}>
                {s.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};