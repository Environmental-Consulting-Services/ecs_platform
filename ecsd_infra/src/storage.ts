import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { createServiceName } from "./naming";
import { InfrastructureConfig } from "./types";

export const HYBRID_FILE_STORAGE_MODE = "hybrid-gridfs-and-mounted-volume" as const;

export type SharedVolumeType = "nfs" | "filestore";
export type FilestoreTier = "BASIC_HDD" | "BASIC_SSD" | "ENTERPRISE";

const FILESTORE_MIN_CAPACITY_GB: Record<FilestoreTier, number> = {
  BASIC_HDD: 1024,
  BASIC_SSD: 2560,
  ENTERPRISE: 1024,
};

export interface HybridStoragePrerequisitesArgs {
  config: InfrastructureConfig;
  generatedDocumentsMountPath?: pulumi.Input<string>;
  gridFsUploadsBucket?: pulumi.Input<string>;
  gridFsGeneratedDocumentsBucket?: pulumi.Input<string>;
  networkSelfLink?: pulumi.Input<string>;
  sharedVolumeExportPath?: pulumi.Input<string>;
  sharedVolumeServer?: pulumi.Input<string>;
  filestoreLocation?: pulumi.Input<string>;
  filestoreInstanceName?: pulumi.Input<string>;
  filestoreShareName?: pulumi.Input<string>;
  filestoreTier?: pulumi.Input<FilestoreTier>;
  filestoreCapacityGb?: pulumi.Input<number>;
}

export interface MongoWiringPlaceholders {
  address: pulumi.Output<string>;
  appName: pulumi.Output<string>;
  connectionUriSecretName: pulumi.Output<string>;
  connectionUriTemplate: pulumi.Output<string>;
  databaseName: pulumi.Output<string>;
  gridFsBuckets: pulumi.Output<{
    generatedDocuments: string;
    uploads: string;
  }>;
  passwordSecretName: pulumi.Output<string>;
  usernameSecretName: pulumi.Output<string>;
}

export interface HybridStorageOutputs {
  fileStorageMode: pulumi.Output<typeof HYBRID_FILE_STORAGE_MODE>;
  sharedVolumeType: pulumi.Output<SharedVolumeType>;
  mountedPaths: pulumi.Output<{
    generatedDocuments: string;
    profileImages: string;
    sharedRoot: string;
  }>;
  filesystemBackedPaths: pulumi.Output<string[]>;
  mongo: MongoWiringPlaceholders;
  sharedVolume: pulumi.Output<
    | {
        exportPath: string;
        mountPath: string;
        networkSelfLink?: string;
        nfsServer: string;
        readOnly: false;
        volumeName: string;
        volumeType: "nfs";
      }
    | {
        exportPath: string;
        filestoreIpAddresses: string[];
        filestoreLocation: string;
        filestoreInstanceName: string;
        fileShareName: string;
        mountPath: string;
        networkSelfLink?: string;
        nfsServer: string;
        readOnly: false;
        tier: FilestoreTier;
        volumeName: string;
        volumeType: "filestore";
      }
  >;
  appRuntimeInputs: pulumi.Output<{
    filesystemBackedPaths: string[];
    mongoAddress: string;
    mongoConnectionUriSecretName: string;
    mongoGridFsBuckets: {
      generatedDocuments: string;
      uploads: string;
    };
    mountedPaths: {
      generatedDocuments: string;
      profileImages: string;
      sharedRoot: string;
    };
    sharedVolumeName: string;
    storageMode: typeof HYBRID_FILE_STORAGE_MODE;
  }>;
}

function assertPhaseOneStorageConfig(config: InfrastructureConfig): SharedVolumeType {
  if (config.storage.fileStorageMode !== HYBRID_FILE_STORAGE_MODE) {
    throw new Error(
      `Expected storage mode ${HYBRID_FILE_STORAGE_MODE}; received ${config.storage.fileStorageMode}.`,
    );
  }

  if (config.storage.sharedVolumeType !== "nfs" && config.storage.sharedVolumeType !== "filestore") {
    throw new Error(
      `Unsupported shared volume type ${config.storage.sharedVolumeType}; expected nfs or filestore.`,
    );
  }

  return config.storage.sharedVolumeType;
}

