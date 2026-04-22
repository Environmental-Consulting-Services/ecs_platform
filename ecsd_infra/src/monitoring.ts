import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { infraConfig } from "./config";
import { InfrastructureConfig } from "./types";

type LabelMap = pulumi.Input<Record<string, pulumi.Input<string>>>;

export interface NotificationChannelSpec {
  name: string;
  type: pulumi.Input<string>;
  displayName?: pulumi.Input<string>;
  description?: pulumi.Input<string>;
  enabled?: pulumi.Input<boolean>;
  forceDelete?: pulumi.Input<boolean>;
  labels?: LabelMap;
  userLabels?: LabelMap;
  sensitiveLabels?: pulumi.Input<gcp.types.input.monitoring.NotificationChannelSensitiveLabels>;
}

export interface UptimeCheckSpec {
  name: string;
  displayName?: pulumi.Input<string>;
  host?: pulumi.Input<string>;
  path?: pulumi.Input<string>;
  port?: pulumi.Input<number>;
  useSsl?: pulumi.Input<boolean>;
  validateSsl?: pulumi.Input<boolean>;
  period?: pulumi.Input<"60s" | "300s" | "600s" | "900s">;
  timeout?: pulumi.Input<string>;
  selectedRegions?: pulumi.Input<pulumi.Input<string>[]>;
  expectedContent?: pulumi.Input<string>;
  labels?: LabelMap;
}

export interface AlertPolicySpec {
  name: string;
  displayName?: pulumi.Input<string>;
  documentationContent?: pulumi.Input<string>;
  documentationMimeType?: pulumi.Input<string>;
  enabled?: pulumi.Input<boolean>;
  severity?: pulumi.Input<"CRITICAL" | "ERROR" | "WARNING">;
  userLabels?: LabelMap;
  notificationChannelNames?: pulumi.Input<string>[];
  channelKeys?: string[];
  filter: pulumi.Input<string>;
  comparison?: pulumi.Input<string>;
  duration?: pulumi.Input<string>;
  thresholdValue?: pulumi.Input<number>;
  alignmentPeriod?: pulumi.Input<string>;
  perSeriesAligner?: pulumi.Input<string>;
  crossSeriesReducer?: pulumi.Input<string>;
}

export interface MonitoringPlaceholdersArgs {
  config?: InfrastructureConfig;
  project?: pulumi.Input<string>;
  notificationChannels?: NotificationChannelSpec[];
  uptimeChecks?: UptimeCheckSpec[];
  alertPolicies?: AlertPolicySpec[];
}

export interface MonitoringPlaceholdersOutputs {
  notificationChannels: Record<string, gcp.monitoring.NotificationChannel>;
  uptimeChecks: Record<string, gcp.monitoring.UptimeCheckConfig>;
  alertPolicies: Record<string, gcp.monitoring.AlertPolicy>;
}

export class MonitoringPlaceholders
  extends pulumi.ComponentResource
  implements MonitoringPlaceholdersOutputs
{
  readonly notificationChannels: Record<string, gcp.monitoring.NotificationChannel>;
  readonly uptimeChecks: Record<string, gcp.monitoring.UptimeCheckConfig>;
  readonly alertPolicies: Record<string, gcp.monitoring.AlertPolicy>;

  constructor(
    name: string,
    args: MonitoringPlaceholdersArgs = {},
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:monitoring:MonitoringPlaceholders", name, {}, opts);

    const config = args.config ?? infraConfig;
    const project = args.project ?? config.gcp.project;

    this.notificationChannels = {};
    this.uptimeChecks = {};
    this.alertPolicies = {};

    for (const spec of args.notificationChannels ?? []) {
      this.notificationChannels[spec.name] = new gcp.monitoring.NotificationChannel(
        `${name}-${spec.name}`,
        {
          project,
          type: spec.type,
          displayName: spec.displayName ?? `${config.environment}-${spec.name}`,
          description: spec.description,
          enabled: spec.enabled ?? true,
          forceDelete: spec.forceDelete ?? false,
          labels: spec.labels,
          userLabels: spec.userLabels,
          sensitiveLabels: spec.sensitiveLabels,
        },
        { parent: this },
      );
    }

    for (const spec of args.uptimeChecks ?? []) {
      this.uptimeChecks[spec.name] = new gcp.monitoring.UptimeCheckConfig(
        `${name}-${spec.name}`,
        {
          project,
          displayName: spec.displayName ?? `${config.environment}-${spec.name}`,
          timeout: spec.timeout ?? "10s",
          period: spec.period ?? "300s",
          selectedRegions: spec.selectedRegions,
          userLabels: spec.labels,
          contentMatchers: spec.expectedContent
            ? [
                {
                  content: spec.expectedContent,
                  matcher: "CONTAINS_STRING",
                },
              ]
            : undefined,
          monitoredResource: {
            type: "uptime_url",
            labels: {
              host: spec.host ?? config.baseDomain,
              project_id: project,
            },
          },
          httpCheck: {
            path: spec.path ?? "/",
            port: spec.port ?? ((spec.useSsl ?? true) ? 443 : 80),
            useSsl: spec.useSsl ?? true,
            validateSsl: spec.validateSsl ?? true,
          },
        },
        { parent: this },
      );
    }

    for (const spec of args.alertPolicies ?? []) {
      const resolvedChannels = [
        ...((spec.channelKeys ?? [])
          .map((channelKey) => this.notificationChannels[channelKey]?.name)
          .filter((channelName): channelName is pulumi.Output<string> => channelName !== undefined)),
        ...((spec.notificationChannelNames ?? []) as pulumi.Input<string>[]),
      ];

      this.alertPolicies[spec.name] = new gcp.monitoring.AlertPolicy(
        `${name}-${spec.name}`,
        {
          project,
          displayName: spec.displayName ?? `${config.environment}-${spec.name}`,
          combiner: "OR",
          enabled: spec.enabled ?? true,
          severity: spec.severity ?? "ERROR",
          notificationChannels: resolvedChannels,
          userLabels: spec.userLabels,
          documentation: spec.documentationContent
            ? {
                content: spec.documentationContent,
                mimeType: spec.documentationMimeType ?? "text/markdown",
              }
            : undefined,
          conditions: [
            {
              displayName: `${spec.name}-threshold`,
              conditionThreshold: {
                filter: spec.filter,
                duration: spec.duration ?? "300s",
                comparison: spec.comparison ?? "COMPARISON_GT",
                thresholdValue: spec.thresholdValue ?? 0,
                aggregations: [
                  {
                    alignmentPeriod: spec.alignmentPeriod ?? "300s",
                    perSeriesAligner: spec.perSeriesAligner ?? "ALIGN_MEAN",
                    crossSeriesReducer: spec.crossSeriesReducer,
                  },
                ],
              },
            },
          ],
        },
        { parent: this },
      );
    }

    this.registerOutputs({
      notificationChannels: this.notificationChannels,
      uptimeChecks: this.uptimeChecks,
      alertPolicies: this.alertPolicies,
    });
  }
}
