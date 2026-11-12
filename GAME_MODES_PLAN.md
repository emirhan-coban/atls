# Gizli Ülke: ikinci mod planı

Tarih: 13 Kasım 2026 · Durum: **uygulandı (cihazda denenmedi)**

Doğrulama etiketleri: **[ölçtüm]** koddan/veriden hesapladım, **[kodda gördüm]** okudum, **[doğrulanmadı]** varsayım.

---

## 1. Amaç

Bugünkü Gizli Ülke tek bir mekanik: 6 ipucu, ipucu metinle açılıyor. Kullanıcı "bugünkünü" bitirince uygulamada oynayacak başka şey kalmıyor. İkinci mod:

- aynı alışkanlığı (günde bir bulmaca) görsel bir şeyle zenginleştirir, bu da paylaşılabilir (ekran görüntüsü, sonuç karesi),
- bilgi yükü az: bayrak ve siluet dilden bağımsız, yani DE/ES gelince çeviri gerektirmeyen içerik,
- mevcut altyapıyı (günlük seçim, tahmin, tahmin dağılımı, paylaşım) yeniden kullanır, sıfırdan oyun değil.

Başarı ölçütü (analitik olmadığı için dolaylı): oyunun ardışık gün oynanma oranı, App Store yorumları, paylaşılan sonuç sayısı.

---

## 2. Önerilen modlar

| Mod | Bulmaca | Neden |
|---|---|---|
| **İpucu** (mevcut) | 6 metin ipucu | Değişmez |
| **Bayrak** | Büyük bayrak, tahmin hakkı 4 | Çok hızlı, ilk girişe uygun |
| **Siluet** | Ülkenin haritadaki dış çizgisi | Bu uygulamanın gücü: elimizde zaten 237 ülke sınır verisi var |

Üçüncü bir fikir olarak "Sınır komşuları" (komşu bayrakları gösterilir) düşünülebilir, ama veri (komşuluk listesi) bizde yok; kapsam dışı.

### Veri durumu [ölçtüm]
- Oynanabilir havuz **193 ülke** (ipucu, iklim ve bilgi verisi olanlar). Hepsinin `worldMapPaths.ts` içinde şekli var.
- **Siluet için yeterince büyük olanlar:** harita biriminde en uzun kenarı ≥ 8 olan **151**, ≥ 15 olan **117** ülke. Daha küçükleri (Vatikan, Monako, San Marino, Nauru…) siluette tanınmaz. Öneri: siluet havuzu = ≥ 8 (151 ülke); küçükler yalnızca İpucu ve Bayrak modunda.
- Bayrak: katalogda her ülkenin emoji bayrağı var [kodda gördüm]. Ek görsel dosyası gerekmiyor.

---

## 3. Oyun kuralları

**Ortak:** günde bir bulmaca, yerel gece yarısında yenilenir, bulmaca ülkesi tarihten **mod tuzu (`salt`)** ile seçilir (`atls-flag-…`, `atls-shape-…`), böylece üç modun ülkesi farklı olur ve herkes aynı gün aynı ülkeyi görür. Mevcut "döngü başına bir kez, üst üste tekrar yok" mantığı her mod için ayrı çalışır (`cycleOrder`).

**Bayrak modu**
- Ekranda büyük bayrak. 4 tahmin hakkı.
- Her yanlış tahmin bir ipucu açar: 1. yanlış → kıta, 2. yanlış → başkentin harf sayısı, 3. yanlış → başkentin ilk harfi.
- Tahmin kutusu mevcut arama kutusu; geri bildirim satırları mevcut (`doğru / aynı kıta / farklı kıta`).

**Siluet modu**
- Ekranda ülkenin dış çizgisi, sabit yönde (kuzey yukarı), tek renk. Ölçek ülkeye göre otomatik, yani boyuttan ülke anlaşılmaz (bilerek; "büyüklük" ipucu ayrı).
- 5 tahmin hakkı. Her yanlış tahmin bir ipucu: 1. → kıta, 2. → yüzölçümü sınıfı ("büyük/orta/küçük"), 3. → denize kıyısı var mı, 4. → başkent ilk harf.
- Çizim: `react-native-svg` ile tek `Path`; `viewBox` yol verisinden hesaplanır.

**Seri (streak) politikası: karar gerekiyor.** Seçenekler:
1. *Yalnızca İpucu modu seriyi etkiler* (**önerim**). Mevcut kullanıcıların serisi bozulmaz, yeni modlar "bonus". Bonus modlar için ayrı sayaç ("Bugün 2/3 bulmaca").
2. Üç moddan herhangi birinin kazanılması seriyi korur. Daha affedici ama mevcut seri anlamı değişir.
3. Her modun ayrı serisi. Üç sayı, ekran kalabalığı.

