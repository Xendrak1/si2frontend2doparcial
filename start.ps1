# 🚀 Script de Inicio Rápido - Frontend React
# Ejecuta este script para iniciar el frontend rápidamente

Write-Host "🎨 Iniciando Frontend del Sistema Boutique..." -ForegroundColor Green
Write-Host ""

# Verificar si estamos en el directorio correcto
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde la carpeta 'frontend'" -ForegroundColor Red
    Write-Host "   Usa: cd frontend" -ForegroundColor Yellow
    exit 1
}

# Verificar si existe node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias de Node.js..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}

# Verificar si existe .env
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "   Creando .env desde .env.example..." -ForegroundColor Cyan
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Archivo .env creado" -ForegroundColor Green
    } else {
        Write-Host "❌ No se encontró .env.example" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ ¡Configuración completa!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Iniciando servidor de desarrollo..." -ForegroundColor Green
Write-Host "   El navegador se abrirá automáticamente" -ForegroundColor Yellow
Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
npm run dev
