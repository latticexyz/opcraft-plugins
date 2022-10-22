import glob from "glob";
import fs from "fs";

glob("./plugins/*", (_, plugins) => {
  const index = {
    plugins: plugins.map((p) => "/" + p.replace("./plugins/", "") + ".js"),
    source: "https://github.com/latticexyz/opcraft-plugins",
  };

  fs.mkdirSync("./www");
  fs.writeFileSync("./www/index.json", JSON.stringify(index));
});
