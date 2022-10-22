import glob from "glob";
import fs from "fs";

glob("./plugins/*", (_, plugins) => {
  fs.mkdirSync("./www");
  fs.writeFileSync("./www/index.json", JSON.stringify(plugins.map((p) => "/" + p.replace("./plugins/", "") + ".js")));
});
