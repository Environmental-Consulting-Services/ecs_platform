import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { infraConfig } from "./config";
import {
  CloudRunEnvVar,
  CloudRunManagedServiceKey,
  CloudRunSecretEnvVar,
  CloudRunServiceOverride,
  CloudRunServiceRuntimeConfig,
  CloudRunVolumeConfig,
  CloudRunVolumeMountConfig,
  CloudRunVpcAccessConfig,
  InfrastructureConfig,
  InputMap,
  NormalizedServiceConfig,
} from "./types";

type ServiceMap<T> = Partial<Record<CloudRunManagedServiceKey, T>>;

const MANAGED_SERVICE_KEYS: CloudRunManagedServiceKey[] = [
  "console",
  "api",
  "expert",
  "mail",
  "scheduler",
];

const DEFAULT_TRAFFIC: gcp.types.input.cloudrunv2.ServiceTraffic[] = [
  {
    percent: 100,
    type: "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST",
  },
];

const DEFAULT_RUNTIME_BY_SERVICE: Record<
  CloudRunManagedServiceKey,
  Required<CloudRunServiceRuntimeConfig>
> = {
  console: {
    port: 80,
    cpu: "1",
    memory: "512Mi",
    cpuIdle: true,
    startupCpuBoost: false,
    minInstances: 0,
    maxInstances: 3,
    concurrency: 80,
    timeout: "60s",
    ingress: "INGRESS_TRAFFIC_ALL",
    executionEnvironment: "EXECUTION_ENVIRONMENT_GEN2",
  },
  api: {
    port: 8080,
    cpu: "1",
    memory: "512Mi",
    cpuIdle: true,
    startupCpuBoost: false,
    minInstances: 1,
    maxInstances: 10,
    concurrency: 80,
    timeout: "300s",
    ingress: "INGRESS_TRAFFIC_ALL",
    executionEnvironment: "EXECUTION_ENVIRONMENT_GEN2",
  },
  expert: {
    port: 8081,
    cpu: "1",
    memory: "512Mi",
    cpuIdle: true,
    startupCpuBoost: false,
    minInstances: 0,
    maxInstances: 5,
    concurrency: 80,
    timeout: "300s",
    ingress: "INGRESS_TRAFFIC_ALL",
    executionEnvironment: "EXECUTION_ENVIRONMENT_GEN2",
  },
  mail: {
    port: 8080,
    cpu: "1",
    memory: "512Mi",
    cpuIdle: true,
    startupCpuBoost: false,
    minInstances: 0,
    maxInstances: 3,
    concurrency: 80,
    timeout: "120s",
    ingress: "INGRESS_TRAFFIC_INTERNAL_ONLY",
    executionEnvironment: "EXECUTION_ENVIRONMENT_GEN2",
  },
  scheduler: {
    port: 8080,
    cpu: "1",
    memory: "512Mi",
    cpuIdle: true,
    startupCpuBoost: false,
    minInstances: 1,
    maxInstances: 2,
    concurrency: 20,
    timeout: "300s",
    ingress: "INGRESS_TRAFFIC_INTERNAL_ONLY",
    executionEnvironment: "EXECUTION_ENVIRONMENT_GEN2",
  },
};

const DEFAULT_VPC_CONNECTOR_MACHINE_TYPE = "e2-micro";
const DEFAULT_VPC_CONNECTOR_MIN_INSTANCES = 2;
const DEFAULT_VPC_CONNECTOR_MAX_INSTANCES = 3;

type ResolvedVpcAccess = {
  connector?: pulumi.Input<string>;
  egress?: pulumi.Input<string>;
  networkInterfaces?: pulumi.Input<
    pulumi.Input<gcp.types.input.cloudrunv2.ServiceTemplateVpcAccessNetworkInterface>[]
  >;
};

