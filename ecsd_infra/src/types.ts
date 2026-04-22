import * as pulumi from "@pulumi/pulumi";

export type ServiceConfig = {
  image: string;
  path: string;
  public?: boolean;
};

export type ServicesConfig = Record<string, ServiceConfig>;

export type NormalizedServiceConfig = {
  key: string;
  name: string;
  image: string;
  path: string;
  public: boolean;
  url: string;
};

export type LoadBalancerConfig = {
  type: string;
  region: string;
  ipMode: string;
  ipName: string;
  hostname?: string;
  certificateMode?: LoadBalancerCertificateMode;
  existingRegionSslCertificateIds?: string[];
  certificateManagerCertificateIds?: string[];
};

export type LoadBalancerCertificateMode =
  | "existing-region-ssl-certificate"
  | "certificate-manager";

export type LoadBalancerBackendAttachmentMode =
  | "placeholder"
  | "existing-backend-service"
  | "cloud-run-service-neg";

export type LoadBalancerFrontendConfig = {
  hostname: string;
  certificateMode: LoadBalancerCertificateMode;
  existingRegionSslCertificateIds?: string[];
  certificateManagerCertificateIds?: string[];
};

export type LoadBalancerCloudRunBackendConfig = {
  service: pulumi.Input<string>;
  tag?: pulumi.Input<string>;
  urlMask?: pulumi.Input<string>;
};

export type LoadBalancerBackendAttachmentInput = {
  serviceKey: string;
  mode?: LoadBalancerBackendAttachmentMode;
  existingBackendService?: string;
  cloudRun?: LoadBalancerCloudRunBackendConfig;
  timeoutSec?: number;
};

export type LoadBalancerBackendContract = {
  serviceKey: string;
  serviceName: string;
  path: string;
  backendServiceId: string;
  backendServiceName: string;
  attachmentMode: LoadBalancerBackendAttachmentMode;
  cloudRun?: LoadBalancerCloudRunBackendConfig;
  serverlessNegRegion: string;
};

export type DatabaseConfig = {
  host: string;
  port: number;
  address: string;
};

export type MongoDeploymentMode = "self-managed-gce";

export type MongoReplicaSetMemberConfig = {
  name: string;
  zone: string;
  machineType: string;
  bootDiskSizeGb?: number;
  dataDiskSizeGb: number;
};

export type MongoReplicaSetConfig = {
  deploymentMode: MongoDeploymentMode;
  replicaSetName: string;
  databaseName: string;
  port: number;
  appName: string;
  networkSelfLink: string;
  subnetworkSelfLink?: string;
  members: MongoReplicaSetMemberConfig[];
  connectionUriSecretName: string;
  usernameSecretName: string;
  passwordSecretName: string;
};

export type StateBackendConfig = {
  bucketName: string;
  location: string;
};

export type StorageConfig = {
  fileStorageMode: string;
  sharedVolumeType: string;
  sharedVolumeMountPath: string;
  profileImagesMountPath: string;
};

export type GcpConfig = {
  project: string;
  region: string;
};

export type InfrastructureConfig = {
  environment: string;
  gcp: GcpConfig;
  baseDomain: string;
  dnsZoneName: string;
  artifactRegistryRepository: string;
  stateBackend: StateBackendConfig;
  loadBalancer: LoadBalancerConfig;
  database: DatabaseConfig;
  mongo?: MongoReplicaSetConfig;
  storage: StorageConfig;
  services: NormalizedServiceConfig[];
  publicServices: NormalizedServiceConfig[];
  privateServices: NormalizedServiceConfig[];
};

export type CloudRunManagedServiceKey =
  | "console"
  | "api"
  | "expert"
  | "mail"
  | "scheduler";

export type CloudRunIngress =
  | "INGRESS_TRAFFIC_ALL"
  | "INGRESS_TRAFFIC_INTERNAL_ONLY"
  | "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER";

