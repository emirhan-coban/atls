# App Store Connect: 1.1.0 yükleme rehberi

Build otomatik gönderim (auto-submit) ile TestFlight'a gider. İşlenmesi birkaç dakika sürer, Apple "İşleniyor" yazısı bitince seçilebilir.

## 1. Yeni sürümü oluştur
1. appstoreconnect.apple.com > Uygulamalarım > **atls.**
2. Sol üstte **iOS Uygulaması +** > **1.1.0** yaz > Oluştur. (Zaten 1.1.0 varsa onu aç.)

## 2. Build seç
1. Sayfada **Build** bölümü > **Build Ekle**.
2. Listeden 1.1.0'ın **en yüksek build numarasını** seç (EAS ile gönderilen, TestFlight'ta "İşleniyor" bitmiş olmalı).
3. Şifreleme sorusu çıkarsa: "Standart dışı şifreleme kullanmıyor" (uygulama yalnızca HTTPS/standart şifreleme kullanır) > Başla.

## 3. Sürüm sayfası alanları (Türkçe ana dil)
Metinleri `store/app-store-listing.md` dosyasından kopyala.
- **Ekran görüntüleri:** "6.3 inç" alanına `store/6.3-tr/` (TR) veya `store/6.3-en/` (EN) (1206x2622); 6.9" için `store/appstore-6.9-0X-*.png` (6 adet, sırayla). 6.5" ve diğer boyutlar istenirse Apple 6.9"dan otomatik üretir; zorunlu yalnızca 6.9" (veya 6.5") seti.
- **Tanıtım Metni (170):** listing dosyasından.
- **Açıklama:** listing dosyasından.
- **Anahtar Kelimeler (100):** listing dosyasından (virgülle, boşluksuz).
- **Destek URL'si:** zorunlu. Bir destek sayfası/e-posta sayfası adresi gir (örn. GitHub Pages veya Notion sayfası; içinde iletişim e-postan olsun).
- **Pazarlama URL'si:** isteğe bağlı, boş bırak.
- **Sürüm / Telif Hakkı:** `© 2026 Emirhan Çoban` gibi.
- **Bu Sürümdeki Yenilikler:** listing dosyasındaki metin.

## 4. İngilizce yerelleştirme (isteğe bağlı ama önerilir)
1. Sol üstte dil menüsü > **Dil Ekle** > İngilizce (ABD).
2. Ad, alt başlık, açıklama, anahtar kelimeler, tanıtım metni: listing dosyasındaki EN bölümü.
3. Ekran görüntüleri: `store/en/appstore-6.9-0X-en.png` (6 adet).

## 5. Uygulama Bilgileri (sol menü > Uygulama Bilgileri)
- **Ad / Alt başlık:** listing dosyasından (≤30 karakter).
- **Kategori:** Birincil **Seyahat**, ikincil **Yaşam Tarzı** (veya Referans).
- **İçerik Hakları:** "Üçüncü taraf içerik içermiyor" seç. (Harita verisi Natural Earth, kamu malı; vize verisi Vikipedi, bu bilgi uygulama içinde kaynak notuyla belirtilmiş.)
- **Yaş Derecelendirmesi:** Düzenle > tüm sorulara "Yok/Hayır" > sonuç 4+.

## 6. Uygulama Gizliliği (sol menü > Uygulama Gizliliği)
- **Gizlilik Politikası URL'si:** zorunlu. Yayında bir gizlilik sayfası olmalı. Yoksa basit bir sayfa yaz (hangi verinin toplandığı, Supabase'te saklandığı, silme yolu) ve adresini gir.
- **Veri Toplama:** Evet'i seç ve şunları işaretle (hesap açılırsa):
  - İletişim Bilgileri > **E-posta Adresi**: Uygulama İşlevselliği, kullanıcıya bağlı, takip için KULLANILMAZ.
  - Kullanıcı İçeriği > **Diğer Kullanıcı İçeriği** (gezi notları, planlar): Uygulama İşlevselliği, kullanıcıya bağlı, takip yok.
  - Tanımlayıcılar > **Kullanıcı Kimliği**: Uygulama İşlevselliği, takip yok.
- **Takip (tracking):** "Hayır". Reklam SDK'sı yok.
- Not: Reklam, analitik, konum, fotoğraf verisi toplamıyorsan başka kutu işaretleme. Fotoğraf seçici kullanıyorsan yalnızca cihazda kalıyorsa işaretlemene gerek yok.

## 7. Fiyat ve Kullanılabilirlik
- **Fiyat:** Ücretsiz.
- **Ülkeler:** Türkiye önce; tüm ülkeler açık bırakılabilir.

## 8. Uygulama İncelemesi (sürüm sayfasının altı)
- **Oturum açma gerekli mi:** İşaretleme (uygulama hesapsız çalışıyor). Yine de test için hesap vermek istersen demo e-posta/şifre gir.
- **Notlar:** "Hesap açmadan test etmek için 'Hesap açmadan devam et' seçeneğini kullanın. Hesap silme: Pasaport > Hesap Yönetimi." (listing dosyasında)
- **İletişim bilgileri:** Ad, soyad, telefon, e-posta (zorunlu).

## 9. Sürüm yayın seçeneği
- **Elle yayınla** (önerilir: onaydan sonra sen basarsın) veya **Otomatik yayınla**.
- Aşamalı sürüm (phased release) istersen 7 günlük seçeneği aç; ilk sürümlerde gerek yok.

## 10. Gönder
1. Sağ üstte **İncelemeye Ekle** > **İncelemeye Gönder**.
2. Eksik alan varsa kırmızı uyarı çıkar (genelde Destek URL'si, Gizlilik URL'si, Gizlilik anketi veya ekran görüntüsü).
3. Onay genelde 24–48 saat sürer. Reddedilirse Çözüm Merkezi'nden nedenini oku, düzelt, aynı sürüme yeni build ekleyip tekrar gönder.

## Sık takılınan noktalar
- Build listede yoksa: TestFlight'ta hâlâ "İşleniyor" olabilir veya EAS gönderimi bitmemiştir (expo.dev'deki submission sayfasından kontrol et).
- "Eksik Uyumluluk" uyarısı: Build'e tıklayıp şifreleme sorusunu yanıtla.
- Yeni ikon yalnızca bu build ile gelir (ikon binary içinde). Mağazadaki 1024 ikon da otomatik bu build'den alınır, ayrıca yüklemen gerekmez.
