import * as fs from "fs";
import { parse } from "csv-parse";

const apiCsvPath = "../api.csv";

const outDir = "../../assist/service";

type ApiCsv = {
  method: string;
  path: string;
  description: string;
  description_cht: string;
};

class APIWrapper {
  method: string = "";
  description: string = "";
  fullPath: string = "";

  service: string = "";
  version: string = "";
  path: string = "";

  functionName: string = "";
  inputDTO: string = "";
  outputDTO: string = "";

  constructor(apiCsv: ApiCsv) {
    if (apiCsv.method == "DELETE") {
      apiCsv.method = "DEL";
    }

    console.log(apiCsv);

    this.method = apiCsv.method.toLowerCase();
    this.description = apiCsv.description;
    this.fullPath = apiCsv.path;

    const regex = new RegExp(
      "/api/(?<service>[a-zA-Z]+)/v(?<version>[0-9]{1})/(?<path>[a-zA-Z]+)"
    );

    const s = apiCsv.path;

    const match = s.match(regex);

    const str1 = match!.groups!.service;

    this.service =
      str1.charAt(0).toUpperCase() + str1.slice(1).toLowerCase() + "Service";
    this.version = "V" + match!.groups!.version;

    const str2 = match!.groups!.path;
    this.path = str2.charAt(0).toUpperCase() + str2.slice(1).toLowerCase();

    this.functionName = this.method + this.version + this.path;

    this.inputDTO =
      "In" +
      this.functionName.charAt(0).toUpperCase() +
      this.functionName.slice(1) +
      "DTO";
    this.outputDTO =
      "Out" +
      this.functionName.charAt(0).toUpperCase() +
      this.functionName.slice(1) +
      "DTO";
  }
}

async function doAPIReader() {
  const apiMap = new Map<string, APIWrapper[]>();

  const content = fs.readFileSync(apiCsvPath);

  const parser = parse(content, {
    delimiter: ",",
    columns: ["method", "path", "description", "description_cht", "status"],
  });

  parser.on("data", (data: ApiCsv) => {
    let record = new APIWrapper(data);

    if (!apiMap.has(record.service)) {
      apiMap.set(record.service, [record]);
    } else {
      apiMap.get(record.service)!.push(record);
    }
  });

  parser.on("end", () => {
    writeTS(apiMap);
  });

  parser.on("error", (error) => {
    console.error("Error while parsing CSV:", error);
  });
}

function writeTS(map: Map<string, APIWrapper[]>) {
  map.forEach((v, k) => {
    let dto: string[] = [];
    let content: string[] = [];

    content.push("    static roleMap = new Map<string, UserRoles[]>();");
    content.push("\n");

    v.forEach((ele) => {
      dto.push(`export type ${ele.inputDTO} = {}`);
      dto.push(`export type ${ele.outputDTO} = {}`);

      content.push(`    //${ele.description}`);
      content.push(`    @PermitRoles(${k}.roleMap, [])`);
      content.push(
        `    static async ${ele.functionName}(obj: ${ele.inputDTO}): Promise<ResponseEntity<${ele.outputDTO}>>{`
      );
      content.push(
        `        WinstonLogger.info({start: '${ele.functionName}', obj: obj});`
      );
      content.push(`        return ResponseJSON`);
      content.push(`            .builder()`);
      content.push(`            .setStatusCode(200)`);
      content.push(`            .build();`);
      content.push(`    }`);
      content.push(`\n`);
    });

    let dtoContent = dto.join("\n") + "\n\n";

    let file = `export class ${k} {` + "\n\n" + content.join("\n") + "\n" + "}";

    fs.writeFile(
      outDir + "/" + k + ".ts",
      dtoContent + file,
      "utf-8",
      () => {}
    );
  });
}

doAPIReader();
