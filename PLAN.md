# atls. — Denetim Raporu ve Geliştirme Planı

Hazırlanma: 29 Ekim 2026. Kapsam: kod, veri katmanı, güvenlik, tema/UI, içerik ve özellikler.
Her bulgunun yanında doğrulama durumu yazıyor: **[doğrulandı]** simülatörde veya komutla gördüm, **[kodda gördüm]** kodu okudum ama çalıştırıp denemedim.

---

## 1. Uygulamanın bugünkü hali (özet)

atls., ülkeleri "gezildi / yaşandı / hedef" olarak işaretleyip pasaport, dünya haritası ve istatistik gösteren iOS öncelikli bir uygulama.

| Alan | Bugün | Not |
|---|---|---|
| Ekranlar | Ana Sayfa, Keşfet, Pasaport + modaller | 3 sekme, ülke başına tek kayıt |
| Veri | 193 ülke kataloğu, 193 ülke bilgi notu (trivia), 18 küratörlü rota, 15 ülke rehberi | Rehberlerin çoğu ekrana bağlı değil |
| Backend | Supabase (auth + 2 tablo), yerelde AsyncStorage | Bulut senkronu eksik alanlarla çalışıyor |
| Giriş | Apple, Google, e-posta + OTP | Giriş zorunlu, misafir modu yok |
| Dil | TR / EN | 189 yerde satır içi `lang === 'tr' ?` var |
| Test | 1 test dosyası | CI, lint, jest yapılandırması yok |
| Tasarım | Koyu tema, altın vurgu, cam yüzeyler (bu oturumda yenilendi) | Bileşen kitaplığı yok, her ekran kendi stilini yazıyor |

**Ana tespit:** Uygulama bugün bir "ülke işaretleyici". Kullanıcıyı geri getirecek derinlik (seyahat geçmişi, anılar, planlama, rehber, hedefler) neredeyse yok. Yazılmış ama ekrana bağlanmamış bir sürü özellik var, bu yüzden en hızlı kazanım bunları bağlamak.

---

## 2. Bulunan sorunlar (öncelik sırasıyla)

### P0 — Yayın/güvenlik/veri kaybı riski

1. **Hesap silme gerçek değil [kodda gördüm].** `authService.deleteAccount` yalnızca `user_countries` ve `profiles` satırlarını siliyor, ardından `signOut` yapıyor. `auth.users` kaydı duruyor. App Store kuralı 5.1.1(v) gerçek hesap silmeyi şart koşuyor. Çözüm: `SECURITY DEFINER` bir SQL fonksiyonu veya Edge Function ile `auth.users` kaydını silmek.
2. **Herkes tüm e-posta adreslerini okuyabilir [kodda gördüm].** `schema.sql` içinde `profiles` için `SELECT USING (true)` politikası var ve tabloda `email` ile `passport_no` sütunları duruyor. Anon anahtarı uygulamanın içinde olduğundan bu tablo dışarıdan okunabilir. Çözüm: tabloyu sahibine kapatıp herkese açık alanları (handle, ad, avatar) ayrı bir view'dan sunmak.
3. **Çevrimdışıyken yerel veri silinebilir [kodda gördüm, çalıştırıp denemedim].** `storageService.loadInitialData` bulut isteği hata verdiğinde `cloudCountries` değerini `null` olarak alıp `[]` yapıyor ve bunu AsyncStorage'a yazıyor. Ağ yokken uygulama açılırsa yerel liste boşalabilir. Çözüm: hata durumunda yerel önbelleği olduğu gibi kullanmak, bulut yanıtı sadece başarılıysa yazmak.
4. **Bulut senkronu bazı alanları kaybediyor [kodda gördüm].** Şemada `month`, `photos`, `passportTheme`, `homeCountryId`, `homeCity`, `nameTr` yok. Kullanıcı başka cihazda giriş yapınca ay bilgisi, seçili pasaport teması ve yaşadığı ülke geri gelmiyor. Ek olarak `location` ve `location_tr` sütunlarına aynı değer yazılıyor.
5. **Sahte oturum yolu [kodda gördüm].** Apple/Google girişinde Supabase ulaşılamazsa uygulama `'apple-user'` gibi yerel bir kimlikle "giriş yapmış" sayıyor. Bulutta hesap olmadığı için veri hiçbir yere kaydedilmiyor. Bu açıkça bir "yerel mod" olarak tasarlanmalı.
6. **Giriş zorunlu, misafir modu yok [kodda gördüm].** README misafir girişi vaat ediyor ama kodda yok. Apple, hesabın uygulamanın temel işlevi için gerekmediği durumlarda zorunlu kayıt istemeyi reddedebiliyor (5.1.1). Pasaport ve harita yerelde de çalışabilir, bulut senkronu isteğe bağlı olmalı.
7. **Yazma yarışı [kodda gördüm].** `addCountry`, AsyncStorage'dan tüm listeyi okuyup geri yazıyor. Onboarding'de `for (...) addCountry()` döngüsü beklemeden çağrılıyor, hızlı ardışık yazmalar birbirini ezebilir. Ayrıca bir ülkeyi düzenleyince liste başa kayıyor (`updateCountry` ülkeyi öne alıyor).
8. **Çevrimdışı yazma kuyruğu yok [kodda gördüm].** Bulut yazması başarısız olursa hata sadece konsola düşüyor, tekrar denenmiyor.

### P1 — Kalite ve bakım

9. **Hiçbir yere bağlı olmayan kod [doğrulandı, grep ile].** `AchievementBadge`, `ContinentalProgress`, `SwipeDiscoveryCard`, `EmptyState`, `SkeletonLoader`, `AuthModal`, `travelGuides.ts`, `achievements.ts`, `notificationService.ts` kimse tarafından import edilmiyor. `expo-image-picker`, `expo-clipboard` ve `expo-notifications` yüklü ama kullanılmıyor. Karar: bağla veya sil.
10. **Liste performansı [doğrulandı].** Projede `FlatList` yok, 23 `ScrollView` var. Ülke ekleme ekranı 193 satırı doğrudan render ediyor. 3 ana ekran birden canlı tutuluyor (`display: none`).
11. **Erişilebilirlik [doğrulandı].** 142 dokunulabilir öğeye karşılık 5 `accessibilityLabel` var. Dinamik yazı boyutu ve kontrast hiç denetlenmedi.
12. **Çeviri dağınıklığı [doğrulandı].** 189 satır içi dil koşulu var. Yeni dil eklemek bugün neredeyse imkansız.
13. **Görseller [doğrulandı].** 18 Unsplash bağlantısı uygulamanın içinde. Çevrimdışı çalışmaz, lisans/atıf ve kalıcılık garantisi yok, önbellek yok.
14. **Test ve CI [doğrulandı].** 1 test dosyası, jest paketi bağımlılıklarda yok, ESLint yapılandırması yok, CI yok. `LogBox.ignoreAllLogs(true)` tüm uyarıları gizliyor.
15. **Mimari uyumsuzluklar [doğrulandı].** AGENTS.md "Expo Router + `src/app/`" diyor, kod elle yönetilen sekmeler kullanıyor. `ios/` klasörü commit'li ama `app.json` ayarları senkronlanmıyor (expo-doctor uyarısı). `.js` ve `.tsx` karışık.
16. **Çökme/analitik izleme yok.** Üretimde bir hata olursa haberiniz olmaz.

### P2 — Cila

17. Kalan ~42 `rgba(...)` ve ~26 hex değeri token'a bağlı değil (Google marka renkleri ve pasaport temaları bilerek hariç).
18. Android'de blur yok (cam etkisi daha opak bir zemine düşüyor).
19. Birincil düğmeler tutarsız: modallarda altın, ana ekranlarda beyaz.
20. Onboarding ekranı 2288 satır ve 6 adım. Kullanıcı değer görmeden hesap kuruyor.
21. Onboarding ve Auth ekranlarını bu oturumda simülatörde göremedim (çıkış gerektiriyor).

---

## 3. Tema ve tasarım planı

Hedef: "Pasaport + cam" kimliğini tamamlayıp her ekranı aynı sistemden üretmek.

### 3.1 Tasarım sistemi v2
- **Token'ları bitir:** kalan rgba/hex değerleri, `spacing`, `borderRadius`, `typography`, `shadows` token'larını bileşenlerde gerçekten kullan (şu an sayılı yerde kullanılıyor).
- **Bileşen kitaplığı çıkar:** `Button` (primary altın / secondary cam / ghost / danger), `Chip`, `StatusPill`, `Card`, `GlassCard` (var), `Sheet` (modal kabuğu: tutamaç, başlık, kapat), `SectionHeader`, `StatTile`, `Input`, `ListRow`, `IconBadge`. Modalların 3 kopyası (Add, Status, EditProfile) aynı iskeleti tekrar yazıyor, tek `Sheet` bileşenine inecek.
- **Birincil düğme kuralı:** tek vurgu altın olduğu için tüm birincil eylemler altın, ikincil eylemler cam.
- **Tipografi:** sistem fontu yerine bir ekran fontu (başlıklarda karakterli bir display font, gövdede Inter benzeri). `expo-font` ile yüklenir, `typography` token'ına bağlanır.
- **Açık tema (isteğe bağlı):** `userInterfaceStyle` şu an `dark` sabit. Token yapısı hazır olduğu için ileride açık tema eklenebilir; öncelik düşük.

