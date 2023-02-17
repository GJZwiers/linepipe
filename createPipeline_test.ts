import { assertThrows } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import {
  assertSnapshot,
} from "https://deno.land/std@0.177.0/testing/snapshot.ts";
import { createPipeline } from "./createPipeline.ts";

const test_dir = "test_dir";

Deno.test(async function throwsWhenNoGitHubDir() {
  await Deno.mkdir(test_dir);
  const path = `${test_dir}/build.yaml`;

  assertThrows(() => {
    createPipeline(path, { canary: false, githubDir: false });
  });

  await Deno.remove(test_dir, { recursive: true });
});

Deno.test(async function createsYAMLPipelineAndGitHubDir(context) {
  await Deno.mkdir(test_dir);
  const path = "build.yaml";

  const githubDir = ".github/workflows";
  createPipeline(path, { canary: false, githubDir: true }, test_dir);
  const file = await Deno.readFile(`${test_dir}/${githubDir}/${path}`);

  await assertSnapshot(context, new TextDecoder().decode(file));
  await Deno.remove(test_dir, { recursive: true });
});
