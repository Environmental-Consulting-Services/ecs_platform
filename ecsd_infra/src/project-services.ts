import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { InfrastructureConfig } from "./types";

export const REQUIRED_PROJECT_SERVICES = [
  "artifactregistry.googleapis.com",
  "cloudresourcemanager.googleapis.com",
  "compute.googleapis.com",
  "file.googleapis.com",
  "iam.googleapis.com",
  "logging.googleapis.com",
  "monitoring.googleapis.com",
  "run.googleapis.com",
  "secretmanager.googleapis.com",
  "serviceusage.googleapis.com",
  "storage.googleapis.com",
  "vpcaccess.googleapis.com",
] as const;

export interface ProjectServicesArgs {
  config: InfrastructureConfig;
  disableOnDestroy?: pulumi.Input<boolean>;
  services?: readonly string[];
}

export class ProjectServices extends pulumi.ComponentResource {
  readonly services: gcp.projects.Service[];
  readonly serviceNames: pulumi.Output<string[]>;

  constructor(name: string, args: ProjectServicesArgs, opts?: pulumi.ComponentResourceOptions) {
    super("ecsd:project:ProjectServices", name, {}, opts);

    const serviceNames = args.services ?? REQUIRED_PROJECT_SERVICES;

    this.services = serviceNames.map(
      (service) =>
        new gcp.projects.Service(
          `${name}-${service.split(".")[0]}`,
          {
            project: args.config.gcp.project,
            service,
            disableOnDestroy: args.disableOnDestroy ?? false,
          },
          { parent: this },
        ),
    );

    this.serviceNames = pulumi.output([...serviceNames]);

    this.registerOutputs({
      serviceNames: this.serviceNames,
      services: this.services,
    });
  }
}
