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
        getPasteImage(contextSelection.fsPath);        
	});

    let disposable2 = vscode.commands.registerCommand('pasteorreplaceimage.pasteimagefromclipboard', (contextSelection: vscode.Uri, allSelections: vscode.Uri[]) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user		
        console.log(contextSelection);

        //getPasteImage('C:\\Users\\User\\Desktop\\TestRepoBorreme\\img.png');
        let finalpath =  path.resolve(contextSelection.fsPath, `${new Date().getTime()}.png`);
        getPasteImage(finalpath);        
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getPasteImage(imagePath: string) : Promise<string[]>{
    return new Promise((resolve, reject) => {
        if (!imagePath) { return; }

        let platform = process.platform;
        if (platform === 'win32') {
            // Windows
            const scriptPath = path.join(__dirname, '..' , 'asserts/pc.ps1');

            //let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
            let command = "C:\\Program Files\\PowerShell\\7\\pwsh.exe";
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
                imagePath
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
                data.toString().split('\n').forEach(d => output += (d.indexOf('Active code page:') < 0 ? d + '\n' : ''));
                clearTimeout(timer);
                timer = setTimeout(() => powershell.kill(), 2000);
            });
            powershell.on('close', (code) => {
                resolve(output.trim().split('\n').map(i => i.trim()));
            });
        }
        else if (platform === 'darwin') {
            // Mac
            let scriptPath = path.join(__dirname, '..', '..' , 'asserts/mac.applescript');

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

            let scriptPath = path.join(__dirname, '..', '..' , 'asserts/linux.sh');

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
                    vscode.window.showInformationMessage(locale['install_xclip']);
                    return;
                }
                let match = decodeURI(result).trim().match(/((\/[^\/]+)+\/[^\/]*?\.(jpg|jpeg|gif|bmp|png))/g);
                resolve(match || []);
            });
        }
    });
}