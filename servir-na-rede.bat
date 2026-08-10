@echo off
rem Serve o prototipo na rede local, pro celular abrir sem publicar nada em
rem lugar nenhum. O celular precisa estar no MESMO Wi-Fi que este computador.
rem Feche esta janela (ou Ctrl+C) para parar o servidor.
rem
rem Diferente do 06-modelos/testar-no-celular.bat: aqui nao ha export de Godot,
rem porque o prototipo e um HTML solto. Serve a pasta e pronto.
setlocal
cd /d "%~dp0"

rem IP desta maquina na rede local (o da placa que tem o gateway, para nao pegar
rem adaptador virtual do VirtualBox/WSL)
rem (sem "|" na linha do PowerShell: dentro do for /f o cmd nao repassa o cano)
for /f "delims=" %%i in ('powershell -NoProfile -Command "(Get-NetIPConfiguration).Where({$_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up'})[0].IPv4Address.IPAddress"') do set "IP=%%i"

echo.
echo ================================================
echo   No celular, no mesmo Wi-Fi, abra:
echo.
echo       http://%IP%:5176/prototipo.html
echo.
echo   Na primeira vez o Windows pergunta se libera o
echo   Python na rede: diga que SIM, em "rede privada".
echo ================================================
echo.

python -m http.server 5176 --directory .
pause
