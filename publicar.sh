#!/bin/bash
# ============================================================
#  Publica el sitio de PASA en Cloudflare Pages
#  Uso:  ./publicar.sh
# ============================================================
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
STAGE="/tmp/pasa-deploy"
PROYECTO="pasa-preview"

cd "$DIR"

echo "→ Preparando archivos…"
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp -R assets *.html *.css *.js "$STAGE"/
cp _headers "$STAGE"/ 2>/dev/null || true
cp robots.txt sitemap.xml "$STAGE"/ 2>/dev/null || true

# Documentos internos que NO deben publicarse
rm -f "$STAGE"/cotizacion-*.html

echo "→ Verificando…"
FALTAN=0
for f in "$STAGE"/*.html; do
  for a in $(grep -oE 'assets/[a-zA-Z0-9._-]+\.(png|jpg|svg|webp)' "$f" | sort -u); do
    [ -f "$STAGE/$a" ] || { echo "   ⚠️  falta $a (en $(basename "$f"))"; FALTAN=1; }
  done
done
[ -f "$STAGE/cotizacion-pasa.html" ] && { echo "   ⚠️  la cotización se iba a publicar. Abortado."; exit 1; }
[ $FALTAN -eq 1 ] && { echo "   Corrige las imágenes faltantes antes de publicar."; exit 1; }
echo "   ✓ $(ls "$STAGE"/*.html | wc -l | tr -d ' ') páginas, $(ls "$STAGE"/assets | wc -l | tr -d ' ') imágenes, cotización excluida"

echo "→ Subiendo a Cloudflare Pages…"
npx --yes wrangler@4 pages deploy "$STAGE" \
  --project-name "$PROYECTO" \
  --branch main \
  --commit-dirty=true 2>&1 | grep -iv "npm notice"

echo ""
echo "→ Guardando versión en GitHub…"
if git rev-parse --git-dir >/dev/null 2>&1; then
  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git -c user.name="Mauricio Varela" -c user.email="mauabc6@gmail.com" \
        commit -q -m "Actualización del sitio — $(date '+%d/%m/%Y %H:%M')"
    git push -q origin main && echo "   ✓ respaldo subido a GitHub"
  else
    echo "   ✓ sin cambios pendientes"
  fi
fi

echo ""
echo "════════════════════════════════════════════"
echo "  ✅ Publicado: https://pasa-preview.pages.dev"
echo "════════════════════════════════════════════"
