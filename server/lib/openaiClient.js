import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config.js";

let client = null;

export function getOpenAI() {
  if (!client) {
    client = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return client;
}
