import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { infraConfig } from "./config";
import { createServiceName } from "./naming";
import { InfrastructureConfig } from "./types";

type LabelMap = pulumi.Input<Record<string, pulumi.Input<string>>>;

const DEFAULT_RUNTIME_ROLES = [
  "roles/logging.logWriter",
  "roles/monitoring.metricWriter",
  "roles/cloudtrace.agent",
] as const;

export interface ServiceAccountSpec {
  name: string;
  accountId?: pulumi.Input<string>;
  displayName?: pulumi.Input<string>;
  description?: pulumi.Input<string>;
  disabled?: pulumi.Input<boolean>;
  createIgnoreAlreadyExists?: pulumi.Input<boolean>;
  projectRoles?: pulumi.Input<string>[];
}

export interface ServiceIdentityModuleArgs {
  config?: InfrastructureConfig;
  project?: pulumi.Input<string>;
  environment?: pulumi.Input<string>;
  labels?: LabelMap;
  includeDefaultServiceAccounts?: boolean;
  defaultRuntimeRoles?: pulumi.Input<string>[];
  serviceAccounts?: ServiceAccountSpec[];
}

export interface ServiceIdentityOutputs {
  serviceAccounts: Record<string, gcp.serviceaccount.Account>;
  projectRoleBindings: gcp.projects.IAMMember[];
  serviceAccountEmails: pulumi.Output<Record<string, string>>;
  serviceAccountMembers: pulumi.Output<Record<string, string>>;
}

function sanitizeAccountId(raw: string): string {
  const normalized = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/-{2,}/g, "-");

  const seeded = normalized.length === 0 ? "ecsd" : normalized;
  const withPrefix = /^[a-z]/.test(seeded) ? seeded : `a${seeded}`;
  const trimmed = withPrefix.slice(0, 30).replace(/-+$/, "");

  if (trimmed.length < 6) {
    return `${trimmed}${"0".repeat(6 - trimmed.length)}`;
  }

  return trimmed;
}

function toDefaultSpecs(
  config: InfrastructureConfig,
  runtimeRoles: pulumi.Input<string>[],
): ServiceAccountSpec[] {
  return config.services.map((service) => ({
    name: service.key,
    accountId: sanitizeAccountId(createServiceName(config.environment, service.key)),
    displayName: service.name,
    description: `Runtime identity for the ${service.key} service in ${config.environment}.`,
    projectRoles: runtimeRoles,
  }));
}

export class ServiceIdentities
  extends pulumi.ComponentResource
  implements ServiceIdentityOutputs
{
  readonly serviceAccounts: Record<string, gcp.serviceaccount.Account>;
  readonly projectRoleBindings: gcp.projects.IAMMember[];
  readonly serviceAccountEmails: pulumi.Output<Record<string, string>>;
  readonly serviceAccountMembers: pulumi.Output<Record<string, string>>;

  constructor(
    name: string,
    args: ServiceIdentityModuleArgs = {},
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:iam:ServiceIdentities", name, {}, opts);

    const config = args.config ?? infraConfig;
    const project = args.project ?? config.gcp.project;
    const defaultRuntimeRoles = args.defaultRuntimeRoles ?? [...DEFAULT_RUNTIME_ROLES];
    const specs = [
      ...(args.includeDefaultServiceAccounts === false
        ? []
        : toDefaultSpecs(config, defaultRuntimeRoles)),
      ...(args.serviceAccounts ?? []),
    ];

    this.serviceAccounts = {};
    this.projectRoleBindings = [];

    for (const spec of specs) {
      const account = new gcp.serviceaccount.Account(
        `${name}-${spec.name}`,
        {
          project,
          accountId:
            spec.accountId ?? sanitizeAccountId(createServiceName(config.environment, spec.name)),
          displayName:
            spec.displayName ??
            createServiceName(config.environment, spec.name),
          description:
            spec.description ??
            `Service account for ${spec.name} in ${config.environment}.`,
          disabled: spec.disabled,
          createIgnoreAlreadyExists: spec.createIgnoreAlreadyExists ?? true,
        },
        { parent: this },
      );

      this.serviceAccounts[spec.name] = account;

      const roleBindings = (spec.projectRoles ?? []).map(
          (role, index) =>
            new gcp.projects.IAMMember(
              `${name}-${spec.name}-role-${index}`,
              {
                project,
                role,
                member: account.member,
              },
              { parent: this, dependsOn: [account] },
            ),
        );

      this.projectRoleBindings.push(...roleBindings);
    }

    this.serviceAccountEmails = pulumi
      .all(
        Object.entries(this.serviceAccounts).map(([key, account]) =>
          account.email.apply((email) => [key, email] as const),
        ),
      )
      .apply((entries) => Object.fromEntries(entries));

    this.serviceAccountMembers = pulumi
      .all(
        Object.entries(this.serviceAccounts).map(([key, account]) =>
          account.member.apply((member) => [key, member] as const),
        ),
      )
      .apply((entries) => Object.fromEntries(entries));

    this.registerOutputs({
      serviceAccounts: this.serviceAccounts,
      projectRoleBindings: this.projectRoleBindings,
      serviceAccountEmails: this.serviceAccountEmails,
      serviceAccountMembers: this.serviceAccountMembers,
    });
  }
}