export type CloudRunVpcEgress = "ALL_TRAFFIC" | "PRIVATE_RANGES_ONLY";

export type CloudRunExecutionEnvironment =
  | "EXECUTION_ENVIRONMENT_GEN1"
  | "EXECUTION_ENVIRONMENT_GEN2";

export type InputMap = pulumi.Input<Record<string, pulumi.Input<string>>>;

export type CloudRunServiceRuntimeConfig = {
  port?: pulumi.Input<number>;
  cpu?: pulumi.Input<string>;
  memory?: pulumi.Input<string>;
  cpuIdle?: pulumi.Input<boolean>;
  startupCpuBoost?: pulumi.Input<boolean>;
  minInstances?: pulumi.Input<number>;
  maxInstances?: pulumi.Input<number>;
  concurrency?: pulumi.Input<number>;
  timeout?: pulumi.Input<string>;
  ingress?: pulumi.Input<CloudRunIngress>;
  executionEnvironment?: pulumi.Input<CloudRunExecutionEnvironment>;
};

export type CloudRunEnvVar = {
  name: pulumi.Input<string>;
  value: pulumi.Input<string>;
};

export type CloudRunSecretEnvVar = {
  name: pulumi.Input<string>;
  secret: pulumi.Input<string>;
  version?: pulumi.Input<string>;
};

export type CloudRunVolumeMountConfig = {
  name: pulumi.Input<string>;
  mountPath: pulumi.Input<string>;
};

export type CloudRunSecretVolumeItem = {
  path: pulumi.Input<string>;
  version?: pulumi.Input<string>;
  mode?: pulumi.Input<number>;
};

export type CloudRunVolumeConfig = {
  name: pulumi.Input<string>;
  cloudSqlInstances?: pulumi.Input<pulumi.Input<string>[]>;
  emptyDir?: {
    medium?: pulumi.Input<string>;
    sizeLimit?: pulumi.Input<string>;
  };
  gcs?: {
    bucket: pulumi.Input<string>;
    mountOptions?: pulumi.Input<pulumi.Input<string>[]>;
    readOnly?: pulumi.Input<boolean>;
  };
  nfs?: {
    server: pulumi.Input<string>;
    path: pulumi.Input<string>;
    readOnly?: pulumi.Input<boolean>;
  };
  secret?: {
    secret: pulumi.Input<string>;
    defaultMode?: pulumi.Input<number>;
    items?: pulumi.Input<pulumi.Input<CloudRunSecretVolumeItem>[]>;
  };
};

export type CloudRunVpcAccessConfig = {
  mode?: "auto" | "direct-vpc-egress" | "serverless-vpc-access";
  connector?: pulumi.Input<string>;
  egress?: pulumi.Input<CloudRunVpcEgress>;
  networkInterfaces?: pulumi.Input<
    pulumi.Input<{
      network?: pulumi.Input<string>;
      subnetwork?: pulumi.Input<string>;
      tags?: pulumi.Input<pulumi.Input<string>[]>;
    }>[]
  >;
  connectorSubnet?: {
    name?: pulumi.Input<string>;
    projectId?: pulumi.Input<string>;
  };
  connectorMachineType?: pulumi.Input<string>;
  connectorMinInstances?: pulumi.Input<number>;
  connectorMaxInstances?: pulumi.Input<number>;
  connectorIpCidrRange?: pulumi.Input<string>;
};

export type CloudRunServiceOverride = {
  image?: pulumi.Input<string>;
  runtime?: CloudRunServiceRuntimeConfig;
  serviceAccount?: pulumi.Input<string>;
  env?: CloudRunEnvVar[];
  secretEnv?: CloudRunSecretEnvVar[];
  volumes?: CloudRunVolumeConfig[];
  volumeMounts?: CloudRunVolumeMountConfig[];
  labels?: InputMap;
  annotations?: InputMap;
  vpcAccess?: CloudRunVpcAccessConfig;
};
