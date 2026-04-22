import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

import { ArtifactRegistry } from "./src/artifact-registry";
import { CloudRunServices } from "./src/cloud-run";
import { infraConfig } from "./src/config";
import { CloudRunDomainMapping } from "./src/domain-mapping";
import { ServiceIdentities } from "./src/iam";
import { SelfManagedMongoReplicaSet } from "./src/mongo";
import { MonitoringPlaceholders } from "./src/monitoring";
import { ApplicationNetworking } from "./src/networking";
import { ProjectServices } from "./src/project-services";
import { SecretPlaceholders } from "./src/secrets";
import { PulumiStateBootstrapBucket } from "./src/state-backend";
import { createServiceName } from "./src/naming";

const stackConfig = new pulumi.Config();
const mongoEnablePublicIpForBootstrap =
  stackConfig.getBoolean("mongoEnablePublicIpForBootstrap") ?? false;

const projectServices = new ProjectServices("project-services", {
  config: infraConfig,
});

const stateBackend = new PulumiStateBootstrapBucket("state-backend", {
  config: infraConfig,
  bucketName: infraConfig.stateBackend.bucketName,
  location: infraConfig.stateBackend.location,
}, { dependsOn: projectServices.services });

const artifactRegistry = new ArtifactRegistry("artifact-registry", {
  config: infraConfig,
}, { dependsOn: projectServices.services });

const serviceIdentities = new ServiceIdentities("service-identities", {
  config: infraConfig,
}, { dependsOn: projectServices.services });

const networking = new ApplicationNetworking("app-networking", {
  config: infraConfig,
}, { dependsOn: projectServices.services });

const mongoUsername = "ecsd_app";
const mongoPassword = new random.RandomPassword("mongo-app-password", {
  length: 32,
  special: false,
});
const mongoKeyFile = new random.RandomPassword("mongo-keyfile", {
  length: 756,
  special: false,
});

const mongo =
  infraConfig.mongo &&
  new SelfManagedMongoReplicaSet(
    "mongo",
    {
      environment: infraConfig.environment,
      networkSelfLink: networking.networkSelfLink,
      subnetworkSelfLink: networking.appSubnetSelfLink,
      members: infraConfig.mongo.members,
      project: infraConfig.gcp.project,
      region: infraConfig.gcp.region,
      replicaSetName: infraConfig.mongo.replicaSetName,
      port: infraConfig.mongo.port,
      databaseName: infraConfig.mongo.databaseName,
      appName: infraConfig.mongo.appName,
      createFirewall: true,
      enablePublicIp: mongoEnablePublicIpForBootstrap,
      authUsername: mongoUsername,
      authPassword: mongoPassword.result,
      keyFileContent: mongoKeyFile.result,
      usernameSecretName: infraConfig.mongo.usernameSecretName,
      passwordSecretName: infraConfig.mongo.passwordSecretName,
      connectionUriSecretName: infraConfig.mongo.connectionUriSecretName,
    },
    { dependsOn: projectServices.services },
  );

const mongoSecretIds = {
  databaseUrl: createServiceName(infraConfig.environment, "mongo-database-url"),
  filesDatabaseUrl: createServiceName(infraConfig.environment, "mongo-files-database-url"),
  chatDatabaseUrl: createServiceName(infraConfig.environment, "mongo-chat-database-url"),
  agendaDatabaseUrl: createServiceName(infraConfig.environment, "mongo-agenda-database-url"),
};

