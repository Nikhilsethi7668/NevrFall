// Utils/getDelhiveryClient.js
import axios from "axios";
import DelhiveryConfig from "../Models/DelhiveryConfig.js";

export default async function getDelhiveryClient(name = "default") {
  const cfg = await DelhiveryConfig.findOne({ name }).lean();
  if (!cfg) throw new Error(`DelhiveryConfig '${name}' not found`);
  const base = cfg.isStaging ? cfg.stagingUrl || cfg.baseUrl : cfg.baseUrl;
  if (!base || !cfg.token)
    throw new Error("DelhiveryConfig must contain baseUrl and token");

  const client = axios.create({
    baseURL: base.replace(/\/$/, ""),
    timeout: 30000,
    headers: {
      Authorization: `Token ${cfg.token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return { client, config: cfg };
}
