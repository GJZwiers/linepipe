import YAML from "npm:yaml";

export function validatePipelineName(name: string) {
  if (!/\.ya?ml$/.test(name)) {
    throw new Error(
      `Invalid name: ${name}. Pipeline must end with .yaml or .yml file extension`,
    );
  }
}

export function createPipeline(
  path: string,
  options: { canary: boolean },
  dir?: string,
) {
  const matrix = {
    os: ["ubuntu-22.04", "macos-12", "windows-2022"],
    "deno-version": ["v1.x"],
    include: (options.canary)
      ? [{ "deno-version": "canary", os: "ubuntu-22.04" }]
      : undefined,
  };

  const yamlObject = {
    name: "build",
    on: {
      push: {
        branches: ["main"],
      },
      pull_request: {
        branches: ["main"],
      },
    },
    jobs: {
      build: {
        "runs-on": "${{ matrix.os }}",
        "continue-on-error": (options.canary)
          ? '${{ matrix.deno-version == "canary" }}'
          : undefined,
        strategy: {
          matrix,
        },
        env: {
          DENO_DIR: "deno_dir",
        },
        steps: [
          {
            name: "Configure line-endings for Windows build",
            if: "matrix.os == 'windows-2022'",
            run:
              "git config --system core.autocrlf false\ngit config --system core.eol lf",
          },
          {
            uses: "actions/checkout@v3",
          },
          {
            uses: "denoland/setup-deno@v1.1.1",
            with: {
              "deno-version": "${{ matrix.deno-version }}",
            },
          },
          {
            run: "deno fmt --check",
          },
          {
            run: "deno lint",
          },
          {
            run: "deno check main.ts",
          },
          {
            name: "Cache DENO_DIR",
            uses: "actions/cache@v3",
            with: {
              path: "${{ env.DENO_DIR }}",
              key: "${{ hashFiles('deno.lock') }}",
            },
          },
          {
            run: "deno test --coverage=cov/",
          },
          {
            if:
              "matrix.os == 'ubuntu-22.04' && matrix.deno-version != 'canary'",
            run: "deno coverage --lcov --output=cov.lcov cov/",
          },
        ],
      },
    },
  };

  const yaml = YAML.stringify(yamlObject);
  const githubFolder = dir ? `${dir}/.github/workflows` : ".github/workflows";
  const data = new TextEncoder().encode(yaml);

  try {
    Deno.writeFileSync(`${githubFolder}/${path}`, data);
  } catch (e) {
    let writePath = path;
    if (e instanceof Deno.errors.NotFound) {
      writePath = `${githubFolder}/${path}`;
      Deno.mkdirSync(githubFolder, { recursive: true });
    } else if (e instanceof Deno.errors.PermissionDenied) {
      throw new Error(`Permission to ${githubFolder} was denied.`);
    }
    Deno.writeFileSync(writePath, data);
  }
}
