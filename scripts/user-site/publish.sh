#!/usr/bin/env bash
# emirhan-coban.github.io kullanıcı sitesi deposunu oluşturur (yoksa) ve site/ içeriğini main dalına gönderir.
# Depo herkese açık olur (GitHub Pages ücretsiz planda bunu ister). Tekrar çalıştırmak güvenlidir.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
USER_NAME="$(gh api user --jq .login)"
REPO="$USER_NAME/$USER_NAME.github.io"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -R "$ROOT/scripts/user-site/site/." "$TMP/"
cat > "$TMP/README.md" <<README
# $USER_NAME.github.io

GitHub kullanıcı sitesinin kökü. \`/.well-known/apple-app-site-association\` dosyasını sunar; Apple bunu
**atls.** iOS uygulamasının evrensel bağlantıları için alan adı kökünde ister.
Uygulamanın sayfaları [atls](https://github.com/$USER_NAME/atls) deposundadır (\`public_docs/\`, \`/atls/\` altında yayınlanır).
README

cd "$TMP"
git init -q -b main
git add -A
git -c user.name="$(git -C "$ROOT" config user.name)" -c user.email="$(git -C "$ROOT" config user.email)" \
  commit -q -m "chore: apple-app-site-association for atls. universal links"

if gh repo view "$REPO" >/dev/null 2>&1; then
  git remote add origin "https://github.com/$REPO.git"
  git push -q --force origin main
else
  gh repo create "$REPO" --public --source=. --push \
    --description "GitHub user site root: Apple app-site-association for atls. universal links"
fi
echo "Yayınlandı: https://$USER_NAME.github.io/.well-known/apple-app-site-association (birkaç dakika sürebilir)"
