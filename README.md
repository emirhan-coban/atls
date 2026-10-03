# atls. — Your World Passport (React Native / iOS)

**atls.** seyahat pasaportu uygulaması, **Fremd.** uygulamasının modern, yüksek kontrastlı ve neo-estetik tasarım diliyle kişisel dünya seyahat pasaportu deneyiminin birleşimidir.

Uygulama, iPhone ve iOS App Store'da yayınlanmaya hazır şekilde **React Native & Expo (iOS Native Pods + Xcode Workspace)** altyapısıyla geliştirilmiştir.

---

## 📱 iPhone'da Çalıştırma Seçenekleri

### 1. Fiziksel iPhone'da Hemen Test Etmek İçin (En Hızlı Yöntem):
1. iPhone'unuza App Store'dan **Expo Go** uygulamasını yükleyin.
2. Terminalden projeye gidin ve başlatın:
   ```bash
   cd /Users/emirhan/Desktop/codebase/atls
   npx expo start
   ```
3. Terminalde beliren **QR Kodunu** iPhone kameranızla tarayın. Uygulama anında telefonunuzda açılacaktır.

---

### 2. Mac iOS Simülatöründe Çalıştırmak İçin:
```bash
cd /Users/emirhan/Desktop/codebase/atls
npx expo run:ios
```

---

### 3. Apple App Store'a Göndermek İçin (EAS Build):
Projede `app.json` ve `eas.json` yapılandırmaları App Store için hazırlandı:
- **Bundle ID:** `com.atls.passport`
- **Display Name:** `atls.`
- **Version:** `1.0.0 (Build 1)`
- **ITSAppUsesNonExemptEncryption:** `false` (Ek evrak gerektirmez)

Terminalden tek komutla bulutta IPA derleyip TestFlight / App Store'a gönderebilirsiniz:
```bash
cd /Users/emirhan/Desktop/codebase/atls
npx eas-cli login
npx eas-cli build --platform ios
```

---

## 🎨 Temel Özellikler

- **Tipografi & Logo:** Kalın tok **`atls.`** logosu ve elektrik moru nokta vurgusu.
- **Onboarding Deneyimi:** 3 slaytlık modern karşılama ve tanıtım akışı.
- **Kimlik & Giriş (Auth):** Apple ID, Google ve Misafir giriş seçenekleri.
- **Dil Desteği:** Türkçe & İngilizce tek dokunuşla anlık geçiş.
- **Spotify Tarzı Paylaşım Kartı:** 9:16 Instagram Story formatında, aydınlatılmış mini dünya haritalı, istatistikli hikaye kartı.
- **Vektör Dünya Haritası:** 180+ ülkeyi içeren interaktif SVG dünya haritası.
- **2 Sekmeli Alt Kapsül Menü:** Ana Sayfa (Home) ve Profil (Passport).
