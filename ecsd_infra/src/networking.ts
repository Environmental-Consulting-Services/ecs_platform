import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { createServiceName } from "./naming";
import { InfrastructureConfig, NormalizedServiceConfig } from "./types";

export const REGIONAL_EXTERNAL_LOAD_BALANCER_REGION = "us-central1" as const;
export const REGIONAL_EXTERNAL_LOAD_BALANCER_TYPE = "regional-external-https" as const;

export type RegionalLoadBalancerIpMode =
  | "reuse-existing-regional-ip"
  | "reserve-new-regional-ip";

export interface RegionalLoadBalancerPrerequisitesArgs {
  config: InfrastructureConfig;
  ipName?: pulumi.Input<string>;
  labels?: pulumi.Input<Record<string, pulumi.Input<string>>>;
  existingNetworkSelfLink?: pulumi.Input<string>;
  networkName?: pulumi.Input<string>;
  appSubnetName?: pulumi.Input<string>;
  appSubnetCidr?: pulumi.Input<string>;
  proxyOnlySubnetName?: pulumi.Input<string>;
  proxyOnlySubnetCidr?: pulumi.Input<string>;
}

export interface ApplicationNetworkingArgs {
  config: InfrastructureConfig;
  labels?: pulumi.Input<Record<string, pulumi.Input<string>>>;
  existingNetworkSelfLink?: pulumi.Input<string>;
  networkName?: pulumi.Input<string>;
  appSubnetName?: pulumi.Input<string>;
  appSubnetCidr?: pulumi.Input<string>;
}

export interface ApplicationNetworkingOutputs {
  region: pulumi.Output<string>;
  networkName: pulumi.Output<string>;
  networkSelfLink: pulumi.Output<string>;
  appSubnetName: pulumi.Output<string>;
  appSubnetSelfLink: pulumi.Output<string>;
  appSubnetCidr: pulumi.Output<string>;
}

export interface RegionalLoadBalancerRouteInput {
  path: string;
  serviceKey: string;
  serviceName: string;
  serviceUrl: string;
}

export interface RegionalLoadBalancerPrerequisitesOutputs {
  region: pulumi.Output<string>;
  ipMode: pulumi.Output<RegionalLoadBalancerIpMode>;
  address: pulumi.Output<string>;
  addressName: pulumi.Output<string>;
  networkName: pulumi.Output<string>;
  networkSelfLink: pulumi.Output<string>;
  appSubnetName: pulumi.Output<string>;
  appSubnetSelfLink: pulumi.Output<string>;
  appSubnetCidr: pulumi.Output<string>;
  proxyOnlySubnetName: pulumi.Output<string>;
  proxyOnlySubnetSelfLink: pulumi.Output<string>;
  proxyOnlySubnetCidr: pulumi.Output<string>;
  publicRoutes: pulumi.Output<RegionalLoadBalancerRouteInput[]>;
  loadBalancerInputs: pulumi.Output<{
    address: string;
    addressName: string;
    networkSelfLink: string;
    proxyOnlySubnetCidr: string;
    proxyOnlySubnetSelfLink: string;
    publicRoutes: RegionalLoadBalancerRouteInput[];
    region: string;
    serverlessNegRegion: string;
  }>;
}

function parseNameFromSelfLink(selfLink: string): string {
  const segments = selfLink.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? selfLink;
}

function assertRegionalLoadBalancerConfig(config: InfrastructureConfig): RegionalLoadBalancerIpMode {
  if (config.loadBalancer.type !== REGIONAL_EXTERNAL_LOAD_BALANCER_TYPE) {
    throw new Error(
      `Expected load balancer type ${REGIONAL_EXTERNAL_LOAD_BALANCER_TYPE}; received ${config.loadBalancer.type}.`,
    );
  }

  if (config.loadBalancer.region !== REGIONAL_EXTERNAL_LOAD_BALANCER_REGION) {
    throw new Error(
      `Regional load balancer prerequisites are pinned to ${REGIONAL_EXTERNAL_LOAD_BALANCER_REGION}; received ${config.loadBalancer.region}.`,
    );
  }

  if (
    config.loadBalancer.ipMode !== "reuse-existing-regional-ip" &&
    config.loadBalancer.ipMode !== "reserve-new-regional-ip"
  ) {
    throw new Error(
      `Unsupported load balancer IP mode ${config.loadBalancer.ipMode}; expected reuse-existing-regional-ip or reserve-new-regional-ip.`,
    );
  }

  return config.loadBalancer.ipMode;
}

