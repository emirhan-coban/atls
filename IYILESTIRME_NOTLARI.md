# atls. — Denetim notları (7 Kasım 2026, sürüm 1.3.0)

Bu dosya `PLAN.md`'nin yerine geçmez; onun üstüne, 1.3.0 sonrası **şu anki kodun** denetimidir.
Etiketler: **[doğrulandı]** komutla veya EAS/App Store Connect çıktısıyla gördüm, **[kodda gördüm]** okudum ama çalıştırmadım, **[doğrulanmadı]** tahmin veya cihazda denenmedi.

---

## 1. Genel durum

- ~35 bin satır TS/TSX. Ana ekranlar: küre ana sayfa, Keşfet (Rotalar + Tüm Ülkeler), Pasaport, Günlük, Planlayıcı. [doğrulandı]
- `PLAN.md` Faz 0–6 ve üç tasarım turunu "yapıldı" diye kapatmış. Kodla büyük ölçüde örtüşüyor; farklar aşağıda (§3).
- Test: 23 dosya, 177 test geçiyor. **Hiç bileşen testi yok**, yalnızca saf mantık, store ve veri. [doğrulandı]
- `tsc` temiz, lint 0 hata / 26 uyarı. CI var (`tsc`, lint, jest). [doğrulandı]

---

## 2. EKSİKLER

