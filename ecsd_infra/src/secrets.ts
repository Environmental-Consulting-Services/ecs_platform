import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { infraConfig } from "./config";
import { InfrastructureConfig } from "./types";

type LabelMap = pulumi.Input<Record<string, pulumi.Input<string>>>;
type SecretAccessorRole = "roles/secretmanager.secretAccessor" | "roles/secretmanager.viewer";

export interface SecretPlaceholderSpec {
  name: string;
  secretId?: pulumi.Input<string>;
  labels?: LabelMap;
  annotations?: LabelMap;
  accessorMembers?: pulumi.Input<string>[];
  accessorRole?: pulumi.Input<SecretAccessorRole>;
  createPlaceholderVersion?: boolean;
  placeholderValue?: pulumi.Input<string>;
  deletionProtection?: pulumi.Input<boolean>;
  versionDestroyTtl?: pulumi.Input<string>;
  locations?: pulumi.Input<pulumi.Input<string>[]>;
}

export interface SecretPlaceholdersArgs {
  config?: InfrastructureConfig;
  project?: pulumi.Input<string>;
  secrets: SecretPlaceholderSpec[];
}

export interface SecretPlaceholdersOutputs {
  secrets: Record<string, gcp.secretmanager.Secret>;
  placeholderVersions: Record<string, gcp.secretmanager.SecretVersion>;
  accessorBindings: gcp.secretmanager.SecretIamMember[];
  secretNames: pulumi.Output<Record<string, string>>;
}

function buildReplication(
  locations: pulumi.Input<pulumi.Input<string>[]> | undefined,
): gcp.types.input.secretmanager.SecretReplication {
  if (!locations) {
    return { auto: {} };
  }

  return {
    userManaged: {
      replicas: pulumi.output(locations).apply((resolvedLocations) =>
        resolvedLocations.map((location) => ({ location })),
      ),
    },
  };
}

export class SecretPlaceholders
  extends pulumi.ComponentResource
  implements SecretPlaceholdersOutputs
{
  readonly secrets: Record<string, gcp.secretmanager.Secret>;
  readonly placeholderVersions: Record<string, gcp.secretmanager.SecretVersion>;
  readonly accessorBindings: gcp.secretmanager.SecretIamMember[];
  readonly secretNames: pulumi.Output<Record<string, string>>;

  constructor(
    name: string,
    args: SecretPlaceholdersArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:secrets:SecretPlaceholders", name, {}, opts);

    const config = args.config ?? infraConfig;
    const project = args.project ?? config.gcp.project;

    this.secrets = {};
    this.placeholderVersions = {};
    this.accessorBindings = [];

    for (const spec of args.secrets) {
      const secret = new gcp.secretmanager.Secret(
        `${name}-${spec.name}`,
        {
          project,
          secretId: spec.secretId ?? `${config.environment}-${spec.name}`,
          annotations: spec.annotations,
          labels: spec.labels,
          versionDestroyTtl: spec.versionDestroyTtl,
          deletionProtection: spec.deletionProtection ?? false,
          replication: buildReplication(spec.locations),
        },
        { parent: this },
      );

      this.secrets[spec.name] = secret;

      if (spec.createPlaceholderVersion ?? true) {
        this.placeholderVersions[spec.name] = new gcp.secretmanager.SecretVersion(
          `${name}-${spec.name}-placeholder`,
          {
            secret: secret.id,
            deletionPolicy: "DISABLE",
            secretData:
              spec.placeholderValue ??
              pulumi.secret(`placeholder-${config.environment}-${spec.name}`),
          },
          { parent: this, dependsOn: [secret] },
        );
      }

      const accessorBindings = (spec.accessorMembers ?? []).map(
          (member, index) =>
            new gcp.secretmanager.SecretIamMember(
              `${name}-${spec.name}-accessor-${index}`,
              {
                project,
                secretId: secret.secretId,
                role: spec.accessorRole ?? "roles/secretmanager.secretAccessor",
                member,
              },
              { parent: this, dependsOn: [secret] },
            ),
        );

      this.accessorBindings.push(...accessorBindings);
    }

    this.secretNames = pulumi
      .all(
        Object.entries(this.secrets).map(([key, secret]) =>
          secret.name.apply((secretName) => [key, secretName] as const),
        ),
      )
      .apply((entries) => Object.fromEntries(entries));

    this.registerOutputs({
      secrets: this.secrets,
      placeholderVersions: this.placeholderVersions,
      accessorBindings: this.accessorBindings,
      secretNames: this.secretNames,
    });
  }
}