function mapPublicRoutes(services: NormalizedServiceConfig[]): RegionalLoadBalancerRouteInput[] {
  return services.map((service) => ({
    path: service.path,
    serviceKey: service.key,
    serviceName: service.name,
    serviceUrl: service.url,
  }));
}

export class RegionalLoadBalancerPrerequisites
  extends pulumi.ComponentResource
  implements RegionalLoadBalancerPrerequisitesOutputs
{
  readonly region: pulumi.Output<string>;
  readonly ipMode: pulumi.Output<RegionalLoadBalancerIpMode>;
  readonly address: pulumi.Output<string>;
  readonly addressName: pulumi.Output<string>;
  readonly networkName: pulumi.Output<string>;
  readonly networkSelfLink: pulumi.Output<string>;
  readonly appSubnetName: pulumi.Output<string>;
  readonly appSubnetSelfLink: pulumi.Output<string>;
  readonly appSubnetCidr: pulumi.Output<string>;
  readonly proxyOnlySubnetName: pulumi.Output<string>;
  readonly proxyOnlySubnetSelfLink: pulumi.Output<string>;
  readonly proxyOnlySubnetCidr: pulumi.Output<string>;
  readonly publicRoutes: pulumi.Output<RegionalLoadBalancerRouteInput[]>;
  readonly loadBalancerInputs: pulumi.Output<{
    address: string;
    addressName: string;
    networkSelfLink: string;
    proxyOnlySubnetCidr: string;
    proxyOnlySubnetSelfLink: string;
    publicRoutes: RegionalLoadBalancerRouteInput[];
    region: string;
    serverlessNegRegion: string;
  }>;

  constructor(
    name: string,
    args: RegionalLoadBalancerPrerequisitesArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:networking:RegionalLoadBalancerPrerequisites", name, {}, opts);

    const ipMode = assertRegionalLoadBalancerConfig(args.config);
    const labels = args.labels;
    const project = args.config.gcp.project;
    const region = args.config.loadBalancer.region;
    const defaultNetworkName = createServiceName(args.config.environment, "edge-network");
    const defaultAppSubnetName = createServiceName(args.config.environment, "run-subnet");
    const defaultProxyOnlySubnetName = createServiceName(
      args.config.environment,
      "edge-proxy-only",
    );
    const defaultIpName = createServiceName(args.config.environment, "edge-ip");

    this.region = pulumi.output(region);
    this.ipMode = pulumi.output(ipMode);
    this.appSubnetCidr = pulumi.output(args.appSubnetCidr ?? "10.128.0.0/24");
    this.proxyOnlySubnetCidr = pulumi.output(args.proxyOnlySubnetCidr ?? "10.129.0.0/23");
    this.publicRoutes = pulumi.output(mapPublicRoutes(args.config.publicServices));

    let managedNetwork: gcp.compute.Network | undefined;
    if (!args.existingNetworkSelfLink) {
      managedNetwork = new gcp.compute.Network(
        `${name}-network`,
        {
          name: args.networkName ?? defaultNetworkName,
          autoCreateSubnetworks: false,
          routingMode: "REGIONAL",
          project,
        },
        { parent: this },
      );
    }

    this.networkSelfLink = managedNetwork
      ? managedNetwork.selfLink
      : pulumi.output(args.existingNetworkSelfLink!);
    this.networkName = managedNetwork
      ? managedNetwork.name
      : this.networkSelfLink.apply((selfLink) => parseNameFromSelfLink(selfLink));

    const appSubnet = new gcp.compute.Subnetwork(
      `${name}-app-subnet`,
      {
        name: args.appSubnetName ?? defaultAppSubnetName,
        ipCidrRange: this.appSubnetCidr,
        network: this.networkSelfLink,
        privateIpGoogleAccess: true,
        project,
        region,
      },
      { parent: this },
    );

    this.appSubnetName = appSubnet.name;
    this.appSubnetSelfLink = appSubnet.selfLink;

    const proxyOnlySubnet = new gcp.compute.Subnetwork(
      `${name}-proxy-only`,
      {
        name: args.proxyOnlySubnetName ?? defaultProxyOnlySubnetName,
        ipCidrRange: this.proxyOnlySubnetCidr,
        purpose: "REGIONAL_MANAGED_PROXY",
        role: "ACTIVE",
        network: this.networkSelfLink,
        project,
        region,
      },
      { parent: this },
    );

    this.proxyOnlySubnetName = proxyOnlySubnet.name;
    this.proxyOnlySubnetSelfLink = proxyOnlySubnet.selfLink;

    if (ipMode === "reserve-new-regional-ip") {
      const address = new gcp.compute.Address(
        `${name}-address`,
        {
          name: args.ipName ?? defaultIpName,
          addressType: "EXTERNAL",
          networkTier: "PREMIUM",
          project,
          region,
          labels,
        },
        { parent: this },
      );

      this.address = address.address;
      this.addressName = address.name;
    } else {
      const addressName = pulumi.output(args.ipName ?? defaultIpName);
      const address = gcp.compute.getAddressOutput({
        name: addressName,
        project,
        region,
      });

      this.address = address.address;
      this.addressName = addressName;
    }

    this.loadBalancerInputs = pulumi
      .all([
        this.address,
        this.addressName,
        this.networkSelfLink,
        this.proxyOnlySubnetCidr,
        this.proxyOnlySubnetSelfLink,
        this.publicRoutes,
        this.region,
      ])
      .apply(
        ([
          address,
          addressName,
          networkSelfLink,
          proxyOnlySubnetCidr,
          proxyOnlySubnetSelfLink,
          publicRoutes,
          region,
        ]) => ({
          address,
          addressName,
          networkSelfLink,
          proxyOnlySubnetCidr,
          proxyOnlySubnetSelfLink,
          publicRoutes,
          region,
          serverlessNegRegion: region,
        }),
      );

    this.registerOutputs({
      region: this.region,
      ipMode: this.ipMode,
      address: this.address,
      addressName: this.addressName,
      networkName: this.networkName,
      networkSelfLink: this.networkSelfLink,
      appSubnetName: this.appSubnetName,
      appSubnetSelfLink: this.appSubnetSelfLink,
      appSubnetCidr: this.appSubnetCidr,
      proxyOnlySubnetName: this.proxyOnlySubnetName,
      proxyOnlySubnetSelfLink: this.proxyOnlySubnetSelfLink,
      proxyOnlySubnetCidr: this.proxyOnlySubnetCidr,
      publicRoutes: this.publicRoutes,
      loadBalancerInputs: this.loadBalancerInputs,
    });
  }
}