### 2.1 Yayın / uyumluluk (önce bunlar)
1. **Uygulama içinde gizlilik politikası ve kullanım koşulları bağlantısı yok.** `public_docs/index.html` var ve içinde gizlilik metni geçiyor, ama kodda ona giden hiçbir bağlantı yok. App Store, hesap açan uygulamalarda politikanın uygulama içinden de erişilebilir olmasını bekliyor (5.1.1). Hesap Yönetimi'ne iki satır eklemek yeter. [doğrulandı: `src` içinde eşleşme yok]
2. **Çökme/hata izleme yok** (Sentry vb.). Üretimde ne patlıyor bilemezsin. `PLAN.md` bilerek ertelemiş (DSN + gizlilik metni gerekir). Şimdi gerçek kullanıcılar var, önceliği yükseldi. [doğrulandı: `package.json`'da yok]
3. **OTA güncelleme yok** (`expo-updates` kurulu değil). Her JS düzeltmesi tam derleme + TestFlight demek. Son derleme kuyrukla birlikte ~3 saat sürdü (3 Kas 21:16 → 4 Kas 00:30). `expo-updates` + `eas update` ile küçük düzeltmeler dakikalar içinde gider. Not: `expo-updates` native modüldür, bir kez yeniden derleme ister. [doğrulandı]
4. **Fotoğraf erişim izni metni `app.json`'da yok** (`expo-image-picker` eklentisi listede değil, `NSPhotoLibraryUsageDescription` tanımlı değil). Seçici iOS'un PHPicker'ını kullandığı için çalışıyor görünüyor; yine de eklentiyi ekleyip anlaşılır bir metin yazmak gönderim reddi riskini sıfırlar. [kodda gördüm]
5. **App Store metni 1.3.0'ı anlatmıyor.** `store/app-store-listing.md` küreyi anlatıyor ama günlük oyun, hikâye kartı, çarpıştırma ve nadirlik yok. "Bu sürümdeki yenilikler" ve ekran görüntüleri güncellenmeli. `store/app-store-connect-rehberi.md` hâlâ "1.1.0" diyor. [doğrulandı]

### 2.2 Bu oturumda eklenen özelliklerin açık uçları
6. **Günlük oyun için hatırlatma bildirimi yok.** Seri tutan oyunun en güçlü geri getirme aracı akşam saatinde "serini kaybetme" bildirimi; altyapı (`notificationService`, izin akışı) hazır. İzin, ilk oyundan sonra bağlamda istenmeli (`PLAN.md` §9 #7). [kodda gördüm]
7. **Oyun geçmişi/istatistik ekranı yok.** Saklanan veri son 14 gün + toplam (oynanan, kazanılan, seri, en iyi). Tahmin dağılımı (1/6…6/6) tutulmuyor, dolayısıyla Wordle tarzı istatistik çubukları çizilemez. Şimdi eklenirse geriye dönük veri olmaz. [kodda gördüm]
8. **Oyun havuzu sınırlı ve tekrar edebilir.** Ülke, tarihten hash ile seçiliyor; iki gün üst üste aynı ülke gelebilir ve 196'lık havuz tükenmeden tekrar eder (devir/shuffle yok). Küçük ama gören olur. [doğrulandı: testte yalnızca dağılım ölçülüyor]
9. **Oyun yalnızca Türkçe ipucu dilleriyle test edildi.** EN metinler var, simülatörde İngilizce ekran görüntüsüyle bakılmadı. [doğrulanmadı]
10. **Çarpıştırma bağlantısı tıklanamıyor.** `atls://` şeması WhatsApp/iMessage'da çoğu zaman bağlantı olarak görünmüyor; yapıştırma yolu bunu kısmen çözüyor. Gerçek çözüm evrensel bağlantı (`https://atls.app/c/...` + `apple-app-site-association`) ve uygulama yüklü değilse App Store'a yönlendirme. Bu, uygulamanın en büyük büyüme açığı: şu an paylaşımın "uygulamayı yüklemeyenler" için hiçbir ucu yok. [doğrulandı]
11. **Çarpıştırma kodu katalog sırasına bağlı.** Kataloğa ülke eklenince eski kodlar geçersiz olur (sürüm öneki ile yönetilecek ama bu henüz kodda yok, yalnızca not). [kodda gördüm]
12. **Nadirlik rozeti misafirlere ve çevrimdışılara görünmez.** Fonksiyon yalnızca oturumlu kullanıcıya açık; misafir modu ana akış olduğu için çoğu kullanıcı rozeti hiç görmeyebilir. Ayrıca 50 gezgin eşiği altında hiç görünmez. Bu iki durum için "rozet neden yok" ipucu yok. Gerçek veriyle hiç denenmedi. [doğrulanmadı]
13. **Hikâye kartı video değil, PNG.** Animasyon yalnızca ekranda; paylaşılan şey son kare. Gerçek video için `react-native-view-shot` yetmez (kare kare yakalama + kodlayıcı gerekir). [doğrulandı]

### 2.3 Ürün boşlukları (PLAN.md bilerek dışarıda bırakmıştı)
14. **Widget'lar yok** (ana ekran/kilit ekranı: ülke sayısı, seri, geri sayım). Retention için güçlü; WidgetKit hedefi gerekir, CNG ile config plugin ve ayrı iş. [doğrulandı: PLAN §6]
15. **Fotoğraf, belge ve plan yedeği yok**, telefon değişirse kaybolur (gizlilik kararı). En azından kullanıcıya "yedeklenmez" uyarısı veya isteğe bağlı iCloud/dosya dışa aktarma sunulabilir. Veri dışa aktarma JSON/CSV var, **içe aktarma yok**. [kodda gördüm]
16. **Yalnızca TR ve EN.** DE/ES/FR yok (hedef kitle kararı). Yeni dil eklemek satır içi dil koşulları yüzünden bugün çok pahalı: `src` genelinde ~300 koşul var. Bu oturumda eklediğim dosyalar da aynı kalıbı kullandı (DailyGame*, JourneyStoryModal, CompareModal, `dailyCountry.ts`: toplam ~55 koşul), yani borç büyüyor. [doğrulandı]
17. **Erişilebilirlik zayıf.** Etiket sayısı: HomeScreen 2, PassportScreen 2, ExploreScreen/OnboardingScreen/AuthScreen 0. VoiceOver kullanan biri küreyi ve çoğu düğmeyi kullanamaz. Küre özellikle sorunlu (yalnızca dokunma/sürükleme). Hareket azaltma tercihine bakan kod yok. [doğrulandı]
18. **Görseller önbelleksiz.** `expo-image` yok; rota fotoğrafları (Commons) ve 18 Unsplash bağlantısı (`curatedDestinations.ts`) RN `Image` ile her seferinde ağdan geliyor, çevrimdışı boş. [doğrulandı]
19. **"Sahte oturum" yolu:** `PLAN.md` §2 madde 5 ve §10 "çözülmedi, misafir modu gelince kaldırılacak" demişti; Apple/Google yerel yedek akışının kaldırılıp kaldırılmadığına bu denetimde bakmadım. [doğrulanmadı]

---

## 3. FAZLALIKLAR / TEMİZLİK

### 3.1 Ölü kod [doğrulandı, import analiziyle]
| Dosya / öğe | Not |
|---|---|
| `src/components/SkeletonLoader.tsx` | Hiçbir yerden import edilmiyor. 1.2.1'de iskelet açılış ekranı kaldırıldı (`217689d`), dosya kaldı. `PLAN.md` hâlâ "açılışta iskelet ekran" diyor, yanlış. |
| `src/data/travelGuides.ts` (365 satır) | Hiçbir yerden import edilmiyor. PLAN §4.3 "kısmını ülke profiline taşı" demişti, taşınmadı. Bağla veya sil. |
| `travelData.ts` içinde `stampsData`, `getPassportStamps`, `passportStamps` | İçi boş diziler, kullanan yok. |
| `ATLAS_GLOBE_PROMPT.md`, `atls.png` (kök) | Küre işi için yazılmış görev metni ve kökte duran görsel; repo kökünü kirletiyor. `docs/` altına al veya sil. |
| `web_prototype/` | Eski Vite prototipi (444 KB). Jest'ten dışlanmış, uygulamayla ilgisi yok. Arşivle veya sil. |
| Kullanılmayan export'lar | `TRAVEL_LEVELS`, `CLIMATE_META`, `COUNTRY_COUNT`, `ALIASES`, `WANT_ALPHA`, `NOT_SUGGESTED`, `MIN_ZOOM`, `scaleOf`, `viewBoxOf`, `viewFromTransform`, `transformForView`, `mergeByColor`, `MEMORY_HOUR`, `MAX_MEMORY_REMINDERS`, `splitAccent`, `formatLongDate`, `previousDayKey` ve `globeMath` içindeki birkaç yardımcı yalnızca testlerde geçiyor (çoğu zararsız, test için dışa açık). Silme listesi değil, "gözden geçir" listesi. |

### 3.2 Bağımlılıklar [doğrulandı, import ve `app.json` taraması]
- **`expo-clipboard`**: hiç kullanılmıyor. Ya kaldır ya da çarpıştırma ekranına "kodu kopyala" düğmesi olarak bağla (daha iyi).
- **`typescript`, `@types/react`**: `dependencies` içinde, `devDependencies`'e ait.
- **`expo-constants`, `expo-linking`, `react-native-screens`, `react-native-worklets`**: kaynakta doğrudan import yok ama `expo-router` ve `reanimated` eş bağımlılığı olabilir. Kaldırmadan önce `npx expo-doctor` çalıştır. [doğrulanmadı]
- `package.json` `"version": "1.0.0"` (uygulama 1.3.0) tutarsız, kozmetik.

### 3.3 Açılışta gereksiz iş
- `App.tsx` her açılışta boşta `warmMapShapes()` çağırıyor (SVG dünya haritasını işleyip bellekte tutuyor). Bu harita (`WorldMap`) artık yalnızca **OnboardingScreen**'de kullanılıyor ve onboarding bitmiş kullanıcı onu bir daha görmüyor. Yani her açılışta gereksiz CPU/bellek. Ana sayfa küreye geçince kalan bir artık. Düzeltme: yalnızca onboarding açıkken çağır. [doğrulandı: `WorldMap` tek tüketicisi `OnboardingScreen`; hız etkisini ölçmedim]
- `PassportShareModal` hâlâ `worldMapPaths` ile kendi mini haritasını çiziyor; küreyle görsel dil ayrışıyor (paylaşım kartı hâlâ düz harita). [kodda gördüm]

### 3.4 Dağınıklık ve borç
- **Büyük dosyalar:** `OnboardingScreen` 2220, `PassportScreen` 1622, `AuthScreen` 1298, `HomeScreen` 1228, `storageService` 927 satır. Bölünmeden her değişiklik risk. [doğrulandı]
- **`any`:** 123 yer, **`console.warn/log`:** 51 yer (sessiz yutulan hatalar, hata izleme olmadığı için görünmez). [doğrulandı]
- **Sert kodlanmış renk:** `components`+`globe` içinde ~71 `#hex`/`rgba(...)`, bir kısmı bilerek (paylaşım kartı, marka renkleri). [doğrulandı]
- **README eski:** "Fremd." metni, `Version 1.1.0 (Build 11)`, **yanlış bundle ID** (`com.atls.passport`; gerçek `com.atlas.passport`). [doğrulandı]
- **`PLAN.md` kronolojik bir günlük:** Faz 1'deki "açılışta iskelet ekran" gibi maddeler sonradan değişti (iskelet 1.2.1'de kalktı, font Fraunces'ten Instrument Serif'e geçti). Güncel durum için `CLAUDE.md` ve bu dosya; `PLAN.md`'ye sonuna "1.3.0" bölümü eklemek yeterli. [doğrulandı]
- **`store/` 41 MB** git'te (ekran görüntüleri). Çalışır ama repo şişiyor. [doğrulandı]
- **Küre dokuları 7,8 MB** (`country-id.png` tek başına 6,2 MB, ilk açılışta GPU'ya yükleniyor). Açılış süresine etkisi ölçülmedi. [doğrulandı boyut, doğrulanmadı etki]

---

## 4. ÖNERİLEN SIRA

> **7 Kasım güncellemesi, "bu hafta" listesi:** 2 (izin metni), 3 (ölü kod ve bağımlılıklar; `expo-clipboard` çarpıştırma ekranında "Mesajı kopyala" olarak bağlandı), 4 (harita ön yüklemesi yalnızca onboarding'de) ve 5 (README, PLAN, store metinleri) yapıldı. Gizlilik sayfası içeriği yeniden yazıldı (eski metin hesabı, bulut eşitlemeyi ve Supabase'i hiç anlatmıyordu, yanlıştı). **1 numara bitti:** sayfa GitHub Pages'te yayında (`https://emirhan-coban.github.io/atls/`, `scripts/publish-docs.sh` ile) ve uygulamada Hesap Yönetimi'nde "Gizlilik Politikası" satırı var. App Store Connect'teki Gizlilik Politikası URL'si hâlâ repo adresi (`github.com/emirhan-coban/atls`), yeni adrese çevrilmeli. Ek not: `npx expo install --fix` beş pakette yama sürümü farkı gösteriyor (`expo`, `expo-build-properties`, `expo-constants`, `expo-image-picker`, `expo-notifications`), eskiden de vardı, zararsız.

**Bu hafta (hepsi küçük):**
1. Hesap Yönetimi'ne gizlilik politikası + koşullar bağlantıları (§2.1-1).
2. `expo-image-picker` eklentisi + izin metni (§2.1-4).
3. Ölü kod ve bağımlılık temizliği: `SkeletonLoader`, `travelGuides` (veya bağla), `stampsData`, `expo-clipboard` kararı, `typescript`/`@types/react` → dev (§3.1-3.2).
4. `warmMapShapes`'i yalnızca onboarding'e taşı (§3.3).
5. README + `PLAN.md` + store rehberi düzeltmesi, 1.3.0 "Yenilikler" metni (§2.1-5, §3.4).

**Sonraki sürüm (1.4):**
6. `expo-updates` (OTA) + Sentry. Tek yeniden derleme, sonra hızlı düzeltme ve görünürlük (§2.1-2/3).
7. Oyun için akşam hatırlatması, tahmin dağılımı kaydı ve oyun istatistik ekranı (§2.2-6/7).
8. Evrensel bağlantı + uygulama yoksa App Store yönlendirmesi (§2.2-10). Büyüme için en yüksek etki.
9. Çarpıştırma: "kodu kopyala" düğmesi (`expo-clipboard` zaten kurulu).

**Sonra:**
10. Erişilebilirlik turu (etiketler, küre için alternatif liste, hareket azaltma) (§2.3-17).
11. Çeviri sistemine geçiş, ardından DE/ES (§2.3-16).
12. `expo-image` ile önbellek (§2.3-18).
13. Widget (§2.3-14).
14. Büyük dosyaları bölme: önce `OnboardingScreen` ve `AuthScreen` (§3.4).

---

## 5. Doğrulamadığım şeyler (bilerek)
- Klavye açıkken oyun arama kutusunun yerleşimi (simülatörde klavye açılmadı).
- Nadirlik rozetinin gerçek Supabase verisiyle çalışması.
- İngilizce arayüzde yeni ekranlar.
- Gerçek cihazda performans/açılış süresi, VoiceOver davranışı.
- Güvenlik/RLS taraması yapmadım; `PLAN.md` Faz 0 bulgularının Supabase'e uygulandığını tek tek kontrol etmedim (yalnızca `country_visit_stats` fonksiyonunun varlığını doğruladım).
