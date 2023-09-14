import { execCommand } from "../shared";

export async function taze() {
  const args=process.argv.slice(3)
  execCommand("npx", ["taze", ...args], { stdio: "inherit" });
}
