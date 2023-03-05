# Adapted from https://github.com/octan3/img-clipboard-dump/blob/master/dump-clipboard-png.ps1
Add-Type -Assembly PresentationCore
Add-Type -Assembly System.Runtime

param($imageFolder, $imageName)

if (-not $imageFolder -or -not $imageName) {
    "no image folder or no image name"
    Exit 1
}

if (![Windows.Clipboard]::ContainsImage()) {
    "no image on clipboard"
    Exit 1
}

$hasFile = false
$clipboardImagePath = $null
$clipboardFileInfo = $null
if ([Windows.Clipboard]::ContainsFileDropList()) {
    $fileDropList = [Windows.Clipboard]::GetFileDropList()
    if($fileDropList.Count -gt 0) {
        $hasFile = true
        $clipboardImagePath = $fileDropList[0]
        $clipboardFileInfo = New-Object System.IO.FileInfo($clipboardImagePath)
    }
}

if ($hasFile -and ($clipboardFileInfo.Extension -eq ".gif"))
{
    # Paste .gif image from clipboard using referenced file
    $finalImagePath = [System.IO.Path]::Combine($imageFolder, "$imageName.gif")
    Copy-Item $fd[0] $finalImagePath
    $finalImagePath
}
else
{
    # Paste any image as .png from clipboard
    $finalImagePath = [System.IO.Path]::Combine($imageFolder, "$imageName.png")
    $encoder = New-Object Windows.Media.Imaging.PngBitmapEncoder    
    
    $img = [Windows.Clipboard]::GetImage()
    
    $stream = [IO.File]::Open($finalImagePath, "OpenOrCreate")
    $fcb = New-Object Windows.Media.Imaging.FormatConvertedBitmap($img, [Windows.Media.PixelFormats]::Rgb24, $null, 0)
    $encoder.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($fcb)) | out-null
    $encoder.Save($stream) | out-null
    $finalImagePath
    
    $stream.Dispose() | out-null
}