module.exports = function myCustomImportPlugin({ types: t }) {
  return {
    visitor: {
      Program(path, state) {
        // Create the import statement AST node
        const filename = state.file.opts.filename;
        if (!filename.includes("@algodomain")) {
          const customImportStatement = t.importDeclaration(
            [
              t.importSpecifier(
                t.identifier("createElement"),
                t.identifier("createElement")
              ),
            ],
            t.stringLiteral("@algodomain/core")
          );

          // Insert the custom import statement at the beginning of the program
          path.node.body.unshift(customImportStatement);
        }
      },
    },
  };
};
