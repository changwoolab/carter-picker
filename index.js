import fs from "fs";
import { stringify } from "csv-stringify";
import inquirer from "inquirer";

async function main() {
  const questions = [
    {
      type: "input",
      name: "filepath",
      message: "랜덤으로 뽑을 파일의 경로를 입력해주세요. \n(예시: ./20명추첨)",
      validate: (input) => input.trim().length !== 0,
      transformer: (input) => input.trim(),
    },
    {
      type: "input",
      name: "outputFilepath",
      message: "저장될 csv 파일의 이름을 입력해주세요. \n(예시: 20명추첨.csv)",
      transformer: (input) => input.trim(),
    },
  ];

  await showLogo();
  const answer = await inquirer.prompt(questions);

  const files = readFileAndSerialize(answer.filepath);
  const result = getRandom(files, 40);

  const serializedResult = result.reduce(
    (acc, curr) => {
      acc.push([curr]);
      return acc;
    },
    [["추첨결과"]]
  );

  stringify(serializedResult, (err, output) => {
    if (err) throw err;
    fs.writeFileSync(answer.outputFilepath, output);
  });
}

main();

async function showLogo() {
  const logo = `
  _________                                      _________                __                
  /   _____/ ____   ____   _____    ____   ____   \\_   ___ \\_____ ________/  |_  ___________ 
  \\_____  \\ /  _ \\ /  _ \\ /     \\  / ___\\ /  _ \\  /    \\  \\/\\__  \\\\_  __ \\   __\\/ __ \\_  __ \\
  /        (  <_> |  <_> )  Y Y  \\/ /_/  >  <_> ) \\     \\____/ __ \\|  | \\/|  | \\  ___/|  | \\/
 /_______  /\\____/ \\____/|__|_|  /\\___  / \\____/   \\______  (____  /__|   |__|  \\___  >__|   
         \\/                    \\//_____/                  \\/     \\/                 \\/                                      
  `;
  console.log(logo);
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

function getRandom(arr, n) {
  const result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

function readFileAndSerialize(filepath) {
  return fs
    .readFileSync(filepath, "utf8")
    .split("\n")
    .filter((v) => v !== "");
}
