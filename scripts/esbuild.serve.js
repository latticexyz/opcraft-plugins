import { serve } from "esbuild";
import glob from "glob";

glob("./plugins/*", (_, entryPoints) => {
  const serveOptions = {
    servedir: "www",
  };

  const buildOptions = {
    entryPoints,
    bundle: true,
  };

  serve(serveOptions, buildOptions).catch((err) => {
    process.stderr.write(err.stderr);
    process.exit(1);
  });
});
