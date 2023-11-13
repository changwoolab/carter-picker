import fs from "fs";
import { stringify } from "csv-stringify";
import inquirer from "inquirer";

const QUESTIONS = [
  {
    type: "input",
    name: "filepath",
    message: "랜덤으로 뽑을 파일의 경로를 입력해주세요. \n(예시: ./20명추첨)",
    validate: (input) => input.trim().length !== 0,
    transformer: (input) => input.trim(),
  },
  {
    type: "input",
    name: "howmany",
    message: "몇 명을 추첨하시겠습니까?",
    validate: (input) => parseInt(input.trim()) > 0,
    transformer: (input) => input.trim(),
  },
  {
    type: "input",
    name: "outputFilepath",
    message: "저장될 csv 파일의 이름을 입력해주세요. \n(예시: 20명추첨.csv)",
    transformer: (input) => input.trim(),
  },
];

async function main() {
  await showLogo();

  const { filepath, howmany, outputFilepath } = await inquirer.prompt(
    QUESTIONS
  );

  const files = readFileAndSerialize(filepath);
  const result = getRandom(files, parseInt(howmany));

  const serializedResult = result.reduce(
    (acc, curr) => {
      acc.push([curr]);
      return acc;
    },
    [["추첨결과"]]
  );

  stringify(serializedResult, (err, output) => {
    if (err) throw err;
    fs.writeFileSync(outputFilepath, output);
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
  let result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("뽑을 수 있는 개수보다 뽑으려는 개수가 많습니다.");
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