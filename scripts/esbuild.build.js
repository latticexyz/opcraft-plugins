import { build } from "esbuild";
import glob from "glob";

glob("./plugins/*", (_, entryPoints) => {
  const buildOptions = {
    entryPoints,
    bundle: true,
    outdir: "www",
  };

  build(buildOptions).catch((err) => {
    process.stderr.write(err.stderr);
    process.exit(1);
  });
});