const secrets = new SecretPlaceholders(
  "secret-placeholders",
  {
    config: infraConfig,
    secrets: [
    {
      name: "jwt-secret",
      placeholderValue: "token",
      accessorMembers: [
        serviceIdentities.serviceAccounts.api.member,
        serviceIdentities.serviceAccounts.expert.member,
      ],
    },
    {
      name: "openai-api-key",
      placeholderValue: "placeholder",
      accessorMembers: [serviceIdentities.serviceAccounts.expert.member],
    },
    {
      name: "openai-assistant-id",
      placeholderValue: "placeholder",
      accessorMembers: [serviceIdentities.serviceAccounts.expert.member],
    },
    {
      name: "postmark-api-key",
      placeholderValue: "placeholder",
      accessorMembers: [serviceIdentities.serviceAccounts.mail.member],
    },
    {
      name: "mailtrap-user",
      placeholderValue: "placeholder",
      accessorMembers: [serviceIdentities.serviceAccounts.api.member],
    },
    {
      name: "mailtrap-password",
      placeholderValue: "placeholder",
      accessorMembers: [serviceIdentities.serviceAccounts.api.member],
    },
    {
      name: "baseline-bootstrap-password",
      placeholderValue: pulumi.secret("secret"),
      accessorMembers: [serviceIdentities.serviceAccounts.api.member],
    },
    {
      name: "mongo-uri",
      secretId: infraConfig.mongo?.connectionUriSecretName,
      createPlaceholderVersion: false,
      accessorMembers: [
        serviceIdentities.serviceAccounts.api.member,
        serviceIdentities.serviceAccounts.expert.member,
        serviceIdentities.serviceAccounts.scheduler.member,
      ],
    },
    {
      name: "mongo-username",
      secretId: infraConfig.mongo?.usernameSecretName,
      createPlaceholderVersion: false,
      accessorMembers: [
        serviceIdentities.serviceAccounts.api.member,
        serviceIdentities.serviceAccounts.expert.member,
        serviceIdentities.serviceAccounts.scheduler.member,
      ],
    },
    {
      name: "mongo-password",
      secretId: infraConfig.mongo?.passwordSecretName,
      createPlaceholderVersion: false,
      accessorMembers: [
        serviceIdentities.serviceAccounts.api.member,
        serviceIdentities.serviceAccounts.expert.member,
        serviceIdentities.serviceAccounts.scheduler.member,
      ],
    },
    {
      name: "mongo-database-url",
      secretId: mongoSecretIds.databaseUrl,
      createPlaceholderVersion: false,
      accessorMembers: [serviceIdentities.serviceAccounts.api.member],
    },
    {
      name: "mongo-files-database-url",
      secretId: mongoSecretIds.filesDatabaseUrl,
      createPlaceholderVersion: false,
      accessorMembers: [serviceIdentities.serviceAccounts.api.member],
    },
    {
      name: "mongo-chat-database-url",
      secretId: mongoSecretIds.chatDatabaseUrl,
      createPlaceholderVersion: false,
      accessorMembers: [serviceIdentities.serviceAccounts.expert.member],
    },
    {
      name: "mongo-agenda-database-url",
      secretId: mongoSecretIds.agendaDatabaseUrl,
      createPlaceholderVersion: false,
      accessorMembers: [serviceIdentities.serviceAccounts.scheduler.member],
    },
    ],
  },
  { dependsOn: projectServices.services },
);

function mongoUriFor(databaseName: string): pulumi.Output<string> {
  if (!mongo) {
    return pulumi.output("");
  }

  return pulumi
    .all([
      mongo.seedList,
      mongo.replicaSetName,
      mongo.appName,
      mongoPassword.result,
    ] as const)
    .apply(([seedList, replicaSetName, appName, password]) =>
      pulumi.secret(
        `mongodb://${mongoUsername}:${password}@${seedList}/${databaseName}?replicaSet=${encodeURIComponent(replicaSetName)}&authSource=admin&readPreference=primaryPreferred&appName=${encodeURIComponent(appName)}`,
      ),
    ) as pulumi.Output<string>;
}