---

## 4. Veri modeli

Bugün [kodda gördüm]: `useGameStore` → `days: Record<dayKey, DayRecord>`, `stats: GameStats` (`played, won, streak, best, lastWonDay, dist[6]`).

Eklenecek:
```ts
type GameMode = 'clues' | 'flag' | 'shape';
// days[dayKey] aynı kalır ('clues' kaydı). Yeni modlar:
modeDays: Record<'flag' | 'shape', Record<dayKey, DayRecord>>;
modeStats: Record<'flag' | 'shape', Pick<GameStats, 'played' | 'won' | 'dist'>>; // seri yok (seçenek 1)
```
- **Geçiş (migration):** `hydrate()` zaten `normalizeStats` ile eski kaydı tolere ediyor; `modeDays/modeStats` yoksa boş başlar. Eski sürümlere geri dönüş: eski sürüm bilinmeyen alanları yok sayar, bozulmaz.
- **Depolama boyutu:** 14 günlük pencere her mod için tutulur (mevcut `KEEP_DAYS`).
- Saf mantık `src/game/dailyCountry.ts`'e değil, yeni `src/game/modes.ts`'e: `dailyCountryId(key, mode)`, `maxGuesses(mode)`, `cluesFor(mode, id, lang)`, `shareText(mode, …)`, `silhouetteShape(id)`. Mevcut fonksiyonlar bozulmadan sarılır.
- Siluet verisi: `worldMapFeatures`'tan yalnızca seçilen ülkenin `d`'si ve sınır kutusu hesaplanır; **tüm yolları (1 MB metin) ayrıştırmadan** tek ülke işlenir. Bir ülke için sınır kutusu hesabı bir kez yapılıp önbelleğe alınır [doğrulanmadı: en büyük tek yol 121 bin karakter, ayrıştırma süresi cihazda ölçülmeli].

---

## 5. Arayüz

```
┌──────────────────────────────────┐
│ GİZLİ ÜLKE · #12            🔥 5 │
│ [ İpucu ] [ Bayrak ] [ Siluet ]  │  ← segment, kalan hak noktalarıyla
│                                  │
│         ┌──────────┐             │
│         │  siluet  │             │  ← ya da büyük bayrak
│         └──────────┘             │
│   ipucu 1: Asya · denize kıyısı… │
│   ○ ○ ○ ○ ○   (5 tahmin)         │
│ ┌──────────────────────────────┐ │
│ │ Ülke ara…                    │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```
- Segment: mevcut `Chip` bileşeniyle; bitirilen modda tik, bitirilmeyende nokta.
- Ana ekran kartı (`DailyGameCard`): "Bugün 1/3 bulmaca" satırı; widget serisi aynı kalır (yalnızca İpucu).
- Sonuç kartı: mevcut dağılım çubukları mod başına.
- **Paylaşım metni:** mod simgesi + kareler, örn. `atls. Siluet #12 3/5 🟥🟥🟩`. Siluet/bayrak için resim paylaşımı sonraya.
- Erişilebilirlik: bayrak için `accessibilityLabel` ülke adını **sızdırmamalı**; "Bugünün bayrağı" gibi nötr. Siluet için `accessibilityLabel`: "Bir ülkenin dış çizgisi", ipuçları metin olarak okunur. VoiceOver kullanıcıları için bayrak ve siluet modları fiilen oynanamaz; bunun için İpucu modu (metin) erişilebilir alternatif olarak açıkça kalır.
- Metinler `localization/game.ts` kataloğuna (TR/EN), DE/ES eklenince yeni dil sütunu.

---

## 6. Aşamalar

| Aşama | İş | Kabul ölçütü | Tahmin |
|---|---|---|---|
| 0. Tasarım | Claude Design'da üç mod ekranı, segment, sonuç kartı, paylaşım metni | **Senin onayın** | 0,5 gün |
| 1. Çekirdek | `modes.ts`: günlük seçim (tuzlu), hak sayısı, ipucu merdiveni, paylaşım; testler (döngü, tekrar yok, mod başına ayrı ülke) | Jest yeşil | 1 gün |
| 2. Depo | `modeDays/modeStats`, migration, `guess(mode, id)`, testler | Eski kayıt yükleniyor, seri bozulmuyor | 0,5 gün |
| 3. Bayrak | Ekran, segment, sonuç, hatırlatma metni | Simülatörde oynanır | 1 gün |
| 4. Siluet | `ShapeView`, sınır kutusu hesabı + önbellek, ipuçları | 151 ülkenin hepsi çizilir (test: sınır kutusu geçerli, boş yol yok) | 1,5 gün |
| 5. Cilâ | Erişilebilirlik, TR/EN, ana ekran kartı, widget metninde değişiklik yok | Cihazda deneme | 1 gün |

