const fs = require("fs");
const path = require("path");

module.exports = () => {
  walk(process.cwd() + "/dist", 0);
};

function getParentPath(depth) {
  // Initialize the path with the current directory
  let path = "./";
  // Add the parent directory for each level of depth
  for (let i = 1; i < depth; i++) {
    path += "../";
  }
  return path;
}

function replaceStringInFile(filePath, level) {
  // Read the contents of the file
  let fileContents = fs.readFileSync(filePath, "utf8");

  // Replace all occurrences of the string
  fileContents = fileContents.replace(
    /from "@algodomain/g,
    'from "' + getParentPath(level) + "@algodomain"
  );

  // Write the updated contents back to the file
  fs.writeFileSync(filePath, fileContents);
}

function walk(dir, level) {
  if (fs.statSync(dir).isFile() && path.extname(dir) === ".js") {
    //from "@algodomain
    replaceStringInFile(dir, level);
    console.log(dir + ": " + level + " : " + getParentPath(level));
  }

  if (fs.statSync(dir).isDirectory()) {
    if (
      path.basename(dir) === "@algodomain" ||
      path.basename(dir) === "node_modules"
    ) {
      return;
    }

    var files = fs.readdirSync(dir);

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      walk(path.join(dir, file), level + 1);
    }
  }
}
