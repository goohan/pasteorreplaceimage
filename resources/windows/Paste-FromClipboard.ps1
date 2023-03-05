# Adapted from https://github.com/octan3/img-clipboard-dump/blob/master/dump-clipboard-png.ps1

param($imagePath, $isNew)

Add-Type -Assembly PresentationCore
Add-Type -Assembly System.Runtime

if (-not $imagePath) {
    "no image path"
    Exit 1
}

if (![Windows.Clipboard]::ContainsImage())
{
    "no image on clipboard"
    Exit 1
}

# define if clipboard has file reference
$clipboardHasFile = $false
$clipboardFileInfo = $null
if ([Windows.Clipboard]::ContainsFileDropList()) {
    $fileDropList = [Windows.Clipboard]::GetFileDropList()
    if ($fileDropList.Count -gt 0) {
        $clipboardHasFile = $true
        $clipboardImagePath = $fileDropList[0]
        $clipboardFileInfo = New-Object System.IO.FileInfo($clipboardImagePath)
    }
}


$destinationFileInfo = $null
if ($isNew -eq "true") {
    # define final destination for new files (paste on folder when doesn't exist this file previously).
    # if clipboard has a gif reference (file reference), final file extension is .gif
    # for any other image on clipboard pastes as .png
    if ($clipboardHasFile -and ($clipboardFileInfo.Extension -eq ".gif")){
        $finalImagePath = "$imagePath.gif"
        $destinationFileInfo = New-Object System.IO.FileInfo($finalImagePath)
    }
    else {
        $finalImagePath = "$imagePath.png"
        $destinationFileInfo = New-Object System.IO.FileInfo($finalImagePath)
    }
}
else {
    $destinationFileInfo = New-Object System.IO.FileInfo($imagePath)
}


if ($destinationFileInfo.Extension -ne ".gif") {
    # For other than .gif images (png, jpg, bmp)
    switch ($destinationFileInfo.Extension) {
        ".png" { $encoder = New-Object Windows.Media.Imaging.PngBitmapEncoder; break }
        ".jpg" { $encoder = New-Object Windows.Media.Imaging.JpegBitmapEncoder; break }
        ".bmp" { $encoder = New-Object Windows.Media.Imaging.BmpBitmapEncoder; break }
        Default {
            "not supported extension file"
                Exit 1
            }
        }
        
    $img = [Windows.Clipboard]::GetImage()
    
    $stream = [IO.File]::Open($destinationFileInfo.FullName, "OpenOrCreate")
    $fcb = New-Object Windows.Media.Imaging.FormatConvertedBitmap($img, [Windows.Media.PixelFormats]::Rgb24, $null, 0)
    $encoder.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($fcb)) | out-null
    $encoder.Save($stream) | out-null
    $destinationFileInfo.FullName
    
    $stream.Dispose() | out-null
}
else
{
    # For .gif images
    if ($clipboardHasFile)
    {        
        if ($clipboardFileInfo.Extension -ne $destinationFileInfo.Extension) {
            "clipboard file not match with target image file (.gif)"
            Exit 1
        }
        Copy-Item $clipboardFileInfo.FullName $destinationFileInfo.FullName
        $destinationFileInfo.FullName
    }
    else {
        "clipboard does not have appropiate .gif reference"
        Exit 1
    }
}