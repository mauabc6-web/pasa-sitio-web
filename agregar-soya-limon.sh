#!/bin/bash
# Procesa la foto de Soya Limón igual que las demás botellas del catálogo:
# recorta al contorno de la botella, la escala a 600px de alto y guarda WebP.
set -e
ORIGEN="${1:-}"
[ -z "$ORIGEN" ] && { echo "Uso: ./agregar-soya-limon.sh <ruta-de-la-imagen>"; exit 1; }
[ -f "$ORIGEN" ] || { echo "No encuentro: $ORIGEN"; exit 1; }

python3 - "$ORIGEN" <<'PY'
import sys
from PIL import Image
src = sys.argv[1]
im = Image.open(src).convert('RGBA')
w, h = im.size; px = im.load()

# si viene con fondo blanco sólido, se vuelve transparente
esq = [px[1,1], px[w-2,1], px[1,h-2], px[w-2,h-2]]
if all(p[3] > 200 and min(p[:3]) > 235 for p in esq):
    datos = [(r,g,b, 0 if (r>238 and g>238 and b>238) else a) for r,g,b,a in im.getdata()]
    im.putdata(datos); px = im.load()
    print('  fondo blanco eliminado')

# recorte al contorno sólido (mismo criterio que el resto del catálogo)
filas = [y for y in range(h) if any(px[x,y][3] > 190 for x in range(0, w, 2))]
cols  = [x for x in range(w) if any(px[x,y][3] > 190 for y in range(0, h, 2))]
im = im.crop((min(cols), min(filas), max(cols)+1, max(filas)+1))

w2, h2 = im.size
im = im.resize((round(w2*600/h2), 600), Image.LANCZOS)
im.save('assets/p-soya-limon.webp', 'WEBP', quality=84, method=6)
print(f'  assets/p-soya-limon.webp  {im.size[0]}x600')
PY
echo "✓ imagen lista"
