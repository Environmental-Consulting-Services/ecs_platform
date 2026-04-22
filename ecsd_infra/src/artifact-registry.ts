import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { infraConfig } from "./config";
import { InfrastructureConfig } from "./types";

type LabelMap = pulumi.Input<Record<string, pulumi.Input<string>>>;
type MemberList = pulumi.Input<string>[];
type CleanupPolicyAction = "DELETE" | "KEEP";

export interface ArtifactRegistryCleanupPolicyArgs {
  id: string;
  action: CleanupPolicyAction;
  tagState?: pulumi.Input<"ANY" | "TAGGED" | "UNTAGGED">;
  tagPrefixes?: pulumi.Input<pulumi.Input<string>[]>;
  versionNamePrefixes?: pulumi.Input<pulumi.Input<string>[]>;
  packageNamePrefixes?: pulumi.Input<pulumi.Input<string>[]>;
  olderThan?: pulumi.Input<string>;
  newerThan?: pulumi.Input<string>;
  keepCount?: pulumi.Input<number>;
}

export interface ArtifactRegistryModuleArgs {
  config?: InfrastructureConfig;
  project?: pulumi.Input<string>;
  location?: pulumi.Input<string>;
  repositoryId?: pulumi.Input<string>;
  description?: pulumi.Input<string>;
  format?: pulumi.Input<"DOCKER" | "MAVEN" | "NPM" | "APT" | "YUM" | "GO" | "KFP">;
  mode?: pulumi.Input<"STANDARD_REPOSITORY" | "VIRTUAL_REPOSITORY" | "REMOTE_REPOSITORY">;
  immutableTags?: pulumi.Input<boolean>;
  cleanupPolicyDryRun?: pulumi.Input<boolean>;
  cleanupPolicies?: ArtifactRegistryCleanupPolicyArgs[];
  labels?: LabelMap;
  readerMembers?: MemberList;
  writerMembers?: MemberList;
}

export interface ArtifactRegistryOutputs {
  repository: gcp.artifactregistry.Repository;
  repositoryId: pulumi.Output<string>;
  repositoryName: pulumi.Output<string>;
  repositoryUrl: pulumi.Output<string>;
  readerBindings: gcp.artifactregistry.RepositoryIamMember[];
  writerBindings: gcp.artifactregistry.RepositoryIamMember[];
}

function toCleanupPolicy(
  policy: ArtifactRegistryCleanupPolicyArgs,
): gcp.types.input.artifactregistry.RepositoryCleanupPolicy {
  const condition: gcp.types.input.artifactregistry.RepositoryCleanupPolicyCondition = {};

  if (policy.tagState) {
    condition.tagState = policy.tagState;
  }

  if (policy.tagPrefixes) {
    condition.tagPrefixes = policy.tagPrefixes;
  }

  if (policy.versionNamePrefixes) {
    condition.versionNamePrefixes = policy.versionNamePrefixes;
  }

  if (policy.packageNamePrefixes) {
    condition.packageNamePrefixes = policy.packageNamePrefixes;
  }

  if (policy.olderThan) {
    condition.olderThan = policy.olderThan;
  }

  if (policy.newerThan) {
    condition.newerThan = policy.newerThan;
  }

  return {
    id: policy.id,
    action: policy.action,
    condition: Object.keys(condition).length > 0 ? condition : undefined,
    mostRecentVersions:
      policy.keepCount !== undefined
        ? {
            keepCount: policy.keepCount,
          }
        : undefined,
  };
}

function createRepositoryMembers(
  parent: pulumi.Resource,
  name: string,
  role: string,
  members: MemberList | undefined,
  repository: gcp.artifactregistry.Repository,
  project: pulumi.Input<string>,
  location: pulumi.Input<string>,
): gcp.artifactregistry.RepositoryIamMember[] {
  if (!members) {
    return [];
  }

  return members.map(
    (member, index) =>
      new gcp.artifactregistry.RepositoryIamMember(
        `${name}-${role.split("/").pop()}-${index}`,
        {
          project,
          location,
          repository: repository.repositoryId,
          role,
          member,
        },
        { parent, dependsOn: [repository] },
      ),
  );
}

export class ArtifactRegistry extends pulumi.ComponentResource implements ArtifactRegistryOutputs {
  readonly repository: gcp.artifactregistry.Repository;
  readonly repositoryId: pulumi.Output<string>;
  readonly repositoryName: pulumi.Output<string>;
  readonly repositoryUrl: pulumi.Output<string>;
  readonly readerBindings: gcp.artifactregistry.RepositoryIamMember[];
  readonly writerBindings: gcp.artifactregistry.RepositoryIamMember[];

  constructor(
    name: string,
    args: ArtifactRegistryModuleArgs = {},
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:artifactregistry:ArtifactRegistry", name, {}, opts);

    const config = args.config ?? infraConfig;
    const project = args.project ?? config.gcp.project;
    const location = args.location ?? config.gcp.region;
    const repositoryId = args.repositoryId ?? config.artifactRegistryRepository;
    const environment = config.environment;

    this.repository = new gcp.artifactregistry.Repository(
      `${name}-repository`,
      {
        project,
        location,
        repositoryId,
        description:
          args.description ??
          `ECSD ${environment} application images and foundation artifacts.`,
        format: args.format ?? "DOCKER",
        mode: args.mode ?? "STANDARD_REPOSITORY",
        dockerConfig: {
          immutableTags: args.immutableTags ?? false,
        },
        cleanupPolicyDryRun: args.cleanupPolicyDryRun ?? true,
        cleanupPolicies: args.cleanupPolicies?.map((policy) => toCleanupPolicy(policy)),
        labels: args.labels,
      },
      { parent: this },
    );

    this.readerBindings = createRepositoryMembers(
      this,
      `${name}-readers`,
      "roles/artifactregistry.reader",
      args.readerMembers,
      this.repository,
      project,
      location,
    );

    this.writerBindings = createRepositoryMembers(
      this,
      `${name}-writers`,
      "roles/artifactregistry.writer",
      args.writerMembers,
      this.repository,
      project,
      location,
    );

    this.repositoryId = this.repository.repositoryId;
    this.repositoryName = this.repository.name;
    this.repositoryUrl = pulumi.interpolate`${location}-docker.pkg.dev/${project}/${this.repository.repositoryId}`;

    this.registerOutputs({
      repository: this.repository,
      repositoryId: this.repositoryId,
      repositoryName: this.repositoryName,
      repositoryUrl: this.repositoryUrl,
      readerBindings: this.readerBindings,
      writerBindings: this.writerBindings,
    });
  }
}