const mongoSecretVersions =
  mongo &&
  {
    username: new gcp.secretmanager.SecretVersion(
      "mongo-username-generated",
      {
        secret: secrets.secrets["mongo-username"].id,
        deletionPolicy: "DISABLE",
        secretData: pulumi.secret(mongoUsername),
      },
      { dependsOn: [secrets.secrets["mongo-username"]] },
    ),
    password: new gcp.secretmanager.SecretVersion(
      "mongo-password-generated",
      {
        secret: secrets.secrets["mongo-password"].id,
        deletionPolicy: "DISABLE",
        secretData: mongoPassword.result,
      },
      { dependsOn: [secrets.secrets["mongo-password"]] },
    ),
    databaseUrl: new gcp.secretmanager.SecretVersion(
      "mongo-database-url-generated",
      {
        secret: secrets.secrets["mongo-database-url"].id,
        deletionPolicy: "DISABLE",
        secretData: mongoUriFor("ecsd"),
      },
      { dependsOn: [secrets.secrets["mongo-database-url"]] },
    ),
    filesDatabaseUrl: new gcp.secretmanager.SecretVersion(
      "mongo-files-database-url-generated",
      {
        secret: secrets.secrets["mongo-files-database-url"].id,
        deletionPolicy: "DISABLE",
        secretData: mongoUriFor("ecsd_files"),
      },
      { dependsOn: [secrets.secrets["mongo-files-database-url"]] },
    ),
    chatDatabaseUrl: new gcp.secretmanager.SecretVersion(
      "mongo-chat-database-url-generated",
      {
        secret: secrets.secrets["mongo-chat-database-url"].id,
        deletionPolicy: "DISABLE",
        secretData: mongoUriFor("ecsd_chat"),
      },
      { dependsOn: [secrets.secrets["mongo-chat-database-url"]] },
    ),
    agendaDatabaseUrl: new gcp.secretmanager.SecretVersion(
      "mongo-agenda-database-url-generated",
      {
        secret: secrets.secrets["mongo-agenda-database-url"].id,
        deletionPolicy: "DISABLE",
        secretData: mongoUriFor("agenda"),
      },
      { dependsOn: [secrets.secrets["mongo-agenda-database-url"]] },
    ),
  };

const cloudRunSecretDependencies = [
  ...Object.values(secrets.placeholderVersions),
  ...secrets.accessorBindings,
  ...(mongoSecretVersions ? Object.values(mongoSecretVersions) : []),
];

const monitoring = new MonitoringPlaceholders(
  "monitoring",
  {
    config: infraConfig,
    uptimeChecks: [
    {
      name: "console-root",
      host: infraConfig.baseDomain,
      path: "/",
      useSsl: true,
    },
    {
      name: "api-health",
      host: infraConfig.baseDomain,
      path: "/api",
      useSsl: true,
    },
    ],
  },
  { dependsOn: projectServices.services },
);

const publicIngressMode = "INGRESS_TRAFFIC_ALL";
const internalIngressMode = "INGRESS_TRAFFIC_INTERNAL_ONLY";
const apiServiceConfig = infraConfig.services.find((service) => service.key === "api");

if (!apiServiceConfig) {
  throw new Error("Missing api service config.");
}

