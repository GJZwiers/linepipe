import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { createPipeline, validatePipelineName } from "./createPipeline.ts";

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
    "--name <name:string>",
    "The name of the pipeline file",
    {
      default: "pipeline.yaml",
    },
  )
  .action((options) => {
    validatePipelineName(options.name);
    createPipeline(options.name, options);
  })
  .parse();
