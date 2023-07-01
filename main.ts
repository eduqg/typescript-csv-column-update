import fs from "fs";
import { parse } from "csv-parse";

interface IUpdateSlugRows {
  input: string;
  output: string;
}
interface IError {
  message: string;
}

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function joinResults(results: string[][]) {
  const header = ["id, name, slug"];
  const rows = results.map((item) => `${item[0]}, ${item[1]}, ${item[2]}`);
  return header.concat(rows).join("\n");
}

function writeToCSVFile(results: Array<string[]>, output: string) {
  fs.writeFile(output, joinResults(results), (err: any) => {
    if (err) {
      console.log("Error writing to csv file", err);
    } else {
      console.log(`Saved as ${output}`);
    }
  });
}

function updateSlugRows({ input, output }: IUpdateSlugRows) {
  let results: Array<string[]> = [];

  fs.createReadStream(`./${input}`)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row: string[]) {
      row[2] = slugify(row[1]);
      results.push(row);
    })
    .on("end", function () {
      writeToCSVFile(results, output);
    })
    .on("error", function (error: IError) {
      console.log(error.message);
    });
}

updateSlugRows({ input: "input.csv", output: "output.csv" });

console.log("Finished!");
