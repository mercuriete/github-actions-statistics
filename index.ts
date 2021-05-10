import { Octokit } from "@octokit/rest";
import commandLineArgs, { OptionDefinition } from "command-line-args";

const optionDefinitions: OptionDefinition[] = [
  { name: "organization", alias: "o", type: String, defaultValue: "octokit" },
  {
    name: "repository",
    alias: "r",
    type: String,
    defaultValue: "rest.js",
  },
];

const options = commandLineArgs(optionDefinitions);

const octokit = new Octokit();
// list all public repos belonging to a given organization from commmand line arg
octokit.rest.repos
  .listForOrg({
    org: options.organization,
    type: "public",
  })
  .then(({ data }) => {
    data
      // filter out the repos that doesn't exactly match with repository command line argument
      .filter((repo) => repo.name === options.repository)
      .map((repository) =>
        // for all repositories that previously match, get all workflows
        octokit.rest.actions
          .listWorkflowRunsForRepo({
            repo: repository.name,
            owner: repository.owner?.login as string,
          })
          .then(({ data }) => {
            data.workflow_runs.map((workflow) =>
              // for all workflows previously retrieved, get all jobs
              octokit.rest.actions
                .listJobsForWorkflowRun({
                  owner: repository.owner?.login as string,
                  repo: repository.name,
                  run_id: workflow.id,
                })
                .then(({ data }) =>
                  data.jobs.map((job) =>
                    // for all jobs previously retrieved, print a csv line to stdout
                    // after that you can paste it into a spreadsheet
                    // TODO: use a CSV library
                    console.log(
                      job.id +
                        ", " +
                        new Date(job.started_at).getTime() +
                        ", " +
                        new Date(job.completed_at).getTime()
                    )
                  )
                )
            );
          })
      );
  });
