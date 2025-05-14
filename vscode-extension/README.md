# Niv Language Support

VS Code extension providing syntax highlighting for the Niv programming language.

## Features

* Syntax highlighting for `.nl` files
* Support for:
  * Keywords (if, from, import, test, type, func, return)
  * String literals with interpolation
  * Type declarations (including optional types with ?)
  * Function calls
  * Comments

## Installation

1. Download the `.vsix` file from the releases
2. In VS Code:
   * Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
   * Type "Extensions: Install from VSIX"
   * Select the downloaded `.vsix` file

## Development

To build the extension:

```bash
npm install -g vsce
vsce package
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 