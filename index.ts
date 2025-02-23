import { parseFile } from "@fast-csv/parse";

parseFile("data.csv", { headers: true })
  .on("error", (error) => console.error(error))
  .on("data", (row) => console.log(row))
  .on("end", (rowCount: number) => console.log(`Parsed ${rowCount} rows`));
