#!/usr/bin/env bash
# emirhan-coban.github.io kullanıcı sitesi deposunu oluşturur (yoksa) ve site/ içeriğini main dalına gönderir.
# Depo herkese açık olur (GitHub Pages ücretsiz planda bunu ister). Tekrar çalıştırmak güvenlidir.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
USER_NAME="$(gh api user --jq .login)"
REPO="$USER_NAME/$USER_NAME.github.io"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

REPO_URL="https://github.com/$REPO.git"
if gh repo view "$REPO" >/dev/null 2>&1; then
  # Depo varsa mevcut içeriği (kendi index.html gibi) ezme: yalnızca AASA dosyalarını ekle.
  git clone -q "$REPO_URL" "$TMP/repo"
  cd "$TMP/repo"
  mkdir -p .well-known
  cp "$ROOT/scripts/user-site/site/.well-known/apple-app-site-association" .well-known/
  cp "$ROOT/scripts/user-site/site/.nojekyll" .
  git add -A
  if git diff --cached --quiet; then echo "Değişiklik yok."; else
    git -c user.name="$(git -C "$ROOT" config user.name)" -c user.email="$(git -C "$ROOT" config user.email)" \
      commit -q -m "chore: apple-app-site-association for atls. universal links"
    git push -q origin main
  fi
else
  cp -R "$ROOT/scripts/user-site/site/." "$TMP/"
  cd "$TMP"
  git init -q -b main
  git add -A
  git -c user.name="$(git -C "$ROOT" config user.name)" -c user.email="$(git -C "$ROOT" config user.email)" \
    commit -q -m "chore: apple-app-site-association for atls. universal links"
  gh repo create "$REPO" --public --source=. --push \
    --description "GitHub user site root: Apple app-site-association for atls. universal links"
fi
echo "Yayınlandı: https://$USER_NAME.github.io/.well-known/apple-app-site-association (birkaç dakika sürebilir)"