export class ApplicationNetworking
  extends pulumi.ComponentResource
  implements ApplicationNetworkingOutputs
{
  readonly region: pulumi.Output<string>;
  readonly networkName: pulumi.Output<string>;
  readonly networkSelfLink: pulumi.Output<string>;
  readonly appSubnetName: pulumi.Output<string>;
  readonly appSubnetSelfLink: pulumi.Output<string>;
  readonly appSubnetCidr: pulumi.Output<string>;

  constructor(
    name: string,
    args: ApplicationNetworkingArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:networking:ApplicationNetworking", name, {}, opts);

    const project = args.config.gcp.project;
    const region = args.config.gcp.region;
    const defaultNetworkName = createServiceName(args.config.environment, "app-network");
    const defaultAppSubnetName = createServiceName(args.config.environment, "run-subnet");

    this.region = pulumi.output(region);
    this.appSubnetCidr = pulumi.output(args.appSubnetCidr ?? "10.128.0.0/24");

    let managedNetwork: gcp.compute.Network | undefined;
    if (!args.existingNetworkSelfLink) {
      managedNetwork = new gcp.compute.Network(
        `${name}-network`,
        {
          name: args.networkName ?? defaultNetworkName,
          autoCreateSubnetworks: false,
          routingMode: "REGIONAL",
          project,
        },
        { parent: this },
      );
    }

    this.networkSelfLink = managedNetwork
      ? managedNetwork.selfLink
      : pulumi.output(args.existingNetworkSelfLink!);
    this.networkName = managedNetwork
      ? managedNetwork.name
      : this.networkSelfLink.apply((selfLink) => parseNameFromSelfLink(selfLink));

    const appSubnet = new gcp.compute.Subnetwork(
      `${name}-app-subnet`,
      {
        name: args.appSubnetName ?? defaultAppSubnetName,
        ipCidrRange: this.appSubnetCidr,
        network: this.networkSelfLink,
        privateIpGoogleAccess: true,
        project,
        region,
      },
      { parent: this },
    );

    this.appSubnetName = appSubnet.name;
    this.appSubnetSelfLink = appSubnet.selfLink;

    this.registerOutputs({
      region: this.region,
      networkName: this.networkName,
      networkSelfLink: this.networkSelfLink,
      appSubnetName: this.appSubnetName,
      appSubnetSelfLink: this.appSubnetSelfLink,
      appSubnetCidr: this.appSubnetCidr,
    });
  }
}
