# atls. Widget planı

Tarih: 12 Kasım 2026 · Sürüm: 1.3.0 (henüz yayınlanmadığı için aynı sürümde) · Durum: **uygulandı (cihazda denenmedi)**, tasarımlar onaylandı

Doğrulama etiketleri: **[doküman]** Expo SDK 57 `expo-widgets` dokümanından okudum, **[kodda gördüm]** bu repoda okudum, **[doğrulanmadı]** denenmesi gereken varsayım.

---

## 1. Neden widget, ne için

Uygulamanın en zayıf yanı "kullanıcı bir gün açmazsa unutur". Widget uygulamayı açmadan günlük bir hatırlatma ve küçük bir ödül verir:

| Hedef | Nasıl |
|---|---|
| Günlük geri dönüş | Gizli Ülke serisi ve "bugün oynadın mı" ana ekranda görünür |
| Gurur ve paylaşım | Ülke sayısı, dünya yüzdesi ve bayraklar ekran görüntüsüne girer |
| Gezi heyecanı | Planlanan gezi için geri sayım |
| Kilit ekranı | Seri ve ülke sayısı, uygulamayı açmadan görünür |

Başarı ölçütü (Sentry/analitik olmadığı için dolaylı): Gizli Ülke'nin ardışık gün oynanma oranı, App Store yorumlarında widget geçmesi. İleride ölçmek istersen gizlilik etiketi güncellenmeli.

---

## 2. Teknoloji seçimi

**`expo-widgets` (SDK 57, sürüm ~57.0.28) [doküman].**
- Native Swift yazmadan, `@expo/ui/swift-ui` bileşenleriyle widget ve Live Activity yazılır. Config plugin WidgetKit hedefini `expo prebuild` sırasında üretir, yani CNG düzenimizle uyumlu (`ios/` git'te yok, `.gitignore`'da).
- Expo Go'da çalışmaz, geliştirme derlemesi gerekir. Zaten Skia ve Sentry yüzünden Expo Go kullanmıyoruz.
- Bağımlılıklar: `@expo/ui` ve `@expo/plist`.

**Alternatif:** `@bacons/apple-targets` + elle Swift/SwiftUI. Daha çok kontrol verir (özel font, gelişmiş düzen), ama Swift bakımı ve ayrı veri köprüsü (App Group UserDefaults için native modül) gerekir. Plan: önce `expo-widgets` ile başla; engelleyici bir sınır çıkarsa (aşağıda §8) bu yola geç.

### Çalışma modeli ve kısıtlar [doküman]
- Widget kodu **izole bir çalışma zamanında** çalışır: React hook, state, context, async, `import` yok. Sabitler widget fonksiyonunun **içinde** tanımlanmalı.
- Sadece `@expo/ui/swift-ui` bileşenleri çalışır; `react-native` `View`/`Text` çalışmaz.
- Veri **props** ile gelir: uygulama `updateSnapshot(props)` veya `updateTimeline([{date, props}])` çağırır. Widget kendi başına veri çekmez.
- Resim paylaşmak için dosya, paylaşılan App Group klasörüne (`widgetsDirectory`) yazılmalı.
- Düğme ile etkileşim ve kullanıcı yapılandırması iOS 17+ gerektirir. Uygulamamızın minimum hedefi iOS 16.4 [kodda gördüm]; bu planın hiçbir özelliği etkileşime ihtiyaç duymuyor, yani hedefi yükseltmiyoruz.

**Sonuç:** widget'ın göstereceği her şey (metinler, renkler, bayrak emojileri, sayılar, dil) uygulamada hesaplanıp props olarak gönderilir. Widget "aptal bir çizim katmanı" olur. Bu iyi bir şey: iş mantığı test edilebilir TS'te kalır.

---

## 3. Widget'lar ve tasarımları

