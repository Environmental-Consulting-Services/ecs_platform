import * as pulumi from "@pulumi/pulumi";

import { createServiceName, createServiceUrl } from "./naming";
import {
  InfrastructureConfig,
  NormalizedServiceConfig,
  ServicesConfig,
} from "./types";

function normalizeServices(
  environment: string,
  baseDomain: string,
  services: ServicesConfig,
): NormalizedServiceConfig[] {
  return Object.entries(services).map(([serviceName, service]) => ({
    key: serviceName,
    name: createServiceName(environment, serviceName),
    image: service.image,
    path: service.path,
    public: service.public ?? true,
    url: createServiceUrl(baseDomain, service.path),
  }));
}

export function loadInfraConfig(): InfrastructureConfig {
  const config = new pulumi.Config();
  const gcpConfig = new pulumi.Config("gcp");

  const environment = config.get("environment") ?? "prod";
  const baseDomain = config.require("baseDomain");
  const databaseHost = config.require("databaseHost");
  const databasePort = Number(config.get("databasePort") ?? "27017");
  const mongoMemberPrefix = config.get("mongoMemberPrefix") ?? "mongo";
  const services = normalizeServices(
    environment,
    baseDomain,
    config.requireObject<ServicesConfig>("services"),
  );
  const mongoMembers = config
    .getObject<
      {
        name: string;
        zone: string;
        machineType: string;
        bootDiskSizeGb?: number;
        dataDiskSizeGb: number;
      }[]
    >("mongoMembers");

  return {
    environment,
    gcp: {
      project: gcpConfig.require("project"),
      region: gcpConfig.require("region"),
    },
    baseDomain,
    dnsZoneName: config.require("dnsZoneName"),
    artifactRegistryRepository: config.require("artifactRegistryRepository"),
    stateBackend: {
      bucketName: config.require("stateBackendBucketName"),
      location: config.get("stateBackendLocation") ?? gcpConfig.require("region"),
    },
    loadBalancer: {
      type: config.require("loadBalancerType"),
      region: config.require("loadBalancerRegion"),
      ipMode: config.require("loadBalancerIpMode"),
      ipName: config.require("loadBalancerIpName"),
      hostname: config.get("loadBalancerHostname") ?? baseDomain,
      certificateMode:
        (config.get("loadBalancerCertificateMode") as
          | "existing-region-ssl-certificate"
          | "certificate-manager"
          | undefined) ?? undefined,
      existingRegionSslCertificateIds:
        config.getObject<string[]>("loadBalancerExistingRegionSslCertificateIds") ?? undefined,
      certificateManagerCertificateIds:
        config.getObject<string[]>("loadBalancerCertificateManagerCertificateIds") ?? undefined,
    },
    database: {
      host: databaseHost,
      port: databasePort,
      address: `${databaseHost}:${databasePort}`,
    },
    mongo: mongoMembers
      ? {
          deploymentMode: "self-managed-gce",
          replicaSetName: config.get("mongoReplicaSetName") ?? "rs0",
          databaseName: config.get("mongoDatabaseName") ?? "ecsd",
          port: Number(config.get("mongoPort") ?? databasePort),
          appName: config.get("mongoAppName") ?? "ecsd-app",
          networkSelfLink: config.get("mongoNetworkSelfLink") ?? "",
          subnetworkSelfLink: config.get("mongoSubnetworkSelfLink") ?? undefined,
          members: mongoMembers.map((member, index) => ({
            ...member,
            name: member.name || `${mongoMemberPrefix}-${index + 1}`,
          })),
          connectionUriSecretName:
            config.get("mongoConnectionUriSecretName") ??
            createServiceName(environment, "mongo-uri"),
          usernameSecretName:
            config.get("mongoUsernameSecretName") ??
            createServiceName(environment, "mongo-username"),
          passwordSecretName:
            config.get("mongoPasswordSecretName") ??
            createServiceName(environment, "mongo-password"),
        }
      : undefined,
    storage: {
      fileStorageMode: config.require("fileStorageMode"),
      sharedVolumeType: config.require("sharedVolumeType"),
      sharedVolumeMountPath: config.require("sharedVolumeMountPath"),
      profileImagesMountPath: config.require("profileImagesMountPath"),
    },
    services,
    publicServices: services.filter((service) => service.public),
    privateServices: services.filter((service) => !service.public),
  };
}

export const infraConfig = loadInfraConfig();