const cloudRunBackends = new CloudRunServices(
  "cloud-run-backends",
  {
    config: infraConfig,
    serviceKeys: ["api", "expert", "mail", "scheduler"],
    serviceAccounts: {
      api: serviceIdentities.serviceAccounts.api.email,
      expert: serviceIdentities.serviceAccounts.expert.email,
      mail: serviceIdentities.serviceAccounts.mail.email,
      scheduler: serviceIdentities.serviceAccounts.scheduler.email,
    },
    env: [
      {
        name: "NODE_ENV",
        value: "production",
      },
    ],
    overrides: {
      api: {
        runtime: {
          ingress: internalIngressMode,
        },
        vpcAccess: {
          networkInterfaces: [
          {
            network: pulumi.interpolate`projects/${infraConfig.gcp.project}/global/networks/${networking.networkName}`,
            subnetwork: pulumi.interpolate`projects/${infraConfig.gcp.project}/regions/${infraConfig.gcp.region}/subnetworks/${networking.appSubnetName}`,
            tags: ["ecsd-api"],
          },
          ],
        },
        env: [
          {
            name: "ENV_NAME",
            value: "production",
          },
          {
            name: "APP_URL_CLIENT",
            value: "https://smartcomplai.ecscompliance.com",
          },
          {
            name: "APP_URL_API",
            value: "https://smartcomplai.ecscompliance.com/api",
          },
          {
            name: "MAIL_API_URL",
            value: "https://smartcomplai.ecscompliance.com/mail",
          },
          {
            name: "MAIL_API_HOST",
            value: "ecsd-prod-mail",
          },
          {
            name: "MAIL_API_PORT",
            value: "8080",
          },
          {
            name: "FILES_DB",
            value: "ecsd_files",
          },
          {
            name: "IMG_BUCKET",
            value: "images",
          },
        ],
        secretEnv: [
          {
            name: "DATABASE_URL",
            secret: secrets.secrets["mongo-database-url"].secretId,
          },
          {
            name: "FILES_DB_URL",
            secret: secrets.secrets["mongo-files-database-url"].secretId,
          },
          {
            name: "JWT_SECRET",
            secret: secrets.secrets["jwt-secret"].secretId,
          },
          {
            name: "MAILTRAP_USER",
            secret: secrets.secrets["mailtrap-user"].secretId,
          },
          {
            name: "MAILTRAP_PASSWORD",
            secret: secrets.secrets["mailtrap-password"].secretId,
          },
        ],
      },
      expert: {
        runtime: {
          ingress: internalIngressMode,
        },
        vpcAccess: {
          networkInterfaces: [
          {
            network: pulumi.interpolate`projects/${infraConfig.gcp.project}/global/networks/${networking.networkName}`,
            subnetwork: pulumi.interpolate`projects/${infraConfig.gcp.project}/regions/${infraConfig.gcp.region}/subnetworks/${networking.appSubnetName}`,
            tags: ["ecsd-expert"],
          },
          ],
        },
        env: [
          {
            name: "ENV_NAME",
            value: "production",
          },
          {
            name: "APP_URL_CLIENT",
            value: "https://smartcomplai.ecscompliance.com",
          },
          {
            name: "APP_URL_API",
            value: "https://smartcomplai.ecscompliance.com/expert",
          },
        ],
        secretEnv: [
          {
            name: "CHAT_DATABASE_URL",
            secret: secrets.secrets["mongo-chat-database-url"].secretId,
          },
          {
            name: "JWT_SECRET",
            secret: secrets.secrets["jwt-secret"].secretId,
          },
          {
            name: "OPENAI_API_KEY",
            secret: secrets.secrets["openai-api-key"].secretId,
          },
          {
            name: "OPEN_AI_API_KEY",
            secret: secrets.secrets["openai-api-key"].secretId,
          },
          {
            name: "OPEN_AI_ASSISTANT_ID",
            secret: secrets.secrets["openai-assistant-id"].secretId,
          },
        ],
      },
      mail: {
        runtime: {
          ingress: internalIngressMode,
        },
        secretEnv: [
          {
            name: "POSTMARK_APIKEY",
            secret: secrets.secrets["postmark-api-key"].secretId,
          },
        ],
        vpcAccess: {
          networkInterfaces: [
          {
              network: pulumi.interpolate`projects/${infraConfig.gcp.project}/global/networks/${networking.networkName}`,
              subnetwork: pulumi.interpolate`projects/${infraConfig.gcp.project}/regions/${infraConfig.gcp.region}/subnetworks/${networking.appSubnetName}`,
              tags: ["ecsd-mail"],
            },
          ],
        },
      },
      scheduler: {
        secretEnv: [
          {
            name: "AGENDA_DATABASE_URL",
            secret: secrets.secrets["mongo-agenda-database-url"].secretId,
          },
        ],
        vpcAccess: {
          networkInterfaces: [
            {
              network: pulumi.interpolate`projects/${infraConfig.gcp.project}/global/networks/${networking.networkName}`,
              subnetwork: pulumi.interpolate`projects/${infraConfig.gcp.project}/regions/${infraConfig.gcp.region}/subnetworks/${networking.appSubnetName}`,
              tags: ["ecsd-scheduler"],
            },
          ],
        },
      },
    },
  },
  { dependsOn: [...projectServices.services, ...cloudRunSecretDependencies] },
);