export interface CloudRunServicesArgs {
  config?: InfrastructureConfig;
  serviceKeys?: CloudRunManagedServiceKey[];
  project?: pulumi.Input<string>;
  location?: pulumi.Input<string>;
  labels?: InputMap;
  annotations?: InputMap;
  deletionProtection?: pulumi.Input<boolean>;
  traffics?: pulumi.Input<pulumi.Input<gcp.types.input.cloudrunv2.ServiceTraffic>[]>;
  serviceAccounts?: ServiceMap<pulumi.Input<string>>;
  env?: CloudRunEnvVar[];
  envByService?: ServiceMap<CloudRunEnvVar[]>;
  secretEnv?: CloudRunSecretEnvVar[];
  secretEnvByService?: ServiceMap<CloudRunSecretEnvVar[]>;
  volumes?: CloudRunVolumeConfig[];
  volumesByService?: ServiceMap<CloudRunVolumeConfig[]>;
  volumeMounts?: CloudRunVolumeMountConfig[];
  volumeMountsByService?: ServiceMap<CloudRunVolumeMountConfig[]>;
  overrides?: ServiceMap<CloudRunServiceOverride>;
}

export interface CloudRunServicesOutputs {
  services: Partial<Record<CloudRunManagedServiceKey, gcp.cloudrunv2.Service>>;
  serviceUris: pulumi.Output<Partial<Record<CloudRunManagedServiceKey, string>>>;
  serviceNames: pulumi.Output<Partial<Record<CloudRunManagedServiceKey, string>>>;
}

export type CloudRunResolvedServiceSpec = {
  service: NormalizedServiceConfig;
  image: pulumi.Input<string>;
  runtime: Required<CloudRunServiceRuntimeConfig>;
  serviceAccount?: pulumi.Input<string>;
  env: gcp.types.input.cloudrunv2.ServiceTemplateContainerEnv[];
  volumes: gcp.types.input.cloudrunv2.ServiceTemplateVolume[];
  volumeMounts: gcp.types.input.cloudrunv2.ServiceTemplateContainerVolumeMount[];
  labels?: InputMap;
  annotations?: InputMap;
  vpcAccess?: CloudRunVpcAccessConfig;
};

function mergeMaps(
  left?: InputMap,
  right?: InputMap,
): pulumi.Output<Record<string, pulumi.Input<string>>> | undefined {
  if (!left && !right) {
    return undefined;
  }

  return pulumi
    .all([left ?? {}, right ?? {}])
    .apply(([leftResolved, rightResolved]) => ({
      ...leftResolved,
      ...rightResolved,
    }));
}

function mergeRuntime(
  defaults: Required<CloudRunServiceRuntimeConfig>,
  override?: CloudRunServiceRuntimeConfig,
): Required<CloudRunServiceRuntimeConfig> {
  return {
    ...defaults,
    ...override,
  };
}

function toEnvVars(
  env: CloudRunEnvVar[] = [],
  secretEnv: CloudRunSecretEnvVar[] = [],
): gcp.types.input.cloudrunv2.ServiceTemplateContainerEnv[] {
  return [
    ...env.map((item) => ({
      name: item.name,
      value: item.value,
    })),
    ...secretEnv.map((item) => ({
      name: item.name,
      valueSource: {
        secretKeyRef: {
          secret: item.secret,
          version: item.version ?? "latest",
        },
      },
    })),
  ];
}

function toVolumes(
  volumes: CloudRunVolumeConfig[] = [],
): gcp.types.input.cloudrunv2.ServiceTemplateVolume[] {
  return volumes.map((volume) => ({
    name: volume.name,
    cloudSqlInstance: volume.cloudSqlInstances
      ? {
          instances: volume.cloudSqlInstances,
        }
      : undefined,
    emptyDir: volume.emptyDir,
    gcs: volume.gcs,
    nfs: volume.nfs,
    secret: volume.secret,
  }));
}

