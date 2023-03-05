# pasteorreplaceimage README

This extension allows you to replace an existing image with an image stored in the clipboard. It also allows you to paste a new image from the clipboard into a folder. Image must be copied to clipboard, file copy only will not work.

## Features

## Replace image from clipboard

![picture 1](/assets/screenshot-replace-img.gif)

This is a command and extension menu for image items in the source explorer. Replace existing image.

- For Windows **png, jpg, bmp and gif** are supported.
- Currently for Linux and mac **png** only is supported. (if you are a linux or Mac developer I invite you to improve this extension in github! 🫶)

Gif support for Windows only:

![picture 1](/assets/screenshot-replace-gif.gif)

## Paste image

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

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

**Enjoy!**