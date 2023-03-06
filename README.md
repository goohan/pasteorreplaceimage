# Paste or replace image from clipboard

This extension allows you to replace an existing image with an image stored in the clipboard. It also allows you to paste a new image from the clipboard into a folder. Image must be copied to clipboard, file copy only will not work.

## Features

### Replace image from clipboard

![picture 1](/assets/screenshot-replace-img.gif)

This is a command and extension menu for image items in the source explorer. Replace existing image.

- For Windows **png, jpg, bmp and gif** are supported.
- Currently for Linux and mac **png** only is supported. (if you are a linux or Mac developer I invite you to improve this extension in github! 🫶)

Gif support for Windows only:

![picture 1](/assets/screenshot-replace-gif.gif)

### Paste image

![picture 3](/assets/screenshot-paste-img.png)

This is a command and extension menu for folders in the source explorer. Take an image stored on clipboard and paste as a new image inside the selected folder. The name of the new file is a number obtained using the TypeScript expression `new Date().getTime()`, the extension is added based on next rules:

- For Windows if there is a gif image on clipboard, a new .gif image will be created, any other image type on clipboard will be resolved as .png.
- For Linux and Mac any image type on clipboard will be resolved as .png.

Both features can accessed through command pallete: `F1` or `Ctrl + Shift P`. Make sure you have the appropriated selected item in the source explorer.

## Requirements

Linux users must have XClip installed. Windows users must have PowerShell installed.

## Extension Settings

Currently there is no settings available for this extension.

## Known Issues

No known issues.

## Release Notes

### 1.0.0

Initial release.

---

## Credits

The icon for this extension is based on this icon:

<a href="https://www.flaticon.com/free-icons/outstanding" title="outstanding icons">Outstanding icons created by Freepik - Flaticon</a>

**Enjoy!**