function toVolumeMounts(
  mounts: CloudRunVolumeMountConfig[] = [],
): gcp.types.input.cloudrunv2.ServiceTemplateContainerVolumeMount[] {
  return mounts.map((mount) => ({
    name: mount.name,
    mountPath: mount.mountPath,
  }));
}

function toVpcAccess(
  vpcAccess?: ResolvedVpcAccess,
): gcp.types.input.cloudrunv2.ServiceTemplateVpcAccess | undefined {
  if (!vpcAccess) {
    return undefined;
  }

  return {
    connector: vpcAccess.connector,
    egress: vpcAccess.egress,
    networkInterfaces: vpcAccess.networkInterfaces,
  };
}

function normalizeVpcAccessMode(
  vpcAccess?: CloudRunVpcAccessConfig,
): "auto" | "direct-vpc-egress" | "serverless-vpc-access" {
  return vpcAccess?.mode ?? "auto";
}

function hasDirectVpcConfig(vpcAccess?: CloudRunVpcAccessConfig): boolean {
  return !!vpcAccess?.networkInterfaces;
}

function hasConnectorConfig(vpcAccess?: CloudRunVpcAccessConfig): boolean {
  return !!vpcAccess?.connector;
}

function getManagedServices(config: InfrastructureConfig): Record<
  CloudRunManagedServiceKey,
  NormalizedServiceConfig
