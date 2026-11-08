#!/usr/bin/env bash

# Permite pasar un nombre personalizado como argumento, ej: ./script-zip.sh MiNombre_Apellido.zip
NOMBRE_ZIP="${1:-gestor-libros-front-entrega.zip}"

echo "=========================================="
echo "📦 Generando archivo ZIP para entrega"
echo "Archivo destino: $NOMBRE_ZIP"
echo "=========================================="

# Si ya existe un zip con ese nombre, lo eliminamos
if [ -f "$NOMBRE_ZIP" ]; then
  rm -f "$NOMBRE_ZIP"
fi

# Creamos el ZIP excluyendo dependencias, compilados y carpetas innecesarias.
# node_modules no se incluye: se reinstala con "npm install" (package-lock.json sí va).
echo "🗜️  Comprimiendo proyecto..."
zip -r "$NOMBRE_ZIP" . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".angular/*" \
  -x "coverage/*" \
  -x "out-tsc/*" \
  -x ".git/*" \
  -x ".vscode/*" \
  -x ".idea/*" \
  -x ".DS_Store" \
  -x "*/.DS_Store" \
  -x "*.zip" \
  -x "*.sh" \
  -x "docs/*"

echo ""
echo "=========================================="
echo "✅ ¡ZIP creado exitosamente!"
ls -lh "$NOMBRE_ZIP"
echo "=========================================="
