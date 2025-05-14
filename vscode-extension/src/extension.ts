import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';

console.log('Starting extension activation...');
console.log('Current directory:', __dirname);
console.log('Node version:', process.version);

let LanguageClient: any;
let LanguageClientOptions: any;
let ServerOptions: any;

try {
    console.log('Attempting to import vscode-languageclient...');
    const clientModule = require('vscode-languageclient/node');
    LanguageClient = clientModule.LanguageClient;
    LanguageClientOptions = clientModule.LanguageClientOptions;
    ServerOptions = clientModule.ServerOptions;
    console.log('Successfully imported vscode-languageclient');
} catch (error) {
    console.error('Failed to import vscode-languageclient:', error);
    throw error;
}

let client: any;

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activation started');
    
    const config = vscode.workspace.getConfiguration('nivlang');
    const serverPath = config.get<string>('languageServerPath');
    
    console.log('Server path from config:', serverPath);
    
    if (!serverPath) {
        vscode.window.showErrorMessage('Niv language server path not configured');
        return;
    }

    // Get the workspace folder path
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }
    const workspacePath = workspaceFolders[0].uri.fsPath;
    console.log('Workspace path:', workspacePath);

    // Resolve the server path relative to the workspace
    const resolvedPath = path.resolve(workspacePath, serverPath);
    console.log('Resolved server path:', resolvedPath);

    // Check if the file exists
    if (!require('fs').existsSync(resolvedPath)) {
        vscode.window.showErrorMessage(`Language server not found at: ${resolvedPath}`);
        return;
    }

    const serverOptions = {
        command: 'node',
        args: [resolvedPath, '--stdio'],
        options: {
            env: {
                ...process.env,
                NODE_OPTIONS: '--no-warnings'
            }
        }
    };

    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'nivlang' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.nl')
        }
    };

    console.log('Creating LanguageClient...');
    client = new LanguageClient(
        'nivlang',
        'Niv Language Server',
        serverOptions,
        clientOptions
    );

    console.log('Starting LanguageClient...');
    client.start();
    console.log('LanguageClient started successfully');
}

export function deactivate(): Thenable<void> | undefined {
    console.log('Extension deactivation started');
    if (!client) {
        console.log('No client to stop');
        return undefined;
    }
    console.log('Stopping client...');
    return client.stop();
} 