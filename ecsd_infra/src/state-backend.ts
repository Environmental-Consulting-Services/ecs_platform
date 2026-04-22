import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { infraConfig } from "./config";
import { InfrastructureConfig } from "./types";

type LabelMap = pulumi.Input<Record<string, pulumi.Input<string>>>;

export interface StateBackendBootstrapArgs {
  config?: InfrastructureConfig;
  project?: pulumi.Input<string>;
  bucketName: string;
  location?: pulumi.Input<string>;
  labels?: LabelMap;
  storageClass?: pulumi.Input<string>;
  forceDestroy?: pulumi.Input<boolean>;
  versioning?: pulumi.Input<boolean>;
  retentionPeriodSeconds?: pulumi.Input<number>;
  importExisting?: boolean;
}

export interface StateBackendBootstrapOutputs {
  bucket: gcp.storage.Bucket;
  bucketName: pulumi.Output<string>;
  backendUrl: pulumi.Output<string>;
  bootstrapCaveat: pulumi.Output<string>;
}

export class PulumiStateBootstrapBucket
  extends pulumi.ComponentResource
  implements StateBackendBootstrapOutputs
{
  readonly bucket: gcp.storage.Bucket;
  readonly bucketName: pulumi.Output<string>;
  readonly backendUrl: pulumi.Output<string>;
  readonly bootstrapCaveat: pulumi.Output<string>;

  constructor(
    name: string,
    args: StateBackendBootstrapArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:statebackend:PulumiStateBootstrapBucket", name, {}, opts);

    const config = args.config ?? infraConfig;
    const project = args.project ?? config.gcp.project;
    const location = args.location ?? config.gcp.region;
    const importExisting = args.importExisting ?? true;

    this.bucket = new gcp.storage.Bucket(
      `${name}-bucket`,
      {
        project,
        name: args.bucketName,
        location,
        labels: args.labels,
        storageClass: args.storageClass ?? "STANDARD",
        forceDestroy: args.forceDestroy ?? false,
        uniformBucketLevelAccess: true,
        publicAccessPrevention: "enforced",
        versioning: {
          enabled: args.versioning ?? true,
        },
        lifecycleRules: [
          {
            action: {
              type: "Delete",
            },
            condition: {
              numNewerVersions: 20,
            },
          },
        ],
        retentionPolicy:
          args.retentionPeriodSeconds !== undefined
            ? {
                retentionPeriod: args.retentionPeriodSeconds,
              }
            : undefined,
      },
      {
        parent: this,
        import: importExisting ? args.bucketName : undefined,
      },
    );

    this.bucketName = this.bucket.name;
    this.backendUrl = pulumi.interpolate`gs://${this.bucket.name}`;
    this.bootstrapCaveat = pulumi.interpolate`Bootstrap-only bucket at ${this.backendUrl}. Create or import it before switching a stack backend; do not assume an already-active stack can transparently manage its own in-use backend bucket without an explicit migration/import flow.`;

    this.registerOutputs({
      bucket: this.bucket,
      bucketName: this.bucketName,
      backendUrl: this.backendUrl,
      bootstrapCaveat: this.bootstrapCaveat,
    });
  }
}
