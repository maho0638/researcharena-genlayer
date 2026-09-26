import fs from "node:fs";
import { createHash } from "node:crypto";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const address = process.env.CONTRACT_ADDRESS;
if (!address) throw new Error("CONTRACT_ADDRESS is required");

const sourcePath =
  process.env.CONTRACT_SOURCE_PATH || "contracts/research_arena_v2.py";
const client = createClient({ chain: studionet });
const deployed = await client.getContractCode(address);
const repository = fs.readFileSync(sourcePath, "utf8");

const normalize = (value) => String(value).replace(/\r\n/g, "\n").trim();
const sha256 = (value) =>
  createHash("sha256").update(normalize(value), "utf8").digest("hex");

const deployedNormalized = normalize(deployed);
const repositoryNormalized = normalize(repository);

console.log("CONTRACT_SOURCE_PATH=" + sourcePath);
console.log("DEPLOYED_CONTRACT_ADDRESS=" + address);
console.log("DEPLOYED_SOURCE_SHA256=" + sha256(deployedNormalized));
console.log("REPOSITORY_SOURCE_SHA256=" + sha256(repositoryNormalized));

if (deployedNormalized !== repositoryNormalized) {
  console.error("RA_V2_DEPLOYED_SOURCE_MATCH=false");
  process.exit(1);
}

console.log("RA_V2_DEPLOYED_SOURCE_MATCH=true");
