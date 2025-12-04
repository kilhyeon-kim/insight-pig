$path = "c:\Projects\inspig\web\src\css\style.css"
$lines = Get-Content $path
$lines[863] = "    /* Vertical Divider (30% Height) */"
$lines[1799] = "   Popup Tabs (.popup-tabs)"
$lines[1800] = "   - Mobile Default"
$lines | Set-Content $path -Encoding UTF8
