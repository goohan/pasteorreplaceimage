// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pasteorreplaceimage" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pasteorreplaceimage.replaceimagefromclipboard', (contextSelection: vscode.Uri, allSelections: vscode.Uri[]) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
        console.log(contextSelection);

        //getPasteImage('C:\\Users\\User\\Desktop\\TestRepoBorreme\\img.png');
        pasteImage(contextSelection.fsPath, false);
	});

    // Paste image into folder
    let disposable2 = vscode.commands.registerCommand('pasteorreplaceimage.pasteimagefromclipboard', (contextSelection: vscode.Uri, allSelections: vscode.Uri[]) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

        console.log(contextSelection);
        let finalpath =  path.resolve(contextSelection.fsPath, `${new Date().getTime()}`);
        pasteImage(finalpath, true);        
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * @description Paste an image from clipboard. If {isNew} is false then {imagePath} must include the extension file.
 * If {isNew} its true then {imagePath} must not include extension because it will be defined by the content of the Cliboard, if
 * if clipboard has a reference to gif file then final file extension will be .gif, any other content on clipboard will be resolved as .png.
 * Currently this works like this only for windows. For linux or mac, everything is resolved as .png.
 * @param {string} imagePath
 * @param {boolean} isNew
 * @returns {number}
 */
function pasteImage(imagePath: string, isNew: boolean) : Promise<string[]>{  

    return new Promise((resolve, reject) => {
        if (!imagePath) { return; }
        
        let platform = process.platform;
                
        // Check extension and define final path based on platform and extension support.
        
        if (!isNew) {
            // For replace image (paste over file that exist previously on folder).
            // Currently for windows support for png, jpg, bmp, gif on windows. Linux and mac support for png only.
            let supportedImageExtensions : string[];
            if (platform === 'win32'){
                supportedImageExtensions = ['.png', '.jpg', '.bmp', '.gif'];
            }
            else{
                supportedImageExtensions = ['.png'];
            }

            let fileExtension = path.extname(imagePath);
            if(!supportedImageExtensions.includes(fileExtension)) {
                console.log("Not supported extension file. No image will be pasted. On Windows is supported png, jpg, bmp and gif. Other platforms png only. If you are a linux or mac developer try to improve this extension on github :D");
                return;
            }
        }
        else {
            // For new image (paste  file that does't exist previously on folder).
            // Currently for windows support for gif and png. The image path must no include extension, because Powershell
            // script will define the final extension based on clipboard content (gif or any other as png).
            // For linux or mac support for png only, if clipboard contains gif, it will be pasted as png.
            if (platform !== 'win32')
            {
                imagePath = imagePath + ".png";
            }
        }

        if (platform === 'win32') {
            // Windows

            // for .gif the replace or paste is like paste file, the data of image is not in clipboard.
            // for this reason it is necessary to use a different script.
            let scriptName = 'resources/windows/Paste-FromClipboard.ps1';
            const scriptPath = path.join(__dirname, '..' , scriptName);

            let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
            //let command = "C:\\Program Files\\PowerShell\\7\\pwsh.exe";
            let powershellExisted = fs.existsSync(command);
            let output = '';
            if (!powershellExisted) {
                command = "powershell";
            }

            const powershell = spawn(command, [
                '-noprofile',
                '-noninteractive',
                '-nologo',
                '-sta',
                '-executionpolicy', 'unrestricted',
                '-windowstyle', 'hidden',
                '-file', scriptPath,
                imagePath,
                isNew.toString()
            ]);
            // the powershell can't auto exit in windows 7 .
            let timer = setTimeout(() => powershell.kill(), 2000);

            powershell.on('error', (e: any) => {
                if (e.code === 'ENOENT') {
                    vscode.window.showErrorMessage('powershell_not_found');
                } else {
                    vscode.window.showErrorMessage(e);
                }
            });

            powershell.on('exit', function (code, signal) {
                console.debug('exit', code, signal);
            });
            powershell.stdout.on('data', (data) => {
                data.toString().split('\n').forEach((d: any) => output += (d.indexOf('Active code page:') < 0 ? d + '\n' : ''));
                clearTimeout(timer);
                timer = setTimeout(() => powershell.kill(), 2000);
            });
            powershell.on('close', (code) => {
                resolve(output.trim().split('\n').map(i => i.trim()));
            });
        }
        else if (platform === 'darwin') {
            // Mac
            let scriptPath = path.join(__dirname, '..', '..' , 'resources/mac.applescript');

            let ascript = spawn('osascript', [scriptPath, imagePath]);
            ascript.on('error', (e: any) => {
                vscode.window.showErrorMessage(e);
            });
            ascript.on('exit', (code, signal) => {
                // console.debug('exit', code, signal);
            });
            ascript.stdout.on('data', (data) => {
                resolve(data.toString().trim().split('\n'));
            });
        } else {
            // Linux

            let scriptPath = path.join(__dirname, '..', '..' , 'resources/linux.sh');

            let ascript = spawn('sh', [scriptPath, imagePath]);
            ascript.on('error', (e: any) => {
                vscode.window.showErrorMessage(e);
            });
            ascript.on('exit', (code, signal) => {
                // console.debug('exit',code,signal);
            });
            ascript.stdout.on('data', (data) => {
                let result = data.toString().trim();
                if (result === "no xclip") {
                    vscode.window.showInformationMessage('please install xclip');
                    return;
                }
                let match = decodeURI(result).trim().match(/((\/[^\/]+)+\/[^\/]*?\.(jpg|jpeg|gif|bmp|png))/g);
                resolve(match || []);
            });
        }
    }
    );
}