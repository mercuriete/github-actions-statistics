import { Octokit } from "@octokit/rest";
import commandLineArgs, { OptionDefinition } from "command-line-args";

const optionDefinitions: OptionDefinition[] = [
  { name: "organization", alias: "o", type: String, defaultValue: "octokit" },
];

const options = commandLineArgs(optionDefinitions);

const octokit = new Octokit();
octokit.rest.repos
  .listForOrg({
    org: options.organization,
    type: "public",
  })
  .then(({ data }) => {
    console.log(data);
  });
