#!/usr/bin/env bash
# public_docs/ klasörünü GitHub Pages'e yayınlar (gh-pages dalı).
# Kaynak her zaman public_docs/; gh-pages dalı yalnızca bu betiğin ürettiği içeriği taşır, elle düzenlenmez.
# Kullanım: bash scripts/publish-docs.sh        (sayfa değişince yeniden çalıştır)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="$(git -C "$ROOT" remote get-url origin)"
MESSAGE="${PUBLISH_MESSAGE:-docs: publish privacy policy}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -R "$ROOT/public_docs/." "$TMP/"
touch "$TMP/.nojekyll"

cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$ROOT" config user.name)" \
    -c user.email="$(git -C "$ROOT" config user.email)" \
    commit -q -m "$MESSAGE"
# gh-pages yalnızca üretilmiş içerik taşıdığı için geçmişi ezmek güvenli
git push -q --force "$REMOTE" gh-pages

echo "Yayınlandı: dal gh-pages. Adres genelde https://<kullanici>.github.io/<repo>/ olur."
