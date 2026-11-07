# Mağaza ekran görüntüsü üretici

Simülatörden alınan ham ekran görüntüsünü, başlık ve alt başlıkla telefon çerçevesine yerleştirip 1290×2796 App Store görseli üretir.
Mevcut seriyle aynı yazı tipi (Instrument Serif) ve renkler. Ek bir araç kurmak gerekmez (macOS'un WebKit'i kullanılır).

```bash
# 1) ham görüntü: simülatörde ekranı hazırla, sonra
xcrun simctl io booted screenshot /tmp/ham.png

# 2) bir kez derle
swiftc -O scripts/store-shots/render.swift -o /tmp/store-render

# 3) üret: <ham> <çıktı> "düz kelimeler" "italik altın kelimeler" "alt başlık"
/tmp/store-render /tmp/ham.png store/yeni.png "Her gün yeni" "bir ülke" "6 ipucu. Kaç tahminde bulursun?"
```

Uzun başlıklar genişliğe sığana kadar kendiliğinden küçülür. Düzen `template.html` içinde.