> {
  const servicesByKey = Object.fromEntries(
    config.services.map((service) => [service.key, service]),
  );

  const missing = MANAGED_SERVICE_KEYS.filter((key) => !servicesByKey[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Cloud Run service definitions for: ${missing.join(", ")}`);
  }

  return Object.fromEntries(
    MANAGED_SERVICE_KEYS.map((key) => [key, servicesByKey[key]]),
  ) as Record<CloudRunManagedServiceKey, NormalizedServiceConfig>;
}

function getVpcConnectorName(name: string, key: CloudRunManagedServiceKey): string {
  return `${name}-${key}-vpc`;
}

function createVpcConnector(
  componentName: string,
  key: CloudRunManagedServiceKey,
  project: pulumi.Input<string>,
  location: pulumi.Input<string>,
  vpcAccess: CloudRunVpcAccessConfig,
  parent: pulumi.ComponentResource,
): gcp.vpcaccess.Connector {
  const directInterfaces = Array.isArray(vpcAccess.networkInterfaces)
    ? vpcAccess.networkInterfaces
    : undefined;
  const firstNetworkInterface = directInterfaces?.[0] as
    | {
        network?: pulumi.Input<string>;
        subnetwork?: pulumi.Input<string>;
        tags?: pulumi.Input<pulumi.Input<string>[]>;
      }
    | undefined;

  return new gcp.vpcaccess.Connector(
    `${componentName}-${key}-connector`,
    {
      project,
      region: location,
      name: getVpcConnectorName(componentName, key),
      machineType: vpcAccess.connectorMachineType ?? DEFAULT_VPC_CONNECTOR_MACHINE_TYPE,
      minInstances: vpcAccess.connectorMinInstances ?? DEFAULT_VPC_CONNECTOR_MIN_INSTANCES,
      maxInstances: vpcAccess.connectorMaxInstances ?? DEFAULT_VPC_CONNECTOR_MAX_INSTANCES,
      ipCidrRange: vpcAccess.connectorIpCidrRange,
      network: firstNetworkInterface?.network,
      subnet: vpcAccess.connectorSubnet
        ? {
            name: vpcAccess.connectorSubnet.name,
            projectId: vpcAccess.connectorSubnet.projectId,
          }
        : firstNetworkInterface?.subnetwork
          ? {
              name: firstNetworkInterface.subnetwork,
            }
          : undefined,
    },
    { parent },
  );
}

function resolveVpcAccess(
  componentName: string,
  key: CloudRunManagedServiceKey,
  project: pulumi.Input<string>,
  location: pulumi.Input<string>,
  vpcAccess: CloudRunVpcAccessConfig | undefined,
  parent: pulumi.ComponentResource,
): ResolvedVpcAccess | undefined {
  if (!vpcAccess) {
    return undefined;
  }

  const mode = normalizeVpcAccessMode(vpcAccess);
  const directConfigured = hasDirectVpcConfig(vpcAccess);
  const connectorConfigured = hasConnectorConfig(vpcAccess);

  if (mode === "direct-vpc-egress") {
    if (!directConfigured) {
      throw new Error(
        `Cloud Run service ${key} is pinned to direct-vpc-egress but no networkInterfaces were provided.`,
      );
    }

    return {
      egress: vpcAccess.egress ?? "PRIVATE_RANGES_ONLY",
      networkInterfaces: vpcAccess.networkInterfaces,
    };
  }

  if (mode === "serverless-vpc-access") {
    if (connectorConfigured) {
      return {
        connector: vpcAccess.connector,
        egress: vpcAccess.egress ?? "PRIVATE_RANGES_ONLY",
      };
    }

    if (
      !directConfigured &&
      !vpcAccess.connectorSubnet &&
      !vpcAccess.connectorIpCidrRange
    ) {
      throw new Error(
        `Cloud Run service ${key} needs either an existing connector or subnet/CIDR inputs to create one.`,
      );
    }

    const connector = createVpcConnector(componentName, key, project, location, vpcAccess, parent);
    return {
      connector: connector.id,
      egress: vpcAccess.egress ?? "PRIVATE_RANGES_ONLY",
    };
  }

  if (directConfigured) {
    return {
      egress: vpcAccess.egress ?? "PRIVATE_RANGES_ONLY",
      networkInterfaces: vpcAccess.networkInterfaces,
    };
  }

  if (connectorConfigured) {
    return {
      connector: vpcAccess.connector,
      egress: vpcAccess.egress ?? "PRIVATE_RANGES_ONLY",
    };
  }

  if (vpcAccess.connectorSubnet || vpcAccess.connectorIpCidrRange) {
    const connector = createVpcConnector(componentName, key, project, location, vpcAccess, parent);
    return {
      connector: connector.id,
      egress: vpcAccess.egress ?? "PRIVATE_RANGES_ONLY",
    };
  }

  return undefined;
}

export function resolveCloudRunServiceSpecs(
  args: CloudRunServicesArgs = {},
): Record<CloudRunManagedServiceKey, CloudRunResolvedServiceSpec> {
  const config = args.config ?? infraConfig;
  const services = getManagedServices(config);

  return Object.fromEntries(
    MANAGED_SERVICE_KEYS.map((key) => {
      const service = services[key];
      const override = args.overrides?.[key];
      const runtime = mergeRuntime(DEFAULT_RUNTIME_BY_SERVICE[key], override?.runtime);

      const env = toEnvVars(
        [...(args.env ?? []), ...(args.envByService?.[key] ?? []), ...(override?.env ?? [])],
        [
          ...(args.secretEnv ?? []),
          ...(args.secretEnvByService?.[key] ?? []),
          ...(override?.secretEnv ?? []),
        ],
      );

      const volumes = toVolumes([
        ...(args.volumes ?? []),
        ...(args.volumesByService?.[key] ?? []),
        ...(override?.volumes ?? []),
      ]);

      const volumeMounts = toVolumeMounts([
        ...(args.volumeMounts ?? []),
        ...(args.volumeMountsByService?.[key] ?? []),
        ...(override?.volumeMounts ?? []),
      ]);

      return [
        key,
        {
          service,
          image: override?.image ?? service.image,
          runtime,
          serviceAccount: override?.serviceAccount ?? args.serviceAccounts?.[key],
          env,
          volumes,
          volumeMounts,
          labels: mergeMaps(args.labels, override?.labels),
          annotations: mergeMaps(args.annotations, override?.annotations),
          vpcAccess: override?.vpcAccess,
        },
      ] as const;
    }),
  ) as Record<CloudRunManagedServiceKey, CloudRunResolvedServiceSpec>;
}

export class CloudRunServices
  extends pulumi.ComponentResource
  implements CloudRunServicesOutputs
{
  readonly services: Partial<Record<CloudRunManagedServiceKey, gcp.cloudrunv2.Service>>;
  readonly serviceUris: pulumi.Output<Partial<Record<CloudRunManagedServiceKey, string>>>;
  readonly serviceNames: pulumi.Output<Partial<Record<CloudRunManagedServiceKey, string>>>;

  constructor(
    name: string,
    args: CloudRunServicesArgs = {},
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:cloudrun:Services", name, {}, opts);

    const config = args.config ?? infraConfig;
    const project = args.project ?? config.gcp.project;
    const location = args.location ?? config.gcp.region;
    const services = resolveCloudRunServiceSpecs(args);
    const traffics = args.traffics ?? DEFAULT_TRAFFIC;
    const serviceKeys = args.serviceKeys ?? MANAGED_SERVICE_KEYS;

    this.services = {};

    for (const key of serviceKeys) {
      const spec = services[key];
      const resolvedVpcAccess = resolveVpcAccess(
        name,
        key,
        project,
        location,
        spec.vpcAccess,
        this,
      );

      this.services[key] = new gcp.cloudrunv2.Service(
        `${name}-${key}`,
        {
          project,
          location,
          name: spec.service.name,
          description: `ECSD ${config.environment} ${key} service.`,
          deletionProtection: args.deletionProtection ?? false,
          ingress: spec.runtime.ingress,
          invokerIamDisabled: key !== "scheduler",
          labels: spec.labels,
          annotations: spec.annotations,
          scaling: {
            minInstanceCount: spec.runtime.minInstances,
          },
          template: {
            executionEnvironment: spec.runtime.executionEnvironment,
            labels: {
              "ecsd-network-generation": "direct-vpc-24-esm-deps2",
            },
            serviceAccount: spec.serviceAccount,
            timeout: spec.runtime.timeout,
            maxInstanceRequestConcurrency: spec.runtime.concurrency,
            scaling: {
              minInstanceCount: spec.runtime.minInstances,
              maxInstanceCount: spec.runtime.maxInstances,
            },
            containers: [
              {
                name: key,
                image: spec.image,
                envs: spec.env,
                ports: {
                  containerPort: spec.runtime.port,
                },
                resources: {
                  cpuIdle: spec.runtime.cpuIdle,
                  startupCpuBoost: spec.runtime.startupCpuBoost,
                  limits: {
                    cpu: spec.runtime.cpu,
                    memory: spec.runtime.memory,
                  },
                },
                volumeMounts: spec.volumeMounts.length > 0 ? spec.volumeMounts : undefined,
              },
            ],
            volumes: spec.volumes.length > 0 ? spec.volumes : undefined,
            vpcAccess: toVpcAccess(resolvedVpcAccess),
          },
          traffics,
        },
        { parent: this },
      );
    }

    this.serviceUris = pulumi
      .all(
        serviceKeys.map((key) =>
          this.services[key]!.uri.apply((uri) => [key, uri] as const),
        ),
      )
      .apply((entries) => Object.fromEntries(entries) as Partial<Record<CloudRunManagedServiceKey, string>>);

    this.serviceNames = pulumi
      .all(
        serviceKeys.map((key) =>
          this.services[key]!.name.apply((serviceName) => [key, serviceName] as const),
        ),
      )
      .apply((entries) => Object.fromEntries(entries) as Partial<Record<CloudRunManagedServiceKey, string>>);

    this.registerOutputs({
      services: this.services,
      serviceUris: this.serviceUris,
      serviceNames: this.serviceNames,
    });
  }
}