const baselineBootstrapJob = new gcp.cloudrunv2.Job(
  "baseline-bootstrap-job",
  {
    project: infraConfig.gcp.project,
    location: infraConfig.gcp.region,
    name: `${infraConfig.environment}-baseline-bootstrap`,
    deletionProtection: false,
    launchStage: "GA",
    template: {
      taskCount: 1,
      parallelism: 1,
      template: {
        executionEnvironment: "EXECUTION_ENVIRONMENT_GEN2",
        serviceAccount: serviceIdentities.serviceAccounts.api.email,
        timeout: "600s",
        maxRetries: 0,
        containers: [
          {
            name: "baseline-bootstrap",
            image: apiServiceConfig.image,
            commands: ["node"],
            args: [
              "--experimental-modules",
              "--experimental-specifier-resolution=node",
              "dist/mongoose/bootstrapBaseline.js",
            ],
            envs: [
              {
                name: "NODE_ENV",
                value: "production",
              },
              {
                name: "APP_URL_API",
                value: "https://smartcomplai.ecscompliance.com/api",
              },
              {
                name: "DATABASE_URL",
                valueSource: {
                  secretKeyRef: {
                    secret: secrets.secrets["mongo-database-url"].secretId,
                    version: "latest",
                  },
                },
              },
              {
                name: "BASELINE_BOOTSTRAP_PASSWORD",
                valueSource: {
                  secretKeyRef: {
                    secret: secrets.secrets["baseline-bootstrap-password"].secretId,
                    version: "latest",
                  },
                },
              },
            ],
            resources: {
              limits: {
                cpu: "1",
                memory: "512Mi",
              },
            },
          },
        ],
        vpcAccess: {
          networkInterfaces: [
            {
              network: pulumi.interpolate`projects/${infraConfig.gcp.project}/global/networks/${networking.networkName}`,
              subnetwork: pulumi.interpolate`projects/${infraConfig.gcp.project}/regions/${infraConfig.gcp.region}/subnetworks/${networking.appSubnetName}`,
              tags: ["ecsd-api-bootstrap"],
            },
          ],
        },
      },
    },
  },
  {
    dependsOn: [
      ...projectServices.services,
      ...cloudRunSecretDependencies,
      cloudRunBackends.services.api!,
    ],
  },
);

const consoleCloudRun = new CloudRunServices(
  "cloud-run-console",
  {
    config: infraConfig,
    serviceKeys: ["console"],
    serviceAccounts: {
      console: serviceIdentities.serviceAccounts.console.email,
    },
    env: [
      {
        name: "NODE_ENV",
        value: "production",
      },
    ],
    overrides: {
      console: {
        runtime: {
          ingress: publicIngressMode,
        },
        vpcAccess: {
          egress: "ALL_TRAFFIC",
          networkInterfaces: [
            {
              network: pulumi.interpolate`projects/${infraConfig.gcp.project}/global/networks/${networking.networkName}`,
              subnetwork: pulumi.interpolate`projects/${infraConfig.gcp.project}/regions/${infraConfig.gcp.region}/subnetworks/${networking.appSubnetName}`,
              tags: ["ecsd-console"],
            },
          ],
        },
        env: [
          {
            name: "ENV_FILE_IN",
            value: "/usr/share/nginx/html/runtime-env.env",
          },
          {
            name: "REACT_APP_API_URL",
            value: "/api",
          },
          {
            name: "REACT_APP_IMAGES",
            value: "",
          },
          {
            name: "REACT_APP_URL",
            value: "https://smartcomplai.ecscompliance.com",
          },
          {
            name: "REACT_APP_IS_DEMO",
            value: "false",
          },
          {
            name: "API_PROXY_URL",
            value: cloudRunBackends.services.api!.uri,
          },
          {
            name: "EXPERT_PROXY_URL",
            value: cloudRunBackends.services.expert!.uri,
          },
          {
            name: "MAIL_PROXY_URL",
            value: cloudRunBackends.services.mail!.uri,
          },
        ],
      },
    },
  },
  { dependsOn: [cloudRunBackends] },
);

