#!/usr/bin/env node

import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentSyncKind,
  InitializeResult,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { getTokens } from './compiler';
import { createParserContext } from './parser/context';
import { parser } from './parser/parser';
import { CompilerError } from './error/types';

// Create a connection for the server using stdio transport
const connection = createConnection(process.stdin, process.stdout);

// Create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }

  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(() => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // The validator creates diagnostics for all syntax errors
  const text = textDocument.getText();

  try {
    const tokens = getTokens(text, textDocument.uri);
    const context = createParserContext(tokens, textDocument.uri);
    parser(context);

    // If compilation succeeds, clear any existing diagnostics
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
  } catch (error: unknown) {
    let diagnostic: Diagnostic;

    if (error instanceof CompilerError) {
      diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: textDocument.positionAt(error.location?.start ?? 0),
          end: textDocument.positionAt(error.location?.end ?? text.length),
        },
        message: error.message,
        source: 'nivlang',
      };
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: textDocument.positionAt(0),
          end: textDocument.positionAt(text.length),
        },
        message: errorMessage,
        source: 'nivlang',
      };
    }

    // Send the computed diagnostics to VSCode
    connection.sendDiagnostics({
      uri: textDocument.uri,
      diagnostics: [diagnostic],
    });
  }
}

connection.onDidChangeWatchedFiles(() => {
  // Monitored files have change in VSCode
  connection.console.log('We received a file change event');
});

// This handler provides the initial list of completion items.
connection.onCompletion((): CompletionItem[] => {
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  return [
    {
      label: 'function',
      kind: CompletionItemKind.Keyword,
      data: 1,
    },
    {
      label: 'let',
      kind: CompletionItemKind.Keyword,
      data: 2,
    },
    {
      label: 'const',
      kind: CompletionItemKind.Keyword,
      data: 3,
    },
  ];
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.data === 1) {
    item.detail = 'Function declaration';
    item.documentation = 'Declare a new function';
  } else if (item.data === 2) {
    item.detail = 'Let declaration';
    item.documentation = 'Declare a mutable variable';
  } else if (item.data === 3) {
    item.detail = 'Const declaration';
    item.documentation = 'Declare an immutable variable';
  }

  return item;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
