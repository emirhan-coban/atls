# atls. — Dünya Pasaportun (React Native / Expo, iOS)

**atls.** gezdiğin, yaşadığın ve gitmek istediğin ülkeleri 3B bir dünya üzerinde işaretlediğin, pasaport temalı bir seyahat uygulamasıdır. Koyu tema, cam yüzeyler ve altın vurgu.

- **Platform:** yalnızca iOS (Android kapsam dışı, bkz. `PLAN.md` §9)
- **Bundle ID:** `com.atlas.passport`
- **Sürüm:** `app.json` içinde (`version` ve `ios.buildNumber`); EAS derlemede build numarasını kendisi artırır
- **Altyapı:** Expo SDK 57, React Native 0.86, Expo Router, Skia, Reanimated, zustand, Supabase (isteğe bağlı bulut senkronu)

Geliştirici rehberi için `CLAUDE.md` ve `AGENTS.md`, yol haritası ve geçmiş için `PLAN.md`, güncel denetim notları için `IYILESTIRME_NOTLARI.md`.

---

## Özellikler

- **3B küre ana sayfa:** ülkeler duruma göre (gezildi / yaşandı / hedef) renklenir, dokununca ülke paneli açılır.
- **Ülke bilgileri:** başkent, dil, para birimi, saat farkı, iklim ve T.C. pasaportu için vize durumu (Vikipedi verisi, tarihle ve uyarıyla gösterilir).
- **Keşfet:** "Bu ay nereye?", rotalar ve tüm ülkeler listesi (vize, Schengen, kıta filtreleri).
- **Seyahat günlüğü:** gezi kaydı, istatistik, yıllık hedef, seviyeler, rozetler, damgalar, yıl özeti.
- **Planlayıcı:** tarih, hazırlık listesi, bütçe, hatırlatıcılar, belge kasası (Face ID).
- **Gizli Ülke:** her gün herkese aynı ülke, 6 ipucu, seri ve paylaşılabilir sonuç.
- **Paylaşım:** 4:3 pasaport kartı, 9:16 hikâye kartı, animasyonlu yolculuk hikâyesi, pasaport çarpıştırma.
- **Hesap isteğe bağlı:** hesapsız (misafir) kullanılabilir; Apple, Google veya e-posta ile giriş yapınca veriler buluta eşitlenir. Hesap silme: Pasaport > Hesap Yönetimi.
- **Türkçe ve İngilizce**, açık/koyu/sistem teması.

---

## Çalıştırma

```bash
npm install            # .npmrc içinde legacy-peer-deps=true var
npx expo start         # geliştirme sunucusu (geliştirme derlemesi gerekir, Expo Go yetmez)
npx expo run:ios       # iOS simülatöründe derle ve çalıştır
```

`ios/` klasörü git'te tutulmaz (Continuous Native Generation). `app.json` ve `plugins/` tek kaynaktır; klasör `npx expo run:ios` veya `npx expo prebuild --platform ios --clean` ile üretilir. Yerelde `pod install` için `LANG=en_US.UTF-8` gerekebilir.

Kontroller (CI de bunları çalıştırır):

```bash
npm run typecheck
npm run lint
npm test
```

`.env.example` içindeki Supabase değişkenlerini `.env` olarak doldurursan bulut senkronu açılır; boş bırakırsan uygulama tamamen yerel çalışır. Veritabanı şeması `supabase/schema.sql` içindedir ve tekrar çalıştırılabilir.

---

## TestFlight / App Store

```bash
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

`production` profili build numarasını otomatik artırır (`app.json` dosyasındaki `buildNumber` değişir; bu değişikliği commit'le). Metinler ve adım adım yükleme için `store/app-store-listing.md` ve `store/app-store-connect-rehberi.md`.

---

## Gizlilik sayfası (GitHub Pages)

Gizlilik politikası `public_docs/index.html` dosyasındadır ve **https://emirhan-coban.github.io/atls/** adresinde yayınlanır (uygulamada Pasaport > Hesap Yönetimi > Gizlilik Politikası bu adrese gider, App Store Connect'teki Gizlilik Politikası URL'si de aynı olmalı). Metni değiştirdiysen yayınlamak için:

```bash
bash scripts/publish-docs.sh
```

Betik `public_docs/` klasörünü `gh-pages` dalına gönderir; GitHub Pages bu daldan yayın yapar. `main`'e veya çalıştığın dala dokunmaz. Sayfanın yayına girmesi bir iki dakika sürer.
