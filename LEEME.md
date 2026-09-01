# Sitio web PASA — Panamericana Abarrotera

Sitio estático: HTML, CSS y JavaScript puros. Sin build, sin dependencias,
sin servidor de aplicaciones. Se abre con doble clic o se sube tal cual.

## Archivos

    index.html        Inicio
    nosotros.html     Historia de la empresa
    productos.html    Catálogo (17 productos, modal de detalle)
    recetas.html      Ideas de uso por línea
    contacto.html     Teléfono, WhatsApp y preguntas frecuentes

    styles.css        Hoja de estilos compartida
    main.js           Navegación, animaciones y efecto 3D
    assets/           Logo, fotos de producto y escenas (WebP)

    robots.txt        Permite la indexación de Google
    sitemap.xml       Lista de páginas para buscadores
    _headers          Reglas de caché (solo Cloudflare Pages)
    publicar.sh       Script de publicación

## Probar en local

    open index.html

## Publicar

En Cloudflare Pages:

    ./publicar.sh

En un servidor propio (FTP / cPanel): sube todo el contenido de esta
carpeta a `public_html`. En Apache, el archivo `_headers` no aplica;
sus reglas de caché se configuran con `.htaccess`.

## Notas de mantenimiento

- Los productos se editan en el arreglo `CATALOGO` dentro de `productos.html`.
- Al cambiar `styles.css` o `main.js`, sube el número de `?v=` en las cinco
  páginas para que el navegador no sirva la versión anterior.
- Las imágenes de producto son WebP con fondo transparente, recortadas al
  contorno de la botella para que todas se vean del mismo tamaño.
- No se usa `filter: drop-shadow()` sobre imágenes con transparencia:
  combinado con `object-fit`, Safari en iOS pinta el rectángulo completo.

## Dominio y SEO

`sitemap.xml` y las etiquetas canónicas apuntan a `https://pasa.com.mx/`.
Si el sitio queda en otra dirección, hay que actualizarlos.
