import { Parser } from "cast.ts";
import debug from "debug";
import { Router } from "express";
import { writeFileSync } from "fs";
import { genTsType } from "gen-ts-type";
import { join } from "path";
import { parseTsType } from "ts-type-check";
import { env } from "./env";
import { HttpError } from "./error";
import { getJWT, JWTPayload } from "./jwt";
import { TUser } from "./proxy";

export function defModule() {
  let log = debug("api");
  log.enabled = true;

  let router = Router();
  let apiPrefix = "/api";

  let code = `
import { ApiService } from './app/api.service'

export let api_origin = '${env.ORIGIN}${apiPrefix}'

let store = typeof window == 'undefined' ? null : localStorage

let token = store?.getItem('token')

export function getToken() {
  return token
}

export function clearToken() {
  token = null
  store?.removeItem('token')
}

function post(url: string, body: object, token_?: string) {
  return fetch(api_origin + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token_
    },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .catch(err => ({ error: String(err) }))
    .then(json => {
      if (json.error) {
        return Promise.reject(json.error)
      }
      if (json.token) {
        token = json.token as string
        store?.setItem('token', token)
      }
      if (!url.includes('get')) {
        ApiService.instance?.triggerUpdate()
      }
      return json
    })
}
`;

  function defAPI<Input, Output>(
    api: {
      name: string;
      sampleInput?: Input;
      sampleOutput?: Output;
      inputParser?: Parser<Input>;
      outputParser?: Parser<Output>;
    } & (
      | {
          //auto checking role
          role: TUser["role"];
          // optional when not implemented
          fn?: (input: Input, jwt: JWTPayload) => Output | Promise<Output>;
        }
      | {
          //auto checking role
          role?: TUser["role"];
          // optional when not implemented
          fn?: (input: Input) => Output | Promise<Output>;
        }
    )
  ) {
    let name = api.name;
    // console.log("API:", name);
    let Name = name[0].toUpperCase() + name.slice(1);
    let InputType =
      api.inputParser?.type ??
      patchDataType(
        genTsType(api.sampleInput ?? {}, { format: true, semi: true })
      );
    let OutputType =
      api.outputParser?.type ??
      patchDataType(
        genTsType(api.sampleOutput ?? {}, { format: true, semi: true })
      );

    code += `
export type ${Name}Input = ${InputType}
export type ${Name}Output = ${OutputType}`;
    if (api.role) {
      code += `
export function ${name}(input: ${Name}Input & { token: string }): Promise<${Name}Output & { error?: string }> {
  let { token, ...body } = input
	return post('/${name}', body, token)
}
`;
    } else {
      code += `
export function ${name}(input: ${Name}Input): Promise<${Name}Output & { error?: string }> {
	return post('/${name}', input)
}
`;
    }

    const inputParser = api.inputParser;
    let parseInput: (body: unknown) => Input;
    if (inputParser) {
      parseInput = (body) => inputParser.parse(body, { name: "req.body" });
    } else {
      const typeChecker = parseTsType(InputType);
      parseInput = (body) => {
        try {
          typeChecker.check(body, { casualBoolean: true });
        } catch (error) {
          log("invalid input:", error);
        }
        return body as Input;
      };
    }

    const outputParser = api.outputParser;
    let parseOutput: (json: Output) => Output;
    if (outputParser) {
      parseOutput = (json) => outputParser.parse(json, { name: "res.body" });
    } else {
      // console.debug('parse ts type:', OutputType)
      const typeChecker = parseTsType(OutputType);
      parseOutput = (json) => {
        try {
          typeChecker.check(json, { casualBoolean: true });
        } catch (error) {
          log("invalid output:", error);
        }
        return json;
      };
    }

    router.post("/" + name, async (req, res) => {
      log(name, req.body);
      let json: Output | { error: string } | undefined;
      try {
        let body = parseInput(req.body);
        //optional for FRD didn't write the function
        if (!api.fn) {
          res.status(501);
          res.json(
            api.sampleOutput ??
              api.outputParser?.sampleValue ??
              api.outputParser?.randomSample()
          );
          return;
        }
        //auto checking role for input role
        if (api.role) {
          let jwt = getJWT(req);
          if (jwt.role !== api.role) {
            throw new HttpError(403, "this API is only for " + api.role);
          }
          json = await api.fn(body, jwt);
        } else {
          json = await api.fn(body);
        }
        // patchOutput(json)
        json = parseOutput(json);
      } catch (error: any) {
        if (error instanceof HttpError) {
          log("error:", error.statusCode, error.message);
        } else {
          log("output:", JSON.stringify(json, null, 2));
          log("error:", error);
        }
        let statusCode = error.statusCode || 500;
        res.status(statusCode);
        json = { error: String(error) };
      }
      res.json(json);
    });

    return api;
  }

  function saveSDK() {
    let content = code.trim() + "\n";
    let file = join("..", "client", "src", "sdk.ts");
    file = join("../frontend/src/sdk2.ts");
    writeFileSync(file, content);
    console.log("saved to", file);
  }

  return {
    defAPI,
    saveSDK,
    apiPrefix,
    router,
  };
}

function patchDataType(type: string): string {
  // console.debug("patchDataType:", type);
  type = type
    .replace(/pic: string;/g, "pic: string | null;")
    // .replace(/order_id: number;/g, "order_id: number | null;")
    .replace(/booking_id: number;/g, "booking_id: number | null;")
    .replace(/_amount: number;/g, "_amount: number | null;")
    .replace(/_deadline: number;/g, "_deadline: number | null;")
    .replace(/_time: number;/g, "_time: number | null;")
    .replace(/from_time: number \| null;/g, "from_time: number;")
    .replace(/to_time: number \| null;/g, "to_time: number;");
  // console.debug("patched:", type);
  return type;
}
