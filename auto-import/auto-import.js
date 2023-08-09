// my-custom-import-plugin.js

module.exports = function myCustomImportPlugin({ types: t }) {
  return {
    visitor: {
      Program(path) {
        // Create the import statement AST node
        const customImportStatement = t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier('createElement'),
              t.identifier('createElement'),
            ),
          ],
          t.stringLiteral('@helium/core'),
        )

        // Insert the custom import statement at the beginning of the program
        path.node.body.unshift(customImportStatement)
      },
    },
  }
}
