@echo off
echo Stopping Explorer...
taskkill /f /im explorer.exe

echo Removing icon cache...
attrib -h -s -r "%LocalAppData%\IconCache.db"
del /f /q "%LocalAppData%\IconCache.db"

attrib -h -s -r "%LocalAppData%\Microsoft\Windows\Explorer\*"
del /f /q "%LocalAppData%\Microsoft\Windows\Explorer\iconcache_*.db"
del /f /q "%LocalAppData%\Microsoft\Windows\Explorer\thumbcache_*.db"

echo Removing taskbar icon cache...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\TrayNotify" /v IconStreams /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\TrayNotify" /v PastIconsStream /f

echo Restarting Explorer...
start explorer.exe

echo Icon cache cleared. You may need to restart your PC for some icons to fully refresh.
pause
