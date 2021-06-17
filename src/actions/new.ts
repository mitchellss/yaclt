import { execSync } from "child_process";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";
import { Icons } from "../utils/icons";
import { toValidFilename } from "../utils/path-utils";
import { StringFormatParams } from "../utils/string-format";
import { ActionOptions } from "./action-options";

export interface ActionNewOptions extends ActionOptions {
  changeType: string;
  issueId?: string;
  gitBranchFormat?: string;
  message?: string;
}

export const ActionNew = (options: ActionNewOptions) => {
  const ouputPath = path.join(
    options.dir,
    toValidFilename(
      `${new Date()
        .toISOString()
        .replace(".", "-")
        .replace(/[a-zA-Z]/g, "")}.md`
    )
  );

  let issueId: string | undefined;
  if (options.issueId) {
    issueId = options.issueId;
  } else if (options.gitBranchFormat) {
    const branch = execSync("git branch --show-current").toString();
    if (branch) {
      const pattern = new RegExp(options.gitBranchFormat);
      issueId = branch.match(pattern)?.[1];
    }
  }

  const template = Handlebars.compile(options.format);
  const entryText = template({
    [StringFormatParams.changeType]: options.changeType,
    [StringFormatParams.message]:
      options.message ?? "A user-friendly description of your change",
    [StringFormatParams.issueId]: issueId ?? "0000",
  });

  if (!fs.existsSync(options.dir)) {
    fs.mkdirSync(options.dir);
  }

  fs.writeFileSync(ouputPath, entryText);
  console.log(
    `${Icons.success} Changelog entry placeholder generated at ${ouputPath}!`
  );
};