const domainMappings = {
  console: new CloudRunDomainMapping(
    "console-domain",
    {
      domain: infraConfig.baseDomain,
      location: infraConfig.gcp.region,
      project: infraConfig.gcp.project,
      serviceName: consoleCloudRun.services.console!.name,
    },
    { dependsOn: [consoleCloudRun.services.console!] },
  ),
};

export const stackEnvironment = infraConfig.environment;
export const gcpProject = infraConfig.gcp.project;
export const gcpRegion = infraConfig.gcp.region;
export const publicDomain = infraConfig.baseDomain;
export const cloudDnsZone = infraConfig.dnsZoneName;
export const artifactRepository = artifactRegistry.repositoryUrl;
export const configuredLoadBalancerType = infraConfig.loadBalancer.type;
export const configuredLoadBalancerRegion = infraConfig.loadBalancer.region;
export const configuredLoadBalancerIpMode = infraConfig.loadBalancer.ipMode;
export const configuredLoadBalancerIpName = infraConfig.loadBalancer.ipName;
export const networkSelfLink = networking.networkSelfLink;
export const appSubnetSelfLink = networking.appSubnetSelfLink;
export const pulumiStateBucket = stateBackend.bucketName;
export const pulumiBackendUrl = stateBackend.backendUrl;
export const stateBackendBootstrapCaveat = stateBackend.bootstrapCaveat;
export const mongoAddress = infraConfig.database.address;
export const mongoSeedList = mongo?.seedList;
export const mongoConnection = mongo?.connection;
export const configuredFileStorageMode = infraConfig.storage.fileStorageMode;
export const configuredSharedVolumeType = infraConfig.storage.sharedVolumeType;
export const configuredSharedVolumeMountPath = infraConfig.storage.sharedVolumeMountPath;
export const configuredProfileImagesMountPath = infraConfig.storage.profileImagesMountPath;
export const serviceDefinitions = infraConfig.services;
export const publicServiceUrls = infraConfig.publicServices.map((service) => service.url);
export const privateServiceNames = infraConfig.privateServices.map((service) => service.name);
export const cloudRunIngressModes = {
  api: internalIngressMode,
  console: publicIngressMode,
  expert: internalIngressMode,
  mail: internalIngressMode,
  scheduler: internalIngressMode,
};
export const serviceAccountEmails = serviceIdentities.serviceAccountEmails;
export const secretNames = secrets.secretNames;
export const monitoringUptimeChecks = Object.keys(monitoring.uptimeChecks);
export const cloudRunServiceUris = pulumi
  .all([consoleCloudRun.serviceUris, cloudRunBackends.serviceUris] as const)
  .apply(([consoleUris, backendUris]) => ({
    ...backendUris,
    ...consoleUris,
  }));
export const cloudRunServiceNames = pulumi
  .all([consoleCloudRun.serviceNames, cloudRunBackends.serviceNames] as const)
  .apply(([consoleNames, backendNames]) => ({
    ...backendNames,
    ...consoleNames,
  }));
export const baselineBootstrapJobName = baselineBootstrapJob.name;
export const publicInvokerBindingNames: string[] = [];
export const domainMappingDnsRecords = domainMappings.console.dnsRecords.apply((records) => ({
  console: records,
}));