Ortak görsel dil: uygulamanın koyu teması. Zemin `#090B0E` → `#131922` hafif degrade, vurgu altın `#E5A93C`, metin beyaz, ikincil metin `rgba(255,255,255,0.6)`. Gizli Ülke ve ülke sayısı rakamları büyük ve kalın. [doğrulanmadı: Instrument Serif fontunu widget uzantısına gömüp gömemeyeceğimiz; yoksa sistem serif'i kullanılır.]

### W1. "Pasaport" (systemSmall, systemMedium)

**Small (2x2)**
```
┌────────────────┐
│ atls.          │
│                │
│   47           │   ← ülke sayısı, büyük, altın
│   ülke         │
│ dünyanın %24'ü │   ← ikincil metin
└────────────────┘
```
**Medium (4x2)**: solda aynı sayı bloğu, sağda en son işaretlenen 6 ülkenin bayrağı 3x2 ızgarada, altında "5 kıta · 12 gezi".
**Dokunma:** uygulamayı ana ekranda açar.
Veri: `useCountryStore` (ziyaret edilen/yaşanan sayısı, kıta sayısı), `useTripStore` (gezi sayısı), yüzde `getStats()`'ten [kodda gördüm].

### W2. "Gizli Ülke" (systemSmall + accessoryCircular + accessoryRectangular + accessoryInline)

**Small**
```
┌────────────────┐
│ GİZLİ ÜLKE #12 │
│   🔥 5         │   ← seri
│ Bugünü oyna →  │   ← oynanmadıysa; oynandıysa "Bugünkü ülke ✓ 3/6"
└────────────────┘
```
Durumlar: `unplayed` (altın vurgu, "Bugünü oyna"), `won` ("Buldun ✓ · 3/6", yeşil tik), `lost` ("Bugün olmadı · yarın yeni ülke"), `streakAtRisk` (dün kazanıldı, bugün oynanmadı: "Serini koru" + 🔥 soluk).
**Kilit ekranı:** `accessoryCircular` = seri sayısı ve alev; `accessoryRectangular` = "Gizli Ülke #12 · 🔥5 · oynanmadı"; `accessoryInline` = "🔥 5 · 47 ülke".
**Dokunma:** oyunu doğrudan açar. Uygulamada zaten `useLastNotificationResponse` ile bildirimden oyun açılıyor; aynı yol için bir derin bağlantı (`atls://game`) ve `src/app/+native-intent.tsx` içinde karşılığı gerekir [kodda gördüm: `+native-intent.tsx` şu an yalnızca `/atls/c` → `/compare` çeviriyor]. Widget'tan derin bağlantı açmanın `expo-widgets`'taki tam API'si dokümanın özetinde net değildi **[doğrulanmadı, ilk spike'ın birinci sorusu]**.

### W3. "Sonraki gezi" (systemSmall, systemMedium)

```
┌─────────────────────────┐
│ SONRAKİ GEZİ            │
│ 🇯🇵 Japonya      23     │   ← kalan gün, büyük
│ 14 Aralık         gün   │
└─────────────────────────┘
```
Plan yoksa: "Bir gezi planla" ve istek listesinden rastgele bir ülke önerisi (bayrak + isim).
Veri: `usePlanStore` planları, kalan gün için `daysUntil()` [kodda gördüm: `utils/planning.ts`]. Gezi günü geldiğinde "Bugün yola çıkıyorsun ✈️", sonrası "Hoş geldin" yerine otomatik bir sonraki plana geçer.

### (Sonraya) Live Activity: aktif gezi
Gezi günleri boyunca kilit ekranında "Japonya · 3. gün". Dokümanda `createLiveActivity` var **[doküman]**, ama bildirim/arka plan mantığı ve Apple'ın süre sınırı (8 saat aktif) yüzünden bu sürümün kapsamı dışında bırakıldı.

---

## 4. Veri akışı (uygulama → widget)

Yeni dosyalar:

| Dosya | Görev |
|---|---|
| `src/widgets/PassportWidget.tsx`, `GameWidget.tsx`, `TripWidget.tsx` | `'widget'` yönergeli çizim bileşenleri; yalnızca props okur |
| `src/widgets/widgetData.ts` | **Saf** fonksiyonlar: store durumundan widget props üretir (metinler TR/EN, durum seçimi, zaman çizelgesi). Test edilir |
| `src/services/widgetSync.ts` | Store aboneliği, debounce, `updateTimeline` çağrıları |

**widgetData.ts (saf, test edilebilir):**
- `passportProps(countries, trips, lang)` → `{ count, percent, continents, trips, flags: string[6], labels }`
- `gameProps(days, stats, lang, today)` → durum (`unplayed | won | lost`), seri (`liveStreak`), bulmaca no, tahmin sayısı
- `gameTimeline(days, stats, lang, now)` → **önümüzdeki 7 gün** için gün gece yarısında girişler. Kural: oynanmadıkça her yeni günde seri `liveStreak(stats, dayKey)` ile yeniden hesaplanır; yani kullanıcı uygulamayı açmasa bile 2. günde seri sıfırlanmış görünür. Bu yüzden widget "yalan söylemez".
- `tripProps(plans, lang, now)` → sonraki gelecek plan, kalan gün; zaman çizelgesi 30 günlük günlük girişler.

