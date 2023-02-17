import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { createPipeline } from "./createPipeline.ts";

await new Command()
  .name("linepipe")
  .description("Add a pipeline to Deno projects")
  .version("0.1.0")
  .option(
    "--canary [canary:boolean]",
    "Add Deno canary workflow run",
    {
      default: false,
    },
  )
  .option(
    "--github-dir [githubDir:boolean]",
    "Create .github/workflows directory",
    {
      default: true,
    },
  )
  .action((options) => {
    createPipeline("build.yaml", options);
  })
  .parse();
