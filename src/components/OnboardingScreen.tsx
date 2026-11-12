import { useOnboarding } from './onboarding/useOnboarding';
import { HookStep } from './onboarding/HookStep';
import { HomeCountryStep } from './onboarding/HomeCountryStep';
import { VisitedStep } from './onboarding/VisitedStep';
import { PayoffStep } from './onboarding/PayoffStep';
import { AuthStep } from './onboarding/AuthStep';
import { OnboardingScreenProps } from './onboarding/shared';

export default function OnboardingScreen({ onComplete, t, currentLang = 'tr', onToggleLang }: OnboardingScreenProps) {
  const ctx = useOnboarding({ onComplete, t, currentLang, onToggleLang });
  const { step } = ctx;

  if (step === 1) return <HookStep ctx={ctx} />;

  // ══════════════════════════════════════════════════════════════════════
  // STEP 2: MEMLEKET SEÇİMİ (HOME BASE)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 2) return <HomeCountryStep ctx={ctx} />;

  // ══════════════════════════════════════════════════════════════════════
  // STEP 3: HIZLI DOLDURMA (GEZDİĞİN ÜLKELER)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 3) return <VisitedStep ctx={ctx} />;

  // ══════════════════════════════════════════════════════════════════════
  // STEP 4: SONUÇ & ROZET AÇILIŞI (THE DOPAMINE PAYOFF)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 4) return <PayoffStep ctx={ctx} />;

  // ══════════════════════════════════════════════════════════════════════
  // STEP 6: HESAP OLUŞTURMA & PASAPORTU KAYDET (SAVE PASSPORT)
  // ══════════════════════════════════════════════════════════════════════
  if (step === 6) return <AuthStep ctx={ctx} />;

  return null;
}