**widgetSync.ts tetikleyiciler:**
1. Uygulama açılışında ve ön plana gelince (`AppState`).
2. `useCountryStore`, `useTripStore`, `usePlanStore`, `useGameStore`, dil değişimi: 500 ms debounce.
3. Gizli Ülke sonuç anında (`useGameStore.guess` tamamlandığında) anında yenile.
`updateTimeline` ile ileri günlerin girişleri önceden yazıldığı için iOS'un widget yenileme bütçesine bağımlı kalmayız [**doğrulanmadı:** `updateTimeline` giriş sayısı sınırı ve iOS'un bütçe davranışı; spike'ta ölçülecek].

**Gizlilik:** veri yalnızca cihazdaki App Group'ta durur, ağa çıkmaz. Gizlilik sayfasına tek cümle ("Ana ekran widget'ları verini yalnızca cihazında gösterir") eklenebilir; zorunlu değil.

---

## 5. Yapılandırma ve derleme etkisi

`app.json` eklemesi (şema **[doküman]**):
```json
["expo-widgets", {
  "groupIdentifier": "group.com.atlas.passport",
  "widgets": [
    { "name": "PassportWidget", "displayName": "Pasaport", "description": "Ülke sayın ve dünya yüzden",
      "ios": { "supportedFamilies": ["systemSmall", "systemMedium"] } },
    { "name": "GameWidget", "displayName": "Gizli Ülke", "description": "Günlük seri ve bugünün oyunu",
      "ios": { "supportedFamilies": ["systemSmall", "accessoryCircular", "accessoryRectangular", "accessoryInline"] } },
    { "name": "TripWidget", "displayName": "Sonraki gezi", "description": "Gezine kalan gün",
      "ios": { "supportedFamilies": ["systemSmall", "systemMedium"] } }
  ]
}]
```
- **Yeni native hedef** (uzantı bundle ID'si varsayılan `com.atlas.passport.ExpoWidgetsTarget`) ve **App Group** (`group.com.atlas.passport`) gerekir. EAS, kimlik bilgilerini (provisioning profile, capability) hesabın üzerinden oluşturur; ilk derlemede Apple hesabı girişi ve App Group'un Developer portalda tanımlanması gerekir **[doğrulanmadı: EAS'ın uzantı için profili otomatik oluşturup oluşturmayacağı; Associated Domains için olduğu gibi]**.
- `runtimeVersion` politikası `appVersion`: bu değişiklik native olduğu için **`version` 1.5.0'a yükseltilmeli**, aksi hâlde 1.4.x binary'sine OTA ile widget kodu gitmeye çalışır. (CLAUDE.md'de bu uyarı var.)
- App Store gönderimi: uzantı aynı pakette gelir; ek inceleme maddesi yok. Ekran görüntülerine widget eklenebilir.

---

## 6. Aşamalar

| Aşama | İş | Çıktı / kabul ölçütü | Tahmin |
|---|---|---|---|
| **0. Spike** | Boş bir "Merhaba" widget'ı ekle, simülatörde dev derlemesinde göster | Şu sorular cevaplanır: (1) dokunma ile derin bağlantı açılıyor mu, (2) özel font gömülebiliyor mu, (3) `updateTimeline` kaç giriş alıyor, (4) EAS uzantı profilini kendisi oluşturuyor mu, (5) küre/Skia derlemesiyle çakışma var mı | 0,5-1 gün |
| **1. Veri katmanı** | `widgetData.ts` + testler (3 widget için props, zaman çizelgesi, TR/EN, kenar durumlar: oynanmamış, seri riski, plan yok, gezi bugün) | Jest yeşil, saf fonksiyonlar | 1 gün |
| **2. W2 Gizli Ülke** | Widget + kilit ekranı aileleri + derin bağlantı + `widgetSync` | Simülatörde: oyun oynayınca widget anında değişir; ertesi gün gece yarısı durum döner | 1,5 gün |
| **3. W1 Pasaport** | Small + Medium, bayrak ızgarası | Ülke ekleyince widget güncellenir | 1 gün |
| **4. W3 Sonraki gezi** | Plan verisi, geri sayım zaman çizelgesi, boş durum | Plan ekle/sil, gün değişimi | 1 gün |
| **5. Cilâ ve cihaz testi** | Açık/koyu ve "tinted" (iOS 18) mod, dinamik yazı boyutu, erişilebilirlik etiketleri, TR/EN | TestFlight'ta gerçek cihazda her aile denenir | 1 gün |
| **6. Yayın** | `version` 1.5.0, EAS derlemesi, mağaza metni ve ekran görüntüsü | App Store'a gönderim | 0,5 gün + inceleme |

Toplam yaklaşık **6-7 iş günü**, spike sonucuna göre. Aşama 0 başarısız olursa karar noktası: `@bacons/apple-targets` + elle SwiftUI (≈ +3 gün).

---

## 7. Test planı
- **Birim (Jest):** `widgetData.ts` tüm durumlar; yerel gece yarısı ve DST'de gün anahtarları (`dayKeyOf`, `daysUntil` zaten yerel tarihle çalışıyor); `liveStreak`'in widget zaman çizelgesinde tutarlılığı (gelecek günler için seri sıfırlanması).
- **Bileşen:** widget bileşenleri izole çalışma zamanında çalıştığından Jest ile render edilemeyebilir; bu yüzden tüm mantık `widgetData.ts`'te, widget dosyaları düz çizimde tutulur.
- **Cihaz (elle):** her aile, iki dil, koyu/açık, uygulamayı kapatıp gün değiştirme, düşük güç modu, widget'a dokununca doğru ekranın açılması.

---

## 8. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| `expo-widgets` olgunluğu belirsiz (dokümanda alfa/beta notu yok ama yeni bir kütüphane) | Beklenmedik hata, eksik özellik | Aşama 0 spike; yedek yol `@bacons/apple-targets` |
| Özel font gömülemez | Marka tipografisi widget'ta farklı görünür | Sistem serif'i, rakamlar için kalın sistem fontu |
| Derin bağlantı widget'tan çalışmaz | Dokunma yalnızca uygulamayı açar (oyuna götürmez) | Önce uygulamayı açmak kabul edilebilir; oyun kartı zaten ana ekranda |
| Widget yenileme bütçesi | Veri gecikir | Önceden yazılmış çok günlük zaman çizelgesi; sonuç anında `reload()` |
| App Group / profil sorunu EAS'ta | Derleme imza adımında patlar | Spike'ta erken dene; Developer portalda grubu elle ekle |
| Uygulama boyutu | `@expo/ui` ve uzantı hedefi paketi büyütür | Boyutu spike'ta ölç; küre dokuları (7,8 MB) zaten en büyük kalem |
| Sentry açık değil | Widget hatası görünmez | Widget mantığı saf TS'te ve testli; cihaz testi şart |

---

## 9. Kararlar (12 Kasım)
1. **3 widget** birlikte (Pasaport, Gizli Ülke + kilit ekranı, Sonraki gezi).
2. **Dil:** uygulama dili (`useAppStore.currentLang`); cihaz dili değil.
3. **Live Activity:** sonraki sürüme ertelendi. Gezi sırasında kilit ekranında ve Dynamic Island'da canlı duran bir kart (örneğin "Japonya · 3. gün"); uygulamanın kendisi tarafından başlatılır ve güncellenir, en fazla yaklaşık 8 saat görünür kalır.
4. **Mağaza görselleri:** şimdilik gerekmiyor, ileride üretilebilir (`store/` depodan silindi, baştan yapılır).
5. **Tasarım onayı şart:** widget koduna, spike dahil, tasarımlar onaylanmadan başlanmaz. Tasarımlar: https://claude.ai/artifact/4z1paxdNSa6FbNh7YfdYKC

---

## 10. Uygulama notları (13 Kasım)
- **Yapıldı:** `src/widgets/` (3 widget + saf `widgetData.ts` + testler), `services/widgetSync.ts`, `atls://game` ve `atls://planner` yolları, `app.json` eklentisi. `expo prebuild` geçici bir kopyada çalıştı ve `ExpoWidgetsTarget` hedefini, App Group yetkisini ve üç widget'ın aile listesini üretti.
- **Spike sorularının cevapları:** (1) dokunma ile derin bağlantı: `widgetURL` değiştiricisi var, kullanıldı. (2) özel font: kullanılmadı, sistem serif'i. (3) `updateTimeline` giriş sayısı sınırı dokümanda yok; oyun için ~15, gezi için 31 giriş gönderiliyor, cihazda doğrulanmadı. (4) EAS'ın uzantı profili: ilk derlemede görülecek.
- **Tasarımdan sapmalar:** kilit ekranı dairesinde "noktalı halka" yok; SwiftUI `Gauge` ile oynandı = dolu halka, oynanmadı = boş halka (+ alev ve seri sayısı). Rakamlar sistem serif'i ile. Kilit ekranı "risk" durumunda "!" işareti yok; durum metinle ("Seri risk altında") söylenir. Küçük farklar (boşluklar, bayrak kutuları) cihazda ince ayar ister.
- **Doğrulanmadı:** her şey. Widget'lar yalnızca birim testlerle ve prebuild ile denendi; gerçek görünüm, güncelleme zamanları, derin bağlantı ve imzalama TestFlight'ta görülecek.