### 3.2 "Pasaport" hissini güçlendirme
- **Damga animasyonu:** ülke işaretlenince damga ekrana "vurur" (ölçek + hafif dönüş + haptic + mürekkep izi). Bugün sadece konfeti var.
- **Ülkeye özel damgalar:** SVG damga şablonları (daire, dikdörtgen, çift çerçeve), ülke kodu, tarih, rastgele eğim ve mürekkep dokusu. Pasaport sayfaları yatay kaydırılır.
- **Pasaport kitapçığı görünümü:** kapak (seçili tema), kimlik sayfası, damga sayfaları, vize sayfaları. Sayfa çevirme animasyonu.
- **Pasaport kapakları:** mevcut 5 tema çoğaltılır, kabartma altın baskı efekti, Pro'ya özel kapaklar.

### 3.3 Harita
- Seçili ülkeye yaklaşma animasyonu, ülke adı etiketleri (belirli zoom'da), "hedefler" için altın çizgili vurgu.
- Seyahat rotaları (ülkeler arası eğri çizgiler, uçuş yayları), yıl filtresi ("2024'te gittiklerim").
- Isı haritası modu (ziyaret sayısı) ve küre (globe) görünümü. Küre için `react-native-skia` veya `expo-gl` değerlendirilir.
- Performans: 313 SVG yolunu her render'da yeniden çizmek yerine memoize edilmiş katmanlar, seçili ülke ayrı katman.

### 3.4 Hareket ve geri bildirim
- Ortak geçiş süreleri/yaylar (Reanimated 4), tutarlı haptic dili (başarı, seçim, uyarı).
- Yüklenme: `SkeletonLoader` (var, bağlı değil) liste ve kartlarda. Boş durumlar: `EmptyState` (var, bağlı değil).
- İlk açılışta kısa bir ürün turu (3 ipucu, atlanabilir).

### 3.5 Marka
- Uygulama ikonu ve açılış ekranı yenilenir (altın nokta, `atls.` logosu).
- App Store ekran görüntüleri ve mağaza metni (TR/EN).

---

## 4. İçerik ve özellik planı

### 4.1 Seyahat kaydını derinleştirmek (en büyük eksik)
Bugün bir ülke = bir kayıt (yıl + not). Gerçek kullanım şöyle olur: aynı ülkeye birden çok kez gitmek, şehirleri, tarih aralığını, kiminle gidildiğini kaydetmek.
- **Gezi (Trip) modeli:** ülke, şehirler, başlangıç/bitiş tarihi, yolculuk türü (tatil, iş, aile, ev), kimlerle, puan, notlar, fotoğraflar, harcama. Bir ülkede birden çok gezi olabilir.
- **Şehir katmanı:** şehir arama (GeoNames/Wikidata verisi), şehir bazlı harita noktaları, "kaç şehir gördün".
- **Zaman çizelgesi:** yıl bazlı kronolojik akış, her gezi bir kart.
- **İstatistikler:** toplam yurt dışında geçen gün, kat edilen mesafe ("Dünya'yı X kez dolaştın"), en uzun gezi, en sık gidilen ülke, kıta yüzdeleri, ilk/son gezi, yıl grafiği. Mevcut `AnimatedCounter` ve `ContinentalProgress` bileşenleri bu ekran için hazır.
- **Hedefler:** "2027'de 5 yeni ülke" gibi yıllık hedef, ilerleme çubuğu.

### 4.2 Anılar ve fotoğraflar
- `expo-image-picker` zaten yüklü: gezi başına fotoğraf ekle, kapak fotoğrafı seç.
- Fotoğraf depolama: Supabase Storage (kullanıcı başına klasör, boyut sınırı, sıkıştırma).
- "Anı kartı": fotoğraf + damga + tarih, paylaşılabilir.
- "Bugün geçen yıl" bildirimi (yerel bildirim, bkz. 4.7).

### 4.3 Ülke profilleri ve rehber (keşfet içeriğini kat kat artırmak)
Bugün 18 küratörlü rota var, 193 ülkenin hepsi için tek cümlelik bir not var. Hedef: her ülke için tam bir profil.
- **Temel bilgiler:** başkent, resmi dil(ler), para birimi ve kur, saat farkı, priz tipi, trafik yönü, ülke telefon kodu, acil numaralar.
- **Gitmeden önce:** **vize durumu (Türk pasaportu için)**: vizesiz, e-vize, kapıda vize, vize gerekli, süre; Schengen bilgisi. Bu, hedef kitle için tek başına güçlü bir özellik. Veri kaynağı olarak açık veri setleri ve lisans koşulları kontrol edilir, bilgi her zaman "resmi kaynağı kontrol et" notuyla ve son güncelleme tarihiyle gösterilir.
- **Ne zaman gidilir:** aylık iklim ve ziyaretçi yoğunluğu (Open-Meteo gibi açık iklim verisi), en iyi dönem etiketi.
- **Bütçe seviyesi:** günlük ortalama harcama aralığı (ucuz/orta/pahalı) ve örnek fiyatlar.
- **Güvenlik seviyesi:** resmî seyahat uyarılarına bağlantı.
- **Yeme-içme:** meşhur yemekler, "bunu dene" listesi (mevcut `food` alanı).
- **Kültür:** ufak ipuçları (bahşiş, selamlaşma, giyim), kısa kelime listesi (merhaba, teşekkürler, hesap lütfen) ve telaffuz.
- **Rotalar ve noktalar:** şu an 18 rota, hedef: tüm kıtalardan en az 60. Her biri harita noktası (koordinat) içersin, Apple/Google Maps bağlantısı zaten var.
- **Veri yönetimi:** içerik uygulamaya gömülü JSON yerine Supabase'de tutulur, uygulama güncellemeden içerik güncellenir. Çevrimdışı için yerel önbellek.
- **Not:** Mevcut `travelGuides.ts` (15 ülke) hiçbir ekranda kullanılmıyor, bu verinin bir kısmı ülke profiline taşınabilir.

### 4.4 Planlama (hedef listesinden gerçek geziye)
- **Gezi planlayıcı:** hedef bir ülkeyi "planlanan gezi"ye dönüştür: tarih aralığı, şehirler, gün gün program.
- **Kontrol listeleri:** bavul listesi şablonları (yaz, kış, şehir turu, plaj), pasaport/vize/sigorta hatırlatmaları.
- **Bütçe takibi:** kalem kalem harcama, para birimi dönüşümü, gezi toplamı.
- **Belge kasası:** bilet, otel, vize PDF'lerini yerelde şifreli sakla (Face ID ile aç).
- **Geri sayım:** "Roma'ya 23 gün" ana sayfa kartı.
- **Hedef önceliklendirme:** hedefleri yıla/sezona göre sırala, "bu ay gidilebilir" önerisi (iklime göre).

### 4.5 Oyunlaştırma ve ilerleme
- **Rozetler:** `achievements.ts` (176 satır) ve `AchievementBadge` hazır, Pasaport sekmesine bağlanır. Kategoriler: kilometre taşları, kıtalar, yemek, mevsim, "ilk adım".
- **Seviyeler:** Gezgin → Kaşif → Dünya Vatandaşı gibi isimli seviyeler, seviye atlayınca damga animasyonu.
- **Kıta görevleri:** "Avrupa'nın 20 ülkesi" gibi ilerleme halkaları (`ContinentalProgress`).
- **Seri (streak):** haftalık "bir şey kaydet" serisi, bozulursa nazik hatırlatma (bildirim sınırları ayarlanabilir).
- **Paylaş:** rozet kazanınca paylaşım kartı.

### 4.6 Keşfet sekmesini genişletmek
- **Kaydırarak keşif:** `SwipeDiscoveryCard` (hazır) ile "Tinder tarzı" ülke kartları: sağa kaydır = hedefe ekle, sola = geç. Haptic ve damga animasyonuyla.
- **Filtreler:** bütçe, mevsim, uçuş süresi (İstanbul'dan), vize durumu, tema (plaj, kültür, doğa, yemek, şehir).
- **"Sana özel":** geçmiş gezilerine ve hedeflerine göre öneri. İlk sürümde kural tabanlı (aynı kıta, benzer etiket). Sonraki sürümde sunucu tarafında Claude API ile kişiselleştirilmiş gezi önerisi (anahtar asla uygulamaya gömülmez, bir Edge Function üzerinden).
- **Koleksiyonlar:** "Hafta sonu kaçamağı", "Bütçe dostu", "Kış güneşi" gibi küratörlü listeler.
- **Arama:** ülke + şehir + yemek + etiket, son aramalar.

### 4.7 Bildirimler ve geri getirme
- `notificationService.ts` hazır ama bağlı değil. Eklenecekler: gezi geri sayımı, "bugün geçen yıl" anısı, hedef hatırlatma (kullanıcı kapatabilir), aylık özet.
- Tüm bildirimlerin izni bağlamda istenir (ilk gezi eklendiğinde), toplu izin ekranı yok.

### 4.8 Paylaşım ve dışa aktarma
- Mevcut: 4:3 pasaport kartı, 9:16 hikaye kartı. Eklenecek: yıllık özet ("2026 Wrapped"), harita posteri, ülke ızgarası, "ortak ülkeler" kartı.
- **Dışa aktarma:** JSON/CSV (KVKK/GDPR veri taşınabilirliği), yüksek çözünürlüklü PDF poster.
- **iOS widget'ları:** ziyaret edilen ülke sayısı, küçük harita, geri sayım. Kilit ekranı widget'ı.
- **Derin bağlantılar:** `atls://` zaten tanımlı, web'de genel profil sayfası (`atls.app/@handle`) için `public_docs` genişletilir.

### 4.9 Sosyal (en son, dikkatli)
- Genel profil (isteğe bağlı), arkadaş ekleme, haritaları karşılaştırma ("ortak 12 ülke"), isteğe bağlı sıralama.
- Gizlilik: varsayılan kapalı, ülke bazında gizleme, engelleme/şikayet.
- Moderasyon ve şema gereksinimi büyük olduğundan Faz 6'ya bırakıldı.

### 4.10 Akıllı içe aktarma
- **Fotoğraflardan otomatik gezi önerisi:** cihazdaki fotoğrafların konum meta verisinden (izinle, tamamen cihaz içinde) "bu tarihlerde Prag'daydın, ekleyelim mi?" önerisi.
- Google Zaman Çizelgesi/uçuş e-postası içe aktarma (kullanıcı verisi dosya olarak yüklenir).
- Bu özellik gizlilik hassas olduğu için ayrı bir tasarım ve izin metni ister.

### 4.11 Gelir modeli
- **Ücretsiz:** ülke/gezi işaretleme, harita, temel istatistik, temel paylaşım.
- **atls. Pro (abonelik):** sınırsız fotoğraf, premium pasaport kapakları, widget'lar, PDF poster, gelişmiş istatistik, bulut yedek, öncelikli içerik. RevenueCat veya StoreKit 2 ile.
- Önce değer, sonra ödeme duvarı: ilk 3 gezi ücretsiz, ardından bir kez tanıtım.

### 4.12 Yerelleştirme ve erişilebilirlik
- Çeviri sistemini `translations` içine taşı (189 satır içi koşul kaldırılır), ardından Almanca (diaspora için), İspanyolca, Fransızca eklenir.
- Erişilebilirlik: tüm dokunulabilir öğelere etiket, Dinamik Yazı Boyutu, VoiceOver sırası, kontrast kontrolü, hareket azaltma tercihi.

---

## 5. Teknik altyapı planı

1. **Veri katmanı yeniden yazımı:** yerel-öncelikli (local-first) depo. Tek bir kaynak (SQLite veya MMKV + şema), her değişiklik bir "değişiklik kuyruğuna" yazılır, ağ gelince Supabase'e gönderilir, çakışmada son yazan kazanır + `updated_at`. Böylece P0 #3, #5, #7, #8 birlikte çözülür.
2. **Şema v2:** `trips`, `trip_cities`, `trip_photos`, `achievements_unlocked`, `profiles` (alan eklemeleri), `countries_content` (rehber içeriği), `user_goals`. Hepsi RLS ile. Geçiş betiği (migration) dosyaları repoda.
3. **Hesap ve gizlilik:** gerçek hesap silme fonksiyonu, `profiles` politikasını sıkılaştırma, açık rıza ve gizlilik politikası bağlantısı uygulama içinde, KVKK/GDPR dışa aktarma.
4. **Misafir/yerel mod:** hesap açmadan kullanım, istediği an Apple/Google ile bağlama (veri taşınır).
5. **Navigasyon:** Expo Router'a geçiş (AGENTS.md ile uyum) veya bilinçli olarak mevcut yapıyı belgeleme. Önerim: ülke detayı, gezi detayı ve planlayıcı için gerçek rotalar gerekeceğinden Expo Router'a geç.
6. **TypeScript:** `.js` dosyalarını sırayla `.tsx`'e taşı (önce küçükler, en son Onboarding/Passport), `any` yerine gerçek tipler, `strict` açık.
7. **Kalite kapıları:** ESLint (expo yapılandırması), jest + birkaç anahtar test (store, enrich, sync kuyruğu, istatistik hesapları), GitHub Actions: `tsc`, `lint`, `test`.
8. **Performans:** `FlatList`/`FlashList` (ülke listeleri), harita katmanlarını memoize et, görseller için `expo-image` + disk önbelleği, ağır ekranlar için tembel yükleme.
9. **İzleme:** Sentry (çökme), gizlilik dostu ürün analitiği (isteğe bağlı), uzak yapılandırma bayrakları.
10. **Görseller:** Unsplash bağlantılarını kendi depolamana taşı (Supabase Storage/CDN), lisans ve atıf kaydı tut, küçük boyutlu paketli yedek görseller.
11. **Yapı ve yayın:** `ios/` klasörü kararı (CNG'ye dön ya da elle yönet), EAS profilleri, TestFlight dağıtımı, sürüm notu şablonu.
12. **Temizlik:** `web_prototype/` ve `public_docs/` ne işe yarıyor netleştir (gizlilik politikası sayfası `public_docs`'ta, o kalmalı), `LogBox.ignoreAllLogs` yalnızca demo derlemesinde.

---

## 6. Yol haritası

Süreler tek geliştirici için kaba tahmindir (S ≈ 1–2 gün, M ≈ 3–5 gün, L ≈ 1–2 hafta).

### Faz 0 — Güvenli temel (≈ 1–2 hafta)
- P0 #1–#8 (hesap silme, `profiles` gizliliği, çevrimdışı veri koruma, alan kayıpları, misafir/yerel mod, yazma kuyruğu). **L**
- ESLint + jest + CI, `LogBox` kısıtlama. **S**
- Ölü kodu ayıkla (bağlanacaksa tut, kullanılmayacaksa sil). **S**
- Çıkış kriteri: uygulama uçak modunda açılıp kapanınca veri kaybı yok, hesap silme `auth.users`'ı siliyor, e-posta dışarıdan okunamıyor.

### Faz 1 — Tasarım sistemi v2 (≈ 1–2 hafta)
- Token'ları bitir, bileşen kitaplığı (`Button`, `Sheet`, `Chip`, `Card`, `Input`…), 3 modalı `Sheet` üstüne taşı. **L**
- Font, ikon/açılış ekranı, tutarlı hareket ve haptic, `Skeleton` ve `EmptyState` bağla. **M**
- Onboarding'i kısalt (değer odaklı, hesap sonda), Auth ve Onboarding'i simülatörde kontrol et. **M**
- Çıkış kriteri: ekranlarda sabit renk/ölçü yok, tüm birincil düğmeler aynı bileşen.

### Faz 2 — Gezi modeli ve istatistik (≈ 2 hafta)
- `trips` şeması + arayüz (gezi ekle/düzenle, zaman çizelgesi). **L**
- İstatistik ekranı (gün, mesafe, kıta, yıllık), yıllık hedefler. **M**
- Rozetler ve seviyeler (hazır bileşenleri bağla). **M**
- Çıkış kriteri: aynı ülke için birden çok gezi, istatistikler gezilerden hesaplanıyor.

### Faz 3 — İçerik derinliği (≈ 2–3 hafta, paralel yürütülebilir)
- Ülke profili veri şeması ve Supabase tablosu, temel bilgiler 193 ülke için. **L**
- Vize durumu (Türk pasaportu) + Schengen, kaynak ve tarih gösterimiyle. **M**
- Rota/nokta sayısını 18'den 60+'a çıkar, yemek ve kültür ipuçları, iklim/ne zaman gidilir. **L (içerik emeği ağırlıklı)**
- Keşfet: filtreler, koleksiyonlar, kaydırarak keşif. **M**
- Çıkış kriteri: her ülkenin sayfasında en az temel bilgi + vize + iklim, Keşfet'te filtre ve kaydırma çalışıyor.

### Faz 4 — Anılar ve paylaşım (≈ 1–2 hafta)
- Gezi fotoğrafları (picker + Storage), anı kartı. **M**
- Damga animasyonu, ülkeye özel damgalar, pasaport kitapçığı görünümü. **L**
- Yeni paylaşım şablonları (Wrapped, poster, ızgara), dışa aktarma (JSON/CSV/PDF). **M**

### Faz 5 — Planlama ve bildirimler (≈ 2 hafta)
- Gezi planlayıcı, kontrol listeleri, bütçe, belge kasası. **L**
- Bildirimler (geri sayım, "geçen yıl bugün", hedef hatırlatma). **S**
- iOS widget'ları. **M**

### Faz 6 — Büyüme (≈ 3+ hafta)
- Pro abonelik + ödeme duvarı. **M**
- Genel profil, arkadaşlar, ortak ülkeler. **L**
- Fotoğraflardan otomatik gezi önerisi, kişiselleştirilmiş öneriler (Claude API, sunucu tarafında). **L**
- Dil ekleme (DE, ES, FR), Android eşitliği. **M**

### Hızlı kazanımlar (Faz 0'a paralel, her biri 1 günden kısa)
1. `AchievementBadge` + `ContinentalProgress`'i Pasaport sekmesine bağla.
2. `SwipeDiscoveryCard`'ı Keşfet'e ekle.
3. `SkeletonLoader` / `EmptyState`'i listelere bağla.
4. Birincil düğmeleri altına çevir (beyaz olanlar).
5. `+ Ekle` ekranındaki 193 satırı `FlatList`'e çevir.
6. Handle'ı panoya kopyala (`expo-clipboard` zaten yüklü).

---

## 7. Başarı ölçütleri
- **Teknik:** 0 veri kaybı bildirimi, çökmesiz oturum oranı > %99,5, `tsc`/lint/test CI'da yeşil, ilk açılış < 2 sn.
- **Ürün:** kullanıcı başına ortalama kayıtlı gezi sayısı, 7. gün ve 30. gün geri dönüş oranı, paylaşım başına yeni kurulum, Pro dönüşüm oranı.
- **İçerik:** profili tam ülke sayısı (hedef 193), rota sayısı (hedef 60+).

## 8. Riskler
- **İçerik emeği:** 193 ülke için doğru ve güncel bilgi tek başına yapılamaz. Açık veri kaynakları ve "son güncelleme" etiketi, doğrulanması gereken bilgiler (vize, güvenlik) için kritik. Yanlış vize bilgisi kullanıcıyı zor durumda bırakabilir, bu yüzden bir sorumluluk reddi ve resmi kaynak bağlantısı şart.
- **Kapsam kayması:** Sosyal ve otomatik içe aktarma yüksek maliyetli. Faz 2–4 değer kanıtlamadan başlanmaması önerilir.
- **Gizlilik:** konum/fotoğraf meta verisi kullanan her özellik açık rıza ve yalnızca cihaz içi işleme gerektirir.
- **Geriye dönük uyumluluk:** Şema değişikliği (trips) mevcut kullanıcıların `user_countries` verisini dönüştürmeyi gerektirir. Migration testi şart.
- **App Store:** zorunlu hesap açma ve eksik hesap silme reddedilme sebebi olabilir (Faz 0'da çözülür).

## 9. Kararlar (kesinleşti)

| # | Konu | Karar |
|---|---|---|
| 1 | Hedef kitle | Öncelik Türkiye (Türk pasaportlu gezginler), global kullanım ikinci sırada. Vize özelliği Türk pasaportuna göre başlar, sonra pasaport seçilebilir olur. |
| 2 | Gelir modeli | Pro abonelik şimdilik yok. Mimari buna hazır bırakılır, ödeme duvarı eklenmez. |
| 3 | Sosyal özellikler | Bu sürümün hedefi değil. Önce kişisel deneyim (gezi kaydı, istatistik, anı, rehber) güçlenir, sosyal Faz 6 sonrası. |
| 4 | Navigasyon | Expo Router'a geçilir. Ülke detayı, gezi detayı ve planlayıcı gerçek rotalara ihtiyaç duyacak. Faz 0 ve Faz 1 bittikten sonra, tasarım sistemi oturunca yapılır. |
| 5 | `ios/` klasörü | CNG'ye dönülür (`ios/` git'ten çıkar, `app.json` tek kaynak olur). Önce `expo prebuild` ile temiz bir derlemenin çalıştığı doğrulanır, ondan sonra klasör kaldırılır. |
| 6 | İçerik kaynağı | Karma: temel bilgiler (başkent, para birimi, dil, saat dilimi, priz) açık veri setlerinden otomatik çekilir. Editoryal içerik (rota, yemek, ipucu) ve vize bilgisi elle küratörlenir, kaynak ve son güncelleme tarihiyle. |
| 7 | Gizlilik | Konum/fotoğraf tabanlı her özellik isteğe bağlı ve yalnızca cihaz içinde işlenir. Bildirim izni bağlamda (ilk gezi eklenince) istenir. |
| 8 | Tema | Açık tema eklenecek. Token'lar anlamsal (semantic) yapıya çevrilip açık/koyu için iki set tanımlanır, sistem ayarını izler, ayarlardan değiştirilebilir. |
| 9 | Platform | Yalnızca iOS. Android eşitliği ve Android blur işi kapsam dışı. |

---

## 10. İlerleme

### Faz 0 — kod tarafı bitti, veritabanı adımı senin onayını bekliyor

| Madde | Durum |
|---|---|
| #3 Çevrimdışı veri silinmesi | Düzeltildi. Bulut isteği hata verirse yerel liste olduğu gibi kalır. Testle doğrulandı. |
| #4 Alan kayıpları (ay, tema, yaşadığın ülke, fotoğraf) | Kod hazır. Eski veritabanıyla da çalışıyor (yeni sütun yoksa onlarsız tekrar dener). **Tam çalışması için `supabase/schema.sql` Supabase'de çalıştırılmalı.** |
| #7 Yazma yarışı | Düzeltildi. Yerel yazmalar sıraya alındı, 5 ülkeyi aynı anda eklemek testte veri kaybettirmiyor. |
| #8 Çevrimdışı yazma kuyruğu | Eklendi (outbox). Başarısız yazmalar saklanır, uygulama öne gelince ve her yazmada tekrar denenir. |
| Ek bulgu: ülke güncellemesi buluta gitmiyordu | Düzeltildi. `upsert` çakışma anahtarı (`user_id,country_id`) verilmediği için mevcut bir ülkenin durum/not değişikliği buluta yazılmıyordu ve hata sessizce yutuluyordu. |
| #1 Hesap silme | Kod hazır: `delete_my_account` fonksiyonunu çağırıyor, başarısız olursa kullanıcıya hata gösteriyor. **Fonksiyon Supabase'de yokken hesap silme hata verir.** |
| #2 `profiles` herkese açık | `schema.sql` güncellendi (sadece sahibi okur, `public_profiles` view'ı eklendi). **Henüz Supabase'e uygulanmadı.** |
| #5 Sahte oturum | Çözülmedi (Apple/Google yerel yedek akışı duruyor). Misafir modu geldiği için bir sonraki adımda kaldırılacak. |
| #6 Misafir modu | Eklendi: Auth ve Onboarding ekranlarında "Hesap açmadan devam et". Misafir sonradan Pasaport > Hesap Yönetimi'nden hesap oluşturup verisini buluta taşır. Çıkış yaparken uyarı gösterilir. |
| Ölü kod | `AuthModal` silindi. Diğerleri (rozet, kaydırarak keşif, bildirim, rehber) Faz 2–5'te bağlanacak. |
| Kalite kapıları | ESLint (0 hata), Jest (15 test geçiyor), GitHub Actions (`tsc`, lint, test) eklendi. `LogBox` sadece `EXPO_PUBLIC_DEMO_MODE=1` ile kapanıyor. |

**Senin yapman gereken:** `supabase/schema.sql` dosyasını Supabase panelinde SQL Editor'de çalıştır (dosya tekrar çalıştırılabilir yapıda). Bunu ben uygulamadım çünkü canlı veritabanını değiştiriyor.

### Faz 1 — tasarım sistemi ve açık tema (büyük kısmı bitti)

| Madde | Durum |
|---|---|
| Açık tema | Bitti. `lightColors` (sıcak kâğıt zemin, okunaklı koyu altın) ve `darkColors` aynı rollerle tanımlı. Ayarlar > Hesap Yönetimi > **Görünüm**: Sistem / Açık / Koyu, anında değişiyor, tercih kaydediliyor. Simge ve durum çubuğu, klavye ve uyarılar da temayı izliyor. |
| Temalı stiller | Tüm bileşenler `makeStyles` + `useTheme` kullanıyor (`src/theme/ThemeContext.tsx`). Renk değeri doğrudan koda yazılmıyor, token'dan geliyor. |
| Bileşen kitaplığı | `Button` (primary/secondary/ghost/danger), `Chip`, `Sheet` (cam kabuk), `GlassCard` eklendi (`src/components/ui`). |
| Modal birleştirme | Ülke ekleme, durum düzenleme ve profil düzenleme sheet'leri `Sheet` + `Button` üzerine taşındı (üç ayrı kabuk tek bileşende). |
| Harita | Açık/koyu için ayrı kara ve sınır renkleri (`colors.map`). |
| Native görünüm | `app.json` ve `Info.plist` "automatic" yapıldı (önceden plist `Light` kilitliydi, `app.json` `dark`'tı, birbirleriyle çelişiyordu). |

**Faz 1'in kalan işleri de bitti:**

| Madde | Durum |
|---|---|
| Font | Başlıklarda **Fraunces** (serif display, `@expo-google-fonts/fraunces`), gövde metni sistem fontunda kaldı. Logo, ekran başlıkları, ülke adları, sheet başlıkları ve onboarding başlıklarında kullanılıyor. Font yüklenene kadar iskelet ekran gösteriliyor. |
| Onboarding | 6 adımdan 4 adıma indi: tanıtım → yaşadığın ülke → gittiğin ülkeler → (kısa özet) → hesap/misafir. Hedef ülke seçimi onboarding'den çıktı (Keşfet'ten seçilecek), ilerleme çubuğu 4 adım. |
| Skeleton / EmptyState | Açılışta iskelet ekran, Pasaport'ta ve Keşfet arama sonuçlarında `EmptyState` bağlandı. |
| Chip / Button yaygınlaştırma | Ay seçiciler ve Keşfet kıta filtreleri `Chip`, Ana Sayfa "Ülke Ekle", Pasaport "Paylaş" ve boş durum düğmeleri `Button` (altın) oldu. |
| Hesap Yönetimi | `Sheet` üstüne taşındı, içerik kaydırılabilir (küçük ekranda ve İngilizce metinle başlık durum çubuğuna biniyordu). |
| Doğrulama | Temiz bir cihazda onboarding'in 4 adımı, misafir girişi ve misafirin "Hesap Oluştur" seçeneği açık temada denendi. Koyu temaya sistemden geçiş anında uygulanıyor. |

**Faz 1'de bilerek yapılmayanlar:** `spacing`/`typography` token'larının tüm bileşenlerde kullanılması (görsel kazancı düşük, Faz 2 sırasında dokunulan ekranlarda yapılacak), Onboarding'deki kıta filtre çipleri hâlâ kendi stilinde, Paylaşım kartı ve kaydırarak keşif kartı açık temada gözle kontrol edilmedi (`SwipeDiscoveryCard` zaten hiçbir ekranda kullanılmıyor).

### Faz 2 — gezi modeli ve istatistik (kod bitti, bir kısmı cihazda doğrulanmadı)

| Madde | Durum |
|---|---|
| Gezi modeli | `Trip`: ülke, yıl, ay, gün sayısı, şehirler, tür, puan, not. Bir ülkeye birden çok gezi eklenebilir. Gezi eklenince ülke "gezildi" yapılır. |
| Eski veri | Gezisi olmayan her gezilmiş ülke için bir kez otomatik gezi üretilir (`legacy-XX`). Kullanıcı o geziyi silerse yeniden oluşturulmaz (`seeded` listesi). |
| Kayıt ve senkron | Yerelde kaydedilir, bulut yazmaları outbox kuyruğundan gider. `trips` tablosu için SQL `schema.sql` §10'da. Tablo yoksa uygulama yerel gezilerle çalışmaya devam eder. Çakışmada `updatedAt`'i yeni olan kazanır. |
| Seyahat Günlüğü | Ana Sayfa'daki seviye kartından ve Pasaport'taki düğmeden açılır: **Geziler** (yıllara göre zaman çizelgesi), **İstatistik** (seviye, yıllık hedef, ülke/gezi/gün/yıl kartları, yıl grafiği, en çok gidilenler, ilk/son gezi, kıta ilerlemesi), **Rozetler**. |
| Gezi editörü | Ülke seçimi (veya ülkeden açılınca sabit), yıl, ay, gün, şehirler, tür, 5 yıldız, not. Düzenleme ve silme var. Ülke detay sheet'inde o ülkenin gezileri listelenir. |
| Seviyeler | 5 seviye (Yeni Gezgin → Efsane Gezgin), ülke sayısına göre. |
| Rozetler | Hazır olan `AchievementBadge` bağlandı, 3 yeni gezi rozeti eklendi (Geri Dönen, Deneyimli Gezgin, Uzun Yol). Rozet renkleri uygulama paletine çekildi. Yeni rozet açılınca üstten bildirim şeridi ve konfeti çıkar. İlk çalıştırmada eski rozetler için bildirim çıkmaz. |
| Yıllık hedef | "Bu yıl kaç yeni ülke" hedefi (günlük > İstatistik), ilerleme çubuğuyla. |
| Testler | 35 test geçiyor (istatistik, seviye, eski gezi üretimi, rozet kuyruğu, hedef, eşzamanlı yazma, senkron birleştirme). |

**Bilinen sınırlar / dikkat:**
- **Yıl bilinmeyen ülkeler:** Onboarding'de seçilen ülkeler için yıl sorulmadığından bunlara "bu yıl" yazılıyor. Yıllık hedef ve grafik bu yüzden şişebilir. Çözüm önerisi: onboarding'de ülke işaretlerken yılı boş bırakmak ve geziyi "yıl bilinmiyor" saymak.
- **Bulut tablosu:** `trips` tablosu `schema.sql` çalıştırılana kadar oluşmaz, o zamana kadar geziler yalnızca cihazda durur.
- **Doğrulanmayanlar:** rozet bildirim şeridi ve konfeti cihazda gözle görülmedi (mantığı testle doğrulandı), ülke detay sheet'indeki gezi listesi ve gezi düzenleme/silme akışı açılıp denenmedi, koyu temada günlük ekranına bakılmadı.

### Faz 3 — içerik derinliği (bir kısmı yapıldı)

| Madde | Durum |
|---|---|
| Ülke bilgileri | 193 ülke için başkent (TR/EN), dil(ler), para birimi, telefon kodu, trafik yönü, yüzölçümü, denize kıyısı. Kaynak: mledoze/countries (ODbL), Türkçe başkent adları Wikidata (CC0). Veri `src/data/countryFacts.ts` içinde, **elle düzenlenmez**; `node scripts/build-country-facts.mjs` ile yeniden üretilir. |
| Vize (T.C. pasaportu) | 190 ülke için vizesiz / koşullu / kapıda / elektronik izin / e-Vize / vize gerekli + kalış süresi. Kaynak: Vikipedi "Visa requirements for Turkish citizens" (CC BY-SA), revizyon numarası kayıtlı. Karışık kayıtlar ("eVisa / kapıda vize") daha sıkı koşul olarak sınıflanır. PS, TW ve TR için veri yok. Schengen (29) ve AB (27) üyeliği elle yazıldı ve testle sayıları doğrulanıyor. |
| Ülke detayı | Detay sheet'inde "Giriş koşulları" (pasaportla, kalış süresi, Schengen/AB, tarih ve uyarı notu) ve "Ülke bilgileri" kartları. |
| Keşfet > Tüm Ülkeler | Rotalar / Tüm Ülkeler anahtarı. 193 ülke, arama (Türkçe harf duyarsız, başkentte de arar), vize filtresi (Vizesiz / Kapıda–e-Vize / Vize gerekli), Schengen, kıta, 30'ar sayfalama, gezilen ülkelerde nokta. Satıra dokununca ülke detayı açılır. |
| Testler | 47 test: veri seti her katalog ülkesini kapsıyor, başkent/dil/para birimi boş değil, ham Wikidata kimliği (Q123) yok, Schengen ve AB sayıları, bilinen olgular. |

**Bu fazda yapılmayanlar:**
- **Ne zaman gidilir / iklim:** İyi bir kaynak kurmadım (ülke merkez koordinatı büyük ülkeler için yanıltıcı, başkent koordinatı veri setinde yok). Open-Meteo ile başkent koordinatları eklenerek yapılabilir.
- **Rota sayısı 18'de kaldı.** Yazılı rota/mekan içeriği editoryal emek ister; ürettirip doğrulatmadan eklemedim.
- **Saat dilimi, priz tipi, kısa kelime listesi, bütçe seviyesi:** veri kaynağı yok, eklenmedi.
- **Kaydırarak keşif ve koleksiyonlar:** yapılmadı.

**Dikkat:** Vize verisi Vikipedi'den alınıyor ve ben tek tek doğrulamadım. Uygulama bunu tarihle ve "resmi kaynaktan kontrol et" uyarısıyla gösteriyor. Yanlış vize bilgisi kullanıcıyı zor durumda bırakabilir, bu yüzden yayından önce en azından en çok gidilen 20-30 ülkeyi resmi kaynaklarla elle karşılaştırmanı öneririm.

### Faz 4 — anılar ve paylaşım (kod bitti, bir kısmı cihazda doğrulanmadı)

| Madde | Durum |
|---|---|
| Damgalar | Her ülke için SVG damga (daire, oval, yuvarlak dikdörtgen, sekizgen; eğim, çift çerçeve, aşınmış kenar). Görünüm ülke koduna göre sabit, aynı ülkeye tekrar gidince gezi kimliğiyle farklılaşır. Günlükte yeni **Damgalar** sekmesi (pasaport sayfası ızgarası). Durum rengi: gezilen mavi, yaşanan yeşil. |
| Damga animasyonu | Gezi veya ülke eklenince damga büyük gelip yaylanarak "basılır", ağır haptic, kısa süre kalır, solar. Rozet şeridi ve konfeti de aynı katmanda. iOS'ta açık modal arkadakileri örttüğünden her modal kendi katmanını bağlar, yalnızca en üstteki çizer. |
| Gezi fotoğrafları | Gezi başına en çok 6 fotoğraf, galeriden seçilir, uygulamanın kendi klasörüne kopyalanır, **yalnızca cihazda** durur (buluta gitmez). Yalnızca dosya adı saklanır (iOS güncellemede uygulama yolu değişir). Kaydetmeden kapatılırsa eklenenler silinir, gezi silinirse fotoğrafları da silinir. Zaman çizelgesinde küçük resimler. |
| Yıl özeti | Günlük > İstatistik > "Yıl özetini paylaş": yeni ülke sayısı, bayraklar, ülke/gezi/gün sayıları, en çok gidilen ülke. Her zaman koyu, sabit renkli kart (tema fark etmez), PNG olarak paylaşılır. |
| Veri dışa aktarma | Hesap Yönetimi > "Verilerimi dışa aktar": JSON (profil özeti, ülkeler, geziler, fotoğraf adları) veya CSV (geziler). CSV'de formül enjeksiyonuna karşı `=`, `+`, `-`, `@` ile başlayan metinler korunur. E-posta ve pasaport no dışa aktarılmaz. |
| Testler | 57 test. Yeni: damga stilinin deterministik ve sınırlı olması (test, işaretli kaydırma yüzünden eğimin ±36° çıktığı bir hatayı yakaladı, düzeltildi), CSV/JSON biçimi, yıl özeti hesapları, fotoğrafların bulut birleştirmesinde korunması. |

**Doğrulananlar (cihazda):** Damgalar sekmesi, Gezi editöründe Fotoğraflar bölümü, İstatistik'te "Yıl özetini paylaş" düğmesi, yıl özeti kartı, gezi kaydı.

**Doğrulanamayanlar:**
- **Damga animasyonu:** ~2 sn sürüyor, ekran görüntüsü gecikmeli geldiği için karede yakalayamadım. Günlükte yeni gezi görünüyor ve log'da hata yok, ama animasyonu gözle görmedim.
- **Fotoğraf seçme ve kopyalama:** Simülatörün galerisinde kullanıcıya ait kişisel görüntüler var, bunlardan seçmedim; seçici açıldı ve hiçbir şey seçilmeden kapatıldı. Kopyalama, küçük resim ve silme akışı çalıştırılmadı.
- **Paylaşım ve dışa aktarma:** Paylaşım sayfası açılmadı, JSON/CSV dosyası cihazda üretilmedi. Biçim mantığı testle doğrulandı.

**Bilinen sınırlar:** Fotoğraflar buluta gitmediği için cihaz değişince gezi fotoğrafları kaybolur (yedekleme yok). Yıl özetindeki "yeni ülke" sayısı, onboarding'de yıl sorulmadan eklenen ülkeleri o yıla yazar (Faz 2'deki aynı sınır).

### Faz 5 — planlama ve bildirimler (kod bitti, bir kısmı doğrulanmadı)

| Madde | Durum |
|---|---|
| Seyahat Planlayıcı | Ana Sayfa'daki kart (sıradaki gezinin geri sayımı, plan yoksa davet) ve Pasaport'taki düğmeyle açılır. Plan: ülke, başlangıç/bitiş tarihi, şehirler, not. Yaklaşan, yolculukta ve tamamlanan planlar ayrı sıralanır. Hedef (istek listesi) ülkelerin detay sheet'inde "Gezi planla" düğmesi var. |
| Tarih girişi | Yerel tarih seçici kütüphanesi kurulu olmadığı için yıl/gün adım düğmeleri ve ay çipleri (`DateField`). Gün ayın uzunluğuna göre sınırlanır, geçersiz tarih (30 Şubat) oluşamaz. |
| Hazırlık listesi | 5 şablon (Genel, Plaj, Şehir turu, Kış, Doğa), kendi maddeni ekleme, uzun basarak silme, ilerleme çubuğu. **Giriş koşullarına göre** madde ekleme: vize gerekliyse "vize başvurusu", e-Vize, elektronik izin, kapıda vize, Schengen için belge maddeleri (Faz 3'teki vize verisinden). Şablon iki kez eklenirse tekrarlanmaz ve işaretli maddeler korunur. |
| Bütçe | Kalem + tutar, tutarlar Türkçe ("1.250,50") ve İngilizce ("1,250.50") biçiminde girilebilir, 6 para birimi etiketi, toplam. **Kur çevrimi yok**: tutarlar yazıldığı gibi toplanır (güvenilir bir kur kaynağı eklemedim), arayüzde de böyle yazıyor. |
| Bildirimler | Gezinden 1 hafta ve 1 gün önce 09:00'da; hazırlık listesi eksikse 3 gün önce. Geçmişte kalan an için bildirim kurulmaz. Liste veya tarih değişince eskileri iptal edilip yenileri kurulur, plan silinince ve çıkış/hesap silmede iptal edilir. İzin ilk planda, nedeni açıklayan bir pencereyle sorulur (sistem penceresinden önce). İzin verilmezse plan yine kaydedilir, ekranda "Hatırlatıcılar kapalı" ve açma düğmesi görünür. |
| Planı geziye çevirme | Plan bittikten sonra "Gezi günlüğüne ekle": yıl, ay, gün sayısı, şehirler ve not günlükteki gerçek bir geziye dönüşür (damga animasyonuyla), plan silinir. |
| Testler | 81 test. Yeni: tarih/gün sayımı (artık yıl, yaz saati değişimi), plan evreleri ve sıralama, tutar ayrıştırma, şablonlar, giriş maddeleri, hatırlatıcı zamanları (geçmiş atlanır), plan deposunun bildirimleri planlama/iptal etme davranışı (izin yoksa, tarih değişince, liste değişince, silince, çıkışta). |

**Cihazda doğrulananlar:** Ana Sayfa'da Planlayıcı kartı ve geri sayım, plan oluşturma (Arjantin, 28 Kasım), uygulamanın izin penceresi ve iOS sistem izin penceresi, plan detayı ("30 gün kaldı", "hatırlatıcılar açık"), "Genel" şablonu (8 madde), madde işaretleme (1/8, ilerleme çubuğu).

**Doğrulanamayanlar:**
- **Bildirimlerin iOS'ta gerçekten kurulduğu ve zamanında çaldığı:** simülatörden bekleyen bildirim listesine bakamadım ve gelecekteki bir tarihi bekleyemem. Zamanlama mantığı ve plan deposunun çağrıları testle doğrulandı (sahte bildirim servisiyle), `expo-notifications`'ın kendisi gerçek cihazda denenmedi.
- **Bütçe ekleme, giriş maddeleri, gezi geçmişe dönünce "günlüğe ekle", plan düzenleme/silme** arayüzde denenmedi.
- Arama kutusuna yazma denemem (simülatöre metin gönderme) yansımadı, ülkeyi listeden seçtim; planlayıcının ülke arama kutusunu elle denemedim.

**Kapsam dışı bırakılanlar (nedenleriyle):**
- **Belge kasası (Face ID ile):** `expo-local-authentication` kurulu değil, native modül olduğu için yeniden derleme gerektirir. Ayrıca bilet/vize PDF'lerini saklamak hassas veri, doğru şifreleme ve yedekleme kararı olmadan eklemedim.
- **iOS widget'ları:** Ayrı bir Xcode hedefi (WidgetKit) gerektirir. Expo'nun yerleşik desteği yok, CNG'ye dönüş kararından (PLAN §9) sonra yapılmalı.
- **"Geçen yıl bugün" bildirimi:** Gezilerde yalnızca yıl/ay saklanıyor, gün yok, bu yüzden doğru günde tetiklenemez.
- **Planların buluta senkronu:** Planlar şimdilik yalnızca cihazda (fotoğraflar gibi). Telefon değişirse planlar ve hazırlık listeleri kaybolur. Bunun için `planned_trips` tablosu ve outbox işlemleri gerekir.


### Faz 6 ve kalan işler (kapsam: Pro, sosyal ve Android hariç, kararlar §9)

Bu bölüm kalan her maddeyi ya yapıldı ya da gerekçesiyle yapılmadı olarak kapatır.

| Madde | Durum |
|---|---|
| Yılı bilinmeyen geziler | Onboarding'de eklenen ülkeler artık "bu yıl" yazılmıyor. Yılsız gezi (`year: ''`) olarak tutuluyor, günlükte "Yıl bilinmiyor" altında. Yıl grafiği, ilk/son gezi ve "yeni ülke" sayımı yalnızca tarihli gezilerden hesaplanıyor. `enrichCountry` ve `countryToRow` artık yıl uydurmuyor. **Önceden onboarding'den eklenmiş ülkelerin yılı kayıtlı kaldı.** |
| Planların buluta senkronu | `planned_trips` tablosu (`schema.sql` §11), outbox işlemleri, `updatedAt` ile birleştirme. Bildirim kimlikleri cihaza özeldir, senkronlanmaz; yeni cihazda hatırlatıcılar izin varsa yeniden kurulur. |
| Katalog eksikleri | Katalogda Güney Kore, Kuzey Kore ve Fildişi Sahili yoktu (193 → 196 ülke). Eklendi, ülke bilgileri ve vize verisi yeniden üretildi. |
| İklim ve saat dilimi | `scripts/build-country-climate.mjs` her ülkenin başkenti için aylık ortalama sıcaklık ve yağışı (NASA POWER) ve saat dilimini (Open-Meteo) üretir: `src/data/countryClimate.ts`, 196 ülke. Ülke detayında "İklim ve zaman": tahmini en uygun aylar (konforlu sıcaklık ve az yağış), 12 aylık sıcaklık/yağış grafiği, UTC ofseti, Türkiye ile saat farkı. **Yalnızca başkent**, büyük ülkelerde bölgeler farklıdır, yaz saati hesaba katılmaz; ekranda belirtiliyor. |
| Rotalar 18 → 65 | `src/data/moreDestinations.ts`: 47 yeni ülke için 2 gezilecek yer, 1 yemek yeri, kısa ipucu (TR/EN, harita bağlantılı). Fotoğraf eklenmedi (doğrulayamadığım Unsplash bağlantıları uydurmamak için), kart bayraklı gradyanla çizilir. Yalnızca bilinen yerler yazıldı; **çalışma saatleri ve fiyatlar doğrulanmadı.** Keşfet'e Okyanusya filtresi eklendi. |
| Keşfet | Hazır koleksiyonlar (Vizesiz Avrupa/Asya/Amerika, kolay giriş + gitmediklerim, gitmediğim Schengen), "Gitmediklerim" filtresi ve **Kartlarla Keşfet** (kaydırarak istek listesine ekleme) bağlandı. |
| Yıl dönümü bildirimi | "N yıl önce bu ay: Japonya" bildirimi, gezinin ayının 1'inde 10:00. Günlük > İstatistik'te açma anahtarı, varsayılan **kapalı**, açınca izin istenir. Gezide gün saklanmadığı için tam gün yerine ayın 1'i. En fazla 12 bildirim. Çıkışta iptal edilir. |
| Belge kasası | Plan detayında "Belgeler": bilet/vize fotoğrafı veya PDF (en çok 12 belge, 15 MB). Yalnızca cihazda, buluta gitmez. Açmak için Face ID veya parola ister; cihazda parola/biyometri yoksa belge eklenmez. Plan silinince belgeleri de silinir, **çıkış ve hesap silmede tüm kasa temizlenir**. |
| Expo Router | `expo-router` kuruldu, giriş `expo-router/entry`. `atls://country/JP` derin bağlantısı ülke sheet'ini açar. Ana ekran hâlâ tek sayfa, modallar rotaya bölünmedi. |
| `ios/` → CNG | `ios/` git'ten çıktı. Temiz `prebuild` ile derlendi ve çalıştırıldı. `.npmrc` içinde `legacy-peer-deps=true` var (expo-router'ın react-dom eş bağımlılığı çakışıyor), CI ile yerel kurulum aynı kuralı kullanıyor. |
| TypeScript | Kalan tüm `.js` dosyaları `.ts/.tsx`'e taşındı (servisler, veri dosyaları, 9 bileşen). `tsc` temiz. Taşırken iki gerçek hata çıktı: `StyleSheet.absoluteFillObject` RN 0.86'da yok (iki kaplama stilsiz kalıyordu), `Haptics.ImpactFeedbackStyle.Selection` yok (geri bildirim çalışmıyordu). İkisi düzeltildi. Bileşen propları ve `t` (çeviri) nesnesi yer yer gevşek (`Record<string, any>`) bırakıldı. |

**Bilerek yapılmayanlar (gerekçeleriyle):**
- **Pro abonelik, genel profil/arkadaşlar:** karar §9.
- **Android:** karar §9.
- **Dil ekleme (DE/ES/FR):** hedef kitle önce Türkiye; doğrulanmamış çeviri yayınlamak yerine bırakıldı.
- **Claude API ile öneri, fotoğraftan gezi önerisi:** sunucu tarafı anahtar yönetimi ve fotoğraf konumu için ek izin gerekir, §9 #7 (konum/fotoğraf yalnızca cihazda) ile çelişmeden yapılamaz.
- **iOS widget'ları:** ayrı WidgetKit hedefi gerekir. CNG'de config plugin ile elle Swift eklemek kırılgan; ayrı bir iş olarak bırakıldı.
- **Sentry / analitik:** DSN ve hesap sahibi tarafından açılmalı, ayrıca gizlilik politikası güncellemesi gerekir.
- **Modalların tam rotaya bölünmesi:** büyük davranış riski; yalnızca derin bağlantı eklendi.
- **Fotoğraf ve belge yedeği:** buluta gitmez (gizlilik kararı). Telefon değişirse kaybolur.

### Tasarım turu (font ve temizlik)

| Madde | Durum |
|---|---|
| Font | Fraunces yerine **Instrument Serif** (normal) ve **Instrument Serif İtalik**. Ailede yalnızca bu iki stil var, bu yüzden başlıklar ağırlıkla değil boyutla ayrışıyor; tüm başlık boyutları %25 büyütüldü. İtalik: alt başlıklar ve başlıkların son kelimesi (`Heading` bileşeni, `src/components/ui/Heading.tsx`: "Dünya *Pasaportun*"). Gövde metni iOS'un sistem fontunda (SF Pro) kaldı; Inter'e geçmek her `Text` stilinde ağırlık eşlemesi gerektirir ve görsel kazancı yok denecek kadar az. İtalik yalnızca büyük boyutta ve cümle başına bir vurgu için kullanılmalı. |
| Kaldırılanlar | Kartlarla Keşfet (`SwipeDiscoveryCard` silindi), rozetteki yarım görünen tik, pasaport rengi seçici. |
| Sırada | Açık temada okunabilirlik (cam kartlar, soluk metin), Keşfet geçiş hızı, mühür/son girişler yeniden tasarımı, Rotalar 2.0. |

### Tasarım turu 2 (okunabilirlik, hız, mühürler, Rotalar 2.0)

| Madde | Durum |
|---|---|
| Okunabilirlik | Açık temada cam kartın üstündeki örtü %38'den %80'e çıktı (`glass.scrimOpacity`), soluk ve ikincil metin renkleri koyulaştı, koyu temada da `muted/faint` düzeltildi. `src/theme/__tests__/contrast.test.ts` iki temada tüm metin rollerini WCAG AA'ya (4,5:1; dekoratif için 3:1) göre denetler. |
| Keşfet hızı | Üç sekmeyi saran `App.tsx` içinde satır içi fonksiyonlar `React.memo`'yu boşa çıkarıyordu; sekme değişince Ana Sayfa ve Pasaport (1.700 satır) yeniden çiziliyordu. Tüm callback'ler `useCallback` oldu. Rota listesi 65 kart yerine 8 kartla açılıyor, "Daha fazla göster" ile artıyor. **Cihazda ölçülmedi**, simülatör geliştirme derlemesi güvenilir süre vermiyor. |
| Mühürler | Ana Sayfa'daki eğik mühür kartları kalktı; yerine düz "Son geziler" listesi (bayrak, ülke adı, tarih). Günlük > Damgalar'daki mühür tek ve düz bir tasarım oldu: tek renk çerçeve, ülke adı, ülke kodu (Instrument Serif), çizgi, tarih. Eğim, çift çerçeve, aşınmış kenar ve rastgele şekiller kaldırıldı (`utils/stamp.ts` silindi). |
| Rotalar 2.0 | **Bu ay nereye?**: iklim ve vize verisinden, henüz gitmediğin ülkeler (kolay giriş önce). Hızlı filtreler (Bu ay uygun, Vizesiz, Gitmediklerim) + kıta + arama. İki sütunlu fotoğraflı kart ızgarası. Karta dokununca tam sayfa rota: fotoğraf, giriş/en uygun aylar/saat/para şeridi, gezilecek yerler ve yemek (Apple/Google Maps), ipucu, **Gezi planla** (sayfanın içinde plan editörü), istek listesine ekle, ülke sayfası. |
| Fotoğraflar | 42 yeni rota için Wikimedia Commons fotoğrafı (`scripts/build-route-photos.mjs` → `src/data/routePhotos.ts`), yalnızca CC0 / CC BY / CC BY-SA / kamu malı; yazar ve lisans fotoğrafın altında gösterilir. Lisansı uygun olmayan 5 rota (Çekya, Kıbrıs, Güney Kore, BAE, Azerbaycan) gradyan + bayrakla gösterilir. Fotoğraflar çalışma anında Commons'tan yüklenir (uygulama paketine girmez). |
| Öneri listesi | "Bu ay nereye?" önerilerinden savaş/seyahat uyarısı olan ülkeler çıkarıldı (`NOT_SUGGESTED`, elle yazılmış liste, güncel tutulmalı). Tüm Ülkeler listesinde hepsi duruyor. |

### Tasarım turu 3 (kalan ekranlar)

- Pasaport sekmesindeki eğik "vize kartı" mühürleri kaldırıldı; Günlük ile aynı düz mühür kullanılıyor. Mühür kutusu dikeyde kırpıldı (üst/alt boşluk fazlaydı). Yeni gezi eklenince çıkan damga animasyonu artık eğik değil, düz oturuyor.
- Ana Sayfa "Son geziler > Tümünü gör" Pasaport yerine Günlük'e gidiyor.
- Paylaşım kartı (başlık, "atls." logosu), giriş ve onboarding başlıkları (`Heading`) ve onboarding yüzde rakamı Instrument Serif'e geçti. Yüzde rakamı satır yüksekliği yüzünden üstten kırpılıyordu, düzeltildi.
- Simülatörde açık ve koyu temada Ana Sayfa, Keşfet, rota sayfası, Pasaport, Günlük (4 sekme), yıl özeti, paylaşım kartı, planlayıcı, onboarding (4 adım) ve hesap ekranı gözle kontrol edildi.

**Mühür yeniden tasarlandı (bilet küpürü):** Önceki çerçeve + ülke kodu tasarımı beğenilmedi. `StampView` artık delikli bir bilet kupürü: solda bayrak, giriş/ikamet etiketi, ülke adı (Instrument Serif) ve tarih, ortada kesik çizgi, sağda ülke kodu ve yıl. Renk yalnızca gezilen (mavi) / yaşanan (yeşil) için değişiyor. Pasaport, Günlük, yıl özeti ve yeni gezi animasyonu aynı bileşeni kullanıyor. Yılı bilinmeyen gezilerde tarih alanı boş kalır.

**Mühür özelliği tamamen kaldırıldı:** `StampView`, Günlük > Damgalar sekmesi, Pasaport'taki "Resmi sınır mühürleri" bölümü, yeni gezi eklenince çıkan büyük damga animasyonu (yerine yalnızca konfeti kaldı), ilgili çeviri anahtarları ve "mühürle/damgala" gibi metinler ("Pasaporta Ekle", "İlk Ülkeni Ekle" vb.) silindi veya değiştirildi. Rozet bildirimi ve konfeti duruyor. `utils/stamp.ts` daha önce silinmişti.

### Tasarım turu 4 (tarih, harita, Ana Sayfa, boşluklar, Amerika filtresi)

| Madde | Durum |
|---|---|
| Amerika filtresi | Katalog Amerika'yı "North America" ve "South America" diye ikiye böler, filtreler ise "Americas" arıyordu; Keşfet > Rotalar (ve onboarding'in gittiğin ülkeler adımı) hiçbir şey bulamıyordu. `src/data/continents.ts` ortak eşlemeyi (`continentGroup`, `inContinent`) tek yerde tutuyor. Rotalar, Tüm Ülkeler, onboarding ve kıta ilerleme kartı artık bunu kullanıyor. Testle korunuyor (her ülkenin bir grubu var, Amerika'da vizesiz ülke var). |
| Tarih seçici | Yıl/gün adım düğmeleri ve kaydırmalı ay çipleri kalktı. **Ülke eklerken, durum değiştirirken, gezi eklerken:** `MonthYearPicker` (yıl okları + 4x3 ay ızgarası, gelecek aylar kapalı). **Gezi planlarken:** `DateField` tek satır ("29 Kasım 2026"), dokununca `CalendarPicker` (Pazartesi başlangıçlı aylık takvim) açılır, gün seçilince kapanır; başlığa dokununca ay/yıl atlama. Bitiş tarihi başlangıçtan önce seçilemez, başlangıç ileri alınırsa bitiş onunla gelir. |
| Harita | `WorldMap` baştan yazıldı. İki parmakla yakınlaştırma parmakların ortasına göre çalışır, tek parmakla kaydırma, çift dokunuşla yakınlaştırma, +/- ve sıfırla düğmeleri. Zoom SVG `viewBox` ile yapılıyor (her seviyede keskin); ülke şekilleri `memo` içinde, hareket sırasında yeniden çizilmiyor. Görünüm hesabı `utils/mapView.ts` içinde ve testli (haritanın dışına çıkılamaz, tutulan nokta yerinde kalır). Tam ekran harita sayfası yeniden düzenlendi: üstte başlık ve renk açıklaması olan filtre çipleri, harita kalan alanı doldurur, seçilen ülke için alt kart; üst/alt taşma yok. |
| Harita renkleri | Gezilen **zümrüt yeşili**, yaşanan **mavi**, hedef altın (önceden tersiydi: gezilen mavi, yaşanan yeşil). Açık ve koyu temada okyanus ayrı renk (`map.ocean`), kara ve sınır renkleri yeniden ayarlandı. Rozetler, mühür dışı tüm durum etiketleri ve filtreler aynı token'ı kullanıyor. |
| Ana Sayfa | Sıra: karşılama, **ülke ekle** (en sık eylem, en üstte), ülke kartı, harita ve sayaçlar, seviye, planlayıcı, son geziler, **Gezgin Rehberi** (en altta). Aralar tek `gap` ile yönetiliyor, tek tek `marginTop` değerleri silindi. |
| Boşluk ve responsive | `theme/spacing.ts` içine `layout` token'ları eklendi (`screen` 20, `section` 14, `tabBarClearance` 112, `card` 16). Ana Sayfa ve Pasaport 22, Keşfet/Günlük/Planlayıcı 20 kullanıyordu; sekme değişince içerik yana kayıyordu. Hepsi artık aynı değeri kullanıyor. |

**Yapılmayanlar / bilinen sınırlar**
- Onboarding ve giriş ekranları kendi yatay boşluklarını (20/24) kullanıyor, `layout` token'ına bağlanmadı; ayrı ve kısa bir temizlik işi.
- Kartların iç boşlukları (16/18/20/22) hâlâ tek tek yazılı; `layout.card` yalnızca yeni bileşenlerde kullanılıyor.
- Harita cihaz döndürmeye göre yeniden boyutlanır ama uygulama yalnızca dikey çalışıyor.
- Tarih seçicilerin hepsi simülatörde açık temada gözle kontrol edildi, koyu temada edilmedi.

### Tasarım turu 5 (harita hareketi ve ayrıntısı, takvim)

| Madde | Durum |
|---|---|
| Harita hareketi | Telefonda yavaş ve zordu: her parmak hareketinde React yeniden çiziyor, hareketi JS'te PanResponder hesaplıyordu; ayrıca iOS sayfa kartı aşağı kaydırmayı kapatma sanıyordu. Şimdi parmak hareketi yalnızca Reanimated paylaşılan değerlerini (ölçek ve kayma) günceller, çizimi UI iş parçacığı taşır; React hiç çalışmaz. Parmaklar kalkınca çizim yeni zoom'da keskin yeniden çizilir ve harita bırakma hızına göre kayarak sınırların içine oturur. Dokunuşlar kapta (okyanus dahil) okunur, iki parmak ve tek parmak aynı mantıkla çalışır. Tam ekran harita artık tam ekran sunum (sayfa kartı kapatma hareketi yok). Yeni native modül gerekmedi. |
| Harita ayrıntısı | Eski şekiller 70 KB'lık kaba veri; zoom'da köşeli görünüyordu. `scripts/build-world-map.mjs` Natural Earth 50m verisinden (kamu malı) 237 ülkeyi yeniden üretir (`worldMapPaths.ts`, ~1 MB). Doğal Earth izdüşümü; Antarktika yok. Katalogda şekli olmayan tek ülke Tuvalu. Maksimum zoom 12'den 10'a indi. |
| Ülke kartı | `+` ve `X` yan yanaydı. Artık `X` başlık satırında küçük, eylem düğmesi altta tam genişlikte ("Ülke sayfasını aç" / "Haritama ekle"). |
| Takvim | Yıl okuna basınca seçici ay seçildi sanıp kapanıyordu. Yalnızca ay dokunuşu kapatır; yıl art arda atlanabilir. Seçici açıkken ay okları gizlenir. |

**Sınırlar:** Yakınlaşma sırasında parmak altındaki çizim geçici olarak bitmap gibi ölçeklenir, parmaklar kalkınca keskinleşir. Gerçek cihazda ölçülmedi; simülatörde iki parmak, kaydırma, seçim ve takvim denendi.
