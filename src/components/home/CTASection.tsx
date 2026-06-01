'use client';

import { useRouter } from 'next/navigation';

const TRANSLATIONS = {
  EN: {
    badge:    '🏘️ Join your community today',
    title:    'Ready to get started?',
    subtitle: 'Join thousands of Rwandan citizens already using Umudugudu Connect to access village services digitally.',
    create:   'Create Account',
    signin:   'Sign In',
    sms:      '📱 Also accessible via SMS for low-connectivity areas',
  },
  RW: {
    badge:    '🏘️ Injira mu muryango wawe uyu munsi',
    title:    'Witeguye gutangira?',
    subtitle: 'Injira mu bihumbi by\'abaturage b\'u Rwanda bakoresha Umudugudu Connect kugera ku serivisi z\'umudugudu.',
    create:   'Fungura Konti',
    signin:   'Injira',
    sms:      '📱 Nabwo iraboneka kuri SMS ku turere dufite ibibazo by\'itumanaho',
  },
  FR: {
    badge:    '🏘️ Rejoignez votre communauté aujourd\'hui',
    title:    'Prêt à commencer?',
    subtitle: 'Rejoignez des milliers de citoyens rwandais qui utilisent déjà Umudugudu Connect pour accéder aux services villageois.',
    create:   'Créer un Compte',
    signin:   'Se Connecter',
    sms:      '📱 Également accessible par SMS pour les zones à faible connectivité',
  },
};

type Lang = 'EN' | 'RW' | 'FR';

export const CTASection = ({ lang }: { lang: Lang }) => {
  const router = useRouter();
  const t = TRANSLATIONS[lang];

  return (
    <div style={{ backgroundColor: '#f0f9f4', padding: '60px 32px', textAlign: 'center' }}>

      <div style={{
        display: 'inline-block', backgroundColor: '#d1fae5',
        color: '#006B3F', padding: '6px 16px', borderRadius: '20px',
        fontSize: '13px', fontWeight: '600', marginBottom: '20px'
      }}>
        {t.badge}
      </div>

      <h2 style={{
        fontSize: '32px', color: '#004D2E',
        marginBottom: '12px', marginTop: 0
      }}>
        {t.title}
      </h2>

      <p style={{
        color: '#6b7280', fontSize: '16px',
        marginBottom: '32px', maxWidth: '500px',
        margin: '0 auto 32px', lineHeight: '1.6'
      }}>
        {t.subtitle}
      </p>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button
          onClick={() => router.push('/auth/register')}
          style={{
            backgroundColor: '#006B3F', color: 'white',
            border: 'none', borderRadius: '10px',
            padding: '14px 32px', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,107,63,0.3)'
          }}
        >{t.create}</button>
        <button
          onClick={() => router.push('/auth/login')}
          style={{
            backgroundColor: 'white', color: '#006B3F',
            border: '2px solid #006B3F', borderRadius: '10px',
            padding: '14px 32px', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer'
          }}
        >{t.signin}</button>
      </div>

      <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '20px', marginBottom: 0 }}>
        {t.sms}
      </p>
    </div>
  );
};