function resolveFilestoreTier(
  tier?: pulumi.Input<FilestoreTier>,
): pulumi.Output<FilestoreTier> {
  return pulumi.output(tier ?? "BASIC_HDD");
}

function resolveFilestoreCapacityGb(
  tier: pulumi.Input<FilestoreTier>,
  capacityGb?: pulumi.Input<number>,
): pulumi.Output<number> {
  return pulumi
    .all([resolveFilestoreTier(tier), pulumi.output(capacityGb)])
    .apply(([resolvedTier, resolvedCapacityGb]) => {
      const minimumCapacityGb = FILESTORE_MIN_CAPACITY_GB[resolvedTier];

      if (resolvedCapacityGb === undefined || resolvedCapacityGb === null) {
        return minimumCapacityGb;
      }

      if (resolvedCapacityGb < minimumCapacityGb) {
        throw new Error(
          `Filestore tier ${resolvedTier} requires at least ${minimumCapacityGb} GiB; received ${resolvedCapacityGb} GiB.`,
        );
      }

      return resolvedCapacityGb;
    });
}

export class HybridStoragePrerequisites
  extends pulumi.ComponentResource
  implements HybridStorageOutputs
{
  readonly fileStorageMode: pulumi.Output<typeof HYBRID_FILE_STORAGE_MODE>;
  readonly sharedVolumeType: pulumi.Output<SharedVolumeType>;
  readonly mountedPaths: pulumi.Output<{
    generatedDocuments: string;
    profileImages: string;
    sharedRoot: string;
  }>;
  readonly filesystemBackedPaths: pulumi.Output<string[]>;
  readonly mongo: MongoWiringPlaceholders;
  readonly sharedVolume: pulumi.Output<
    | {
        exportPath: string;
        mountPath: string;
        networkSelfLink?: string;
        nfsServer: string;
        readOnly: false;
        volumeName: string;
        volumeType: "nfs";
      }
    | {
        exportPath: string;
        filestoreIpAddresses: string[];
        filestoreLocation: string;
        filestoreInstanceName: string;
        fileShareName: string;
        mountPath: string;
        networkSelfLink?: string;
        nfsServer: string;
        readOnly: false;
        tier: FilestoreTier;
        volumeName: string;
        volumeType: "filestore";
      }
  >;
  readonly appRuntimeInputs: pulumi.Output<{
    filesystemBackedPaths: string[];
    mongoAddress: string;
    mongoConnectionUriSecretName: string;
    mongoGridFsBuckets: {
      generatedDocuments: string;
      uploads: string;
    };
    mountedPaths: {
      generatedDocuments: string;
      profileImages: string;
      sharedRoot: string;
    };
    sharedVolumeName: string;
    storageMode: typeof HYBRID_FILE_STORAGE_MODE;
  }>;

  constructor(
    name: string,
    args: HybridStoragePrerequisitesArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:storage:HybridStoragePrerequisites", name, {}, opts);

    const sharedVolumeType = assertPhaseOneStorageConfig(args.config);
    const environment = args.config.environment;
    const volumeName = createServiceName(environment, "shared-files");
    const mongoAppName = createServiceName(environment, "app");
    const filestoreLocation =
      args.filestoreLocation ??
      args.config.mongo?.members[0]?.zone ??
      `${args.config.gcp.region}-a`;
    const filestoreTier = resolveFilestoreTier(args.filestoreTier);
    const filestoreCapacityGb = resolveFilestoreCapacityGb(
      filestoreTier,
      args.filestoreCapacityGb,
    );

    const sharedRoot = pulumi.output(args.config.storage.sharedVolumeMountPath);
    const profileImages = pulumi.output(args.config.storage.profileImagesMountPath);
    const generatedDocuments = pulumi.output(
      args.generatedDocumentsMountPath ?? pulumi.interpolate`${sharedRoot}/generated-pdfs`,
    );
    const requiredNetworkSelfLinkInput = args.networkSelfLink ?? args.config.mongo?.networkSelfLink;

    if (sharedVolumeType === "filestore" && !requiredNetworkSelfLinkInput) {
      throw new Error("networkSelfLink is required when storage.sharedVolumeType is filestore.");
    }

    const networkSelfLink = pulumi.output(requiredNetworkSelfLinkInput);
    const exportPath = pulumi.output(args.sharedVolumeExportPath ?? "/ecsd");
    const gridFsUploadsBucket = pulumi.output(args.gridFsUploadsBucket ?? "uploads");
    const gridFsGeneratedDocumentsBucket = pulumi.output(
      args.gridFsGeneratedDocumentsBucket ?? "generated-documents",
    );

    this.fileStorageMode = pulumi.output(HYBRID_FILE_STORAGE_MODE);
    this.sharedVolumeType = pulumi.output(sharedVolumeType);
    this.mountedPaths = pulumi
      .all([sharedRoot, profileImages, generatedDocuments] as const)
      .apply(([sharedRootValue, profileImagesValue, generatedDocumentsValue]) => ({
        generatedDocuments: generatedDocumentsValue,
        profileImages: profileImagesValue,
        sharedRoot: sharedRootValue,
      }));
    this.filesystemBackedPaths = pulumi
      .all([sharedRoot, profileImages, generatedDocuments] as const)
      .apply(([sharedRootValue, profileImagesValue, generatedDocumentsValue]) => [
        sharedRootValue,
        profileImagesValue,
        generatedDocumentsValue,
      ]);

    const mongoAddress = pulumi.output(args.config.database.address);
    const mongoDatabaseName = pulumi.output("ecsd");
    const mongoConnectionUriSecretName = pulumi.output(
      createServiceName(environment, "mongo-uri"),
    );
    const mongoUsernameSecretName = pulumi.output(
      createServiceName(environment, "mongo-username"),
    );
    const mongoPasswordSecretName = pulumi.output(
      createServiceName(environment, "mongo-password"),
    );
    const mongoGridFsBuckets = pulumi
      .all([gridFsUploadsBucket, gridFsGeneratedDocumentsBucket] as const)
      .apply(([uploads, generatedDocumentsBucket]) => ({
        generatedDocuments: generatedDocumentsBucket,
        uploads,
      }));

    let filestoreInstance: gcp.filestore.Instance | undefined;
    if (sharedVolumeType === "filestore") {
      filestoreInstance = new gcp.filestore.Instance(
        `${name}-filestore`,
        {
          name: args.filestoreInstanceName ?? createServiceName(environment, "filestore"),
          location: filestoreLocation,
          tier: filestoreTier,
          fileShares: {
            name: args.filestoreShareName ?? "ecsd",
            capacityGb: filestoreCapacityGb,
          },
          networks: [
            {
              network: networkSelfLink as pulumi.Input<string>,
              modes: ["MODE_IPV4"],
              connectMode: "DIRECT_PEERING",
            },
          ],
          description: "ECSD shared filesystem for profile images and generated documents.",
        },
        { parent: this },
      );
    }

    this.mongo = {
      address: mongoAddress,
      appName: pulumi.output(mongoAppName),
      connectionUriSecretName: mongoConnectionUriSecretName,
      connectionUriTemplate: pulumi
        .all([mongoAddress, mongoDatabaseName] as const)
        .apply(
          ([address, databaseName]) =>
            `mongodb://${address}/${databaseName}?appName=${encodeURIComponent(mongoAppName)}`,
        ),
      databaseName: mongoDatabaseName,
      gridFsBuckets: mongoGridFsBuckets,
      passwordSecretName: mongoPasswordSecretName,
      usernameSecretName: mongoUsernameSecretName,
    };

    const filestoreNetworks: pulumi.Output<gcp.types.output.filestore.InstanceNetwork[]> =
      filestoreInstance
        ? filestoreInstance.networks
        : pulumi.output([] as gcp.types.output.filestore.InstanceNetwork[]);

    this.sharedVolume = pulumi
      .all([
        this.sharedVolumeType,
        pulumi.output(volumeName),
        sharedRoot,
        exportPath,
        pulumi.output(args.sharedVolumeServer),
        pulumi.output(args.filestoreInstanceName ?? createServiceName(environment, "filestore")),
        pulumi.output(args.filestoreShareName ?? "ecsd"),
        filestoreTier,
        networkSelfLink,
        pulumi.output(filestoreLocation),
      ])
      .apply(
        (values) => {
          const [
            volumeType,
            resolvedVolumeName,
            mountPath,
            resolvedExportPath,
            nfsServer,
            filestoreInstanceName,
            fileShareName,
            resolvedFilestoreTier,
            resolvedNetworkSelfLink,
            resolvedFilestoreLocation,
          ] = values as unknown as [
            SharedVolumeType,
            string,
            string,
            string,
            string | undefined,
            string,
            string,
            FilestoreTier,
            string | undefined,
            string,
          ];

          return filestoreNetworks.apply((resolvedFilestoreNetworks) => {
            const requiredVolumeName = resolvedVolumeName ?? volumeName;
            const requiredMountPath = mountPath ?? args.config.storage.sharedVolumeMountPath;
            const requiredExportPath = resolvedExportPath ?? "/ecsd";

            if (volumeType === "filestore") {
              const filestoreServer = resolvedFilestoreNetworks[0]?.ipAddresses?.[0];

              return {
                exportPath: requiredExportPath,
                filestoreIpAddresses: resolvedFilestoreNetworks[0]?.ipAddresses ?? [],
                filestoreLocation: resolvedFilestoreLocation,
                filestoreInstanceName,
                fileShareName,
                mountPath: requiredMountPath,
                networkSelfLink: resolvedNetworkSelfLink,
                nfsServer: filestoreServer ?? "",
                readOnly: false as const,
                tier: resolvedFilestoreTier,
                volumeName: requiredVolumeName,
                volumeType: "filestore" as const,
              };
            }

            if (!nfsServer) {
              throw new Error("sharedVolumeServer is required when storage.sharedVolumeType is nfs.");
            }

            return {
              exportPath: requiredExportPath,
              mountPath: requiredMountPath,
              networkSelfLink: resolvedNetworkSelfLink,
              nfsServer,
              readOnly: false as const,
              volumeName: requiredVolumeName,
              volumeType: "nfs" as const,
            };
          });
        },
      ) as HybridStorageOutputs["sharedVolume"];

    this.appRuntimeInputs = pulumi
      .all([
        this.filesystemBackedPaths,
        mongoAddress,
        mongoConnectionUriSecretName,
        mongoGridFsBuckets,
        this.mountedPaths,
        pulumi.output(volumeName),
      ] as const)
      .apply(
        ([
          filesystemBackedPaths,
          resolvedMongoAddress,
          resolvedMongoConnectionUriSecretName,
          resolvedMongoGridFsBuckets,
          mountedPaths,
          sharedVolumeName,
        ]) => ({
          filesystemBackedPaths,
          mongoAddress: resolvedMongoAddress,
          mongoConnectionUriSecretName: resolvedMongoConnectionUriSecretName,
          mongoGridFsBuckets: resolvedMongoGridFsBuckets,
          mountedPaths,
          sharedVolumeName,
          storageMode: HYBRID_FILE_STORAGE_MODE,
        }),
      );

    this.registerOutputs({
      fileStorageMode: this.fileStorageMode,
      sharedVolumeType: this.sharedVolumeType,
      mountedPaths: this.mountedPaths,
      filesystemBackedPaths: this.filesystemBackedPaths,
      mongo: this.mongo,
      sharedVolume: this.sharedVolume,
      appRuntimeInputs: this.appRuntimeInputs,
    });
  }
}
