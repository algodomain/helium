#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const buildAlgo = require("./buildAlgo");
const buildProj = require("./buildProj");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const access = util.promisify(fs.access);

function replaceStringInJSFiles(dir, excludeDir, searchString, replaceString) {
  let files = fs.readdirSync(dir);
  for (let file of files) {
    let filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (filePath !== excludeDir) {
        replaceStringInJSFiles(
          filePath,
          excludeDir,
          searchString,
          replaceString
        );
      }
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf8");
      content = content.split(searchString).join(replaceString);
      fs.writeFileSync(filePath, content);
    }
  }
}

function getCSSFiles(dir) {
  let files = fs.readdirSync(dir);
  let cssFiles = [];
  for (let file of files) {
    if (file.endsWith(".css")) {
      cssFiles.push(path.join(dir, file));
    }
  }
  return cssFiles;
}

// Function to merge CSS files into a single file
function mergeCSSFiles(files, outputFile) {
  let mergedCSS = "";
  for (let file of files) {
    let css = fs.readFileSync(file, "utf8");
    mergedCSS += css;
  }
  fs.writeFileSync(outputFile, mergedCSS);
}

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
  if (filePath.includes("@algodomain")) {
    fileContents = fileContents.replace(/from "@algodomain/g, 'from ".');
  } else {
    fileContents = fileContents.replace(
      /from "@algodomain/g,
      'from "' + getParentPath(level) + "@algodomain"
    );
  }
  // Write the updated contents back to the file
  fs.writeFileSync(filePath, fileContents);
}

function walk(dir, level) {
  if (fs.statSync(dir).isFile() && path.extname(dir) === ".js") {
    replaceStringInFile(dir, level);
  }

  if (fs.statSync(dir).isDirectory()) {
    if (path.basename(dir) === "node_modules") {
      return;
    }

    var files = fs.readdirSync(dir);

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      walk(path.join(dir, file), level + 1);
    }
  }
}

function generateStaticRouteHtmlFile(error, files) {
  if (error) {
    console.error(error);
    return;
  }
  for (let file of files) {
    let content = fs.readFileSync(file, "utf8");
    let lines = content.match(/<Route.*/gm);

    if (lines) {
      lines.forEach((line) => {
        let path = getAttributeValue(line, "path");
        console.log(path);
        generateRoutingFile("dist" + path);
      });
    }
  }
}

function getAttributeValue(str, attributeName) {
  let regex = /\s+(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^><"' \s]+)))?/g;
  let attributes = {};
  let match;
  while ((match = regex.exec(str))) {
    let name = match[1];
    let value = match[2] || match[3] || match[4];
    attributes[name] = value;
  }
  let value = attributes[attributeName];
  if (value) {
    return value;
  } else {
    return null;
  }
}

function generateRoutingFile(folderName) {
  const fileName = "index.html";
  const fileContent = "<script>window.location.href = '/'</script>";
  fs.mkdir(folderName, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    } else {
      fs.writeFile(`${folderName}/${fileName}`, fileContent, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Folder and file created successfully!");
        }
      });
    }
  });
}

async function resolvePath() {
  await waitForDirRemoval("./dist/@algodomain-temp");
  await waitForString("./dist/buildstatus.txt", countJsFiles("./src"));

  walk(process.cwd() + "/dist", 0);

  let cssFiles = getCSSFiles(process.cwd() + "/src/css");
  fs.mkdir(process.cwd() + "/dist/css", () => {});
  mergeCSSFiles(cssFiles, process.cwd() + "/dist/css/styles.css");
  fs.cp("index.html", "./dist/index.html", () => {});

  replaceStringInJSFiles(
    process.cwd() + "/dist",
    path.join(process.cwd() + "/dist", "@algodomain"),
    "update: true",
    "updateId: props.updateId"
  );

  const filePattern = "src/*.js";
  glob(filePattern, generateStaticRouteHtmlFile);
}

function countJsFiles(dir) {
  let count = 0;
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      count += countJsFiles(fullPath);
    } else if (file.endsWith(".js")) {
      count++;
    }
  });
  return count;
}

async function waitForString(filePath, count) {
  let data;
  do {
    await waitForFile(filePath);
    data = fs.readFileSync(filePath, "utf8");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (!data.split("\n").some((line) => line.length === count));
}

async function waitForDirRemoval(dir) {
  while (true) {
    try {
      await access(dir, fs.constants.F_OK);
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      break;
    }
  }
}
async function waitForFile(filePath) {
  while (true) {
    try {
      await access(filePath, fs.constants.F_OK);
      break;
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

function buildSource() {
  fs.rmSync("./dist/buildstatus.txt", { force: true });
  buildAlgo();
  buildProj();
  resolvePath();
}

buildSource();
