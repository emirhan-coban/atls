# Evrensel bağlantı için kullanıcı sitesi

Apple, evrensel bağlantı dosyasını (`apple-app-site-association`) alan adının **kökünde**, `/.well-known/` altında ister.
`emirhan-coban.github.io/atls/` bir proje sayfası olduğu için dosya orada işe yaramaz; kökü GitHub'ın özel
**kullanıcı sitesi deposu** (`emirhan-coban/emirhan-coban.github.io`) sunar.

Bu klasördeki `site/` o deponun içeriğidir:

- `.well-known/apple-app-site-association`: uygulama kimliği `WY64Y8233J.com.atlas.passport` (Team ID EAS çıktısındaki imzadan doğrulandı), yalnızca `/atls/c/*` yolları için.
- `index.html`: kökten `/atls/` gizlilik sayfasına yönlendirir.

Yayınlamak için (bir kez; depoyu herkese açık oluşturur, bu yüzden elle çalıştır):

```bash
bash scripts/user-site/publish.sh
```

Doğrulama (yayından birkaç dakika sonra, içerik JSON gelmeli ve `Content-Type` `application/json` olmalı):

```bash
curl -si https://emirhan-coban.github.io/.well-known/apple-app-site-association | head -20
```

Not: bu dosya yayında olmadan davet bağlantısı yine çalışır, ama uygulamayı doğrudan açmaz; `public_docs/c/` sayfasındaki "atls.'ta aç" düğmesi ve App Store düğmesi devreye girer.
Uygulamada `associatedDomains` ile bu alan adı tanımlı (`app.json`), yani evrensel bağlantı için **yeni bir derleme** gerekir.
