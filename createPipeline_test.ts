import { assertThrows } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import {
  assertSnapshot,
} from "https://deno.land/std@0.177.0/testing/snapshot.ts";
import { createPipeline, validatePipelineName } from "./createPipeline.ts";

const test_dir = "test_dir";

Deno.test(async function createsActionsPipeline(context) {
  await Deno.mkdir(test_dir);
  const path = "build.yaml";

  const githubDir = ".github/workflows";
  createPipeline(path, { canary: false, verbose: false }, test_dir);
  const file = await Deno.readFile(`${test_dir}/${githubDir}/${path}`);

  await assertSnapshot(context, new TextDecoder().decode(file));
  await Deno.remove(test_dir, { recursive: true });
});

Deno.test(async function throwsOnInvalidFileExtension() {
  await Deno.mkdir(test_dir);
  const path = "pipeline.toml";

  assertThrows(() => {
    validatePipelineName(path);
  });

  await Deno.remove(test_dir, { recursive: true });
});