Toplam yaklaşık **5-6 iş günü**. Hepsi JS: yeni native modül yok, yani `eas update` ile gönderilebilir (yeni derlemeyi bekleme kuralı geçerli olduktan sonra).

---

## 7. Test planı
- **Birim:** her mod için `dailyCountryId` (aynı gün aynı ülke, döngüde tekrar yok, modlar birbirinden farklı), hak sayıları, ipucu merdiveni (ülke adı sızmaz: mevcut "ipucu adı içermez" testinin kapsamı genişler), dağılım kaydı, migration.
- **Veri:** siluet havuzundaki her ülke için yol boş değil, sınır kutusu sonlu ve genişlik/yükseklik > 0; bayrak boş değil.
- **Bileşen:** mod segmenti, her modun ilk ekranı, sonuç kartı (mevcut `modals.test.tsx` kalıbı).
- **Cihaz (sen):** siluetin tanınırlığı (tuhaf şekiller: adalar, çok parçalı ülkeler), bayrak emojisi render'ı farklı iOS sürümlerinde.

---

## 8. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| Çok parçalı ülkeler (ABD, Endonezya, Hırvatistan) siluette ana kara + adalar tek kutuya sığınca küçük kalır | Zor veya çirkin görünüm | Sınır kutusunu en büyük parçaya göre al, uzak parçaları kırp; havuzdan en kötüleri çıkar (cihazda gözle) |
| Bayrak emojisi bazı iOS sürümlerinde farklı | Küçük | Büyük boyda `Text`; gerekirse SVG bayrağa geç (sonra) |
| Seri politikası kullanıcıyı şaşırtır | Orta | Önerilen seçenek 1: mevcut seri hiç değişmez |
| Üç bulmaca = uzun oturum, "bıkkınlık" | Düşük | Bonus modlar kısa (4-5 hak) ve isteğe bağlı |
| Ayrıştırma süresi (121 bin karakterlik yol) | Açılışta takılma | Yalnızca seçilen ülke, ilk kullanımda, önbellekli; ölçülecek |

---

## 9. Kararlar (13 Kasım)
1. **Seri politikası:** seçenek 1. Yalnızca İpucu modu seriyi etkiler; Bayrak ve Siluet "bonus"tur, ayrı sayaçla ("Bugün 1/3") izlenir.
2. **Modlar:** ikisi de yapılacak (Bayrak ve Siluet). Sıra: önce Bayrak (en ucuz, altyapıyı doğrular), sonra Siluet.
3. **Paylaşım:** şimdilik yalnızca metin (kareler). Görsel paylaşım sonraya.
4. **Tasarım onayı şart:** koda başlamadan önce Claude Design tuvali onaylanacak: https://claude.ai/artifact/NMY5zKT8hf1WmCoNUgudPg

---

## 10. Uygulama notları
- **Onay koşulu:** kullanıcı "ilk bakışta anlaşılıyorsa üç mod olsun" dedi. Tasarımı ilk bakan biri gibi okuyup sadeleştirdim: (1) mod seçici yalnızca ilk **Klasik** bulmaca bittikten sonra görünür, yeni oyuncu tek bulmaca görür ve sonuçta "Yeni: Bayrak ve Siluet" kartı çıkar; (2) "bonus, serini etkilemez" cümlesi oyun ekranından kalktı, yalnızca üst başlıkta "BONUS · SİLUET" yazar ve sonuç kartında not düşülür; (3) "İpucu" adı "Klasik" oldu. Gerçek kullanıcıyla denenmedi; TestFlight'ta birkaç kişiye ilk açılışı gösterip "ne yapacağını anladı mı" diye bakmak gerekir.
- **Siluet havuzu:** 143 ülke (tasarım öncesi tahmin 151'di; yakındaki parçalar dışında kalanlar kırpılınca küçük bir kısmı eşiğin altına düştü). Liste donmuş (`silhouettePool.ts`).
- **Sınır kutusu:** en büyük parçaya göre, 0,6 × uzun kenar içindeki parçalar çizilir (Azorlar, Hawaii vb. dışarıda). Cihazda gözle kontrol edilmeli (ABD, Endonezya, Fransa, Yeni Zelanda gibi çok parçalı ülkeler).
- **Seri/widget:** değişmedi; yalnızca Klasik mod ikisini de besler.
