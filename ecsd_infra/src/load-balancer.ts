import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { createServiceName } from "./naming";
import {
  InfrastructureConfig,
  LoadBalancerBackendAttachmentInput,
  LoadBalancerBackendAttachmentMode,
  LoadBalancerBackendContract,
  LoadBalancerCertificateMode,
  LoadBalancerCloudRunBackendConfig,
  LoadBalancerFrontendConfig,
} from "./types";

const REGIONAL_EXTERNAL_MANAGED_LB_SCHEME = "EXTERNAL_MANAGED" as const;
const HTTPS_PORT = "443" as const;
const DEFAULT_PATH_MATCHER_NAME = "smartcomplai-paths" as const;

export interface RegionalExternalHttpsLoadBalancerRouteInput {
  path: string;
  serviceKey: string;
  serviceName: string;
  serviceUrl: string;
}

export interface RegionalExternalHttpsLoadBalancerPrerequisitesInput {
  address: pulumi.Input<string>;
  addressName: pulumi.Input<string>;
  networkSelfLink: pulumi.Input<string>;
  proxyOnlySubnetCidr: pulumi.Input<string>;
  proxyOnlySubnetSelfLink: pulumi.Input<string>;
  publicRoutes: pulumi.Input<pulumi.Input<RegionalExternalHttpsLoadBalancerRouteInput>[]>;
  region: pulumi.Input<string>;
  serverlessNegRegion: pulumi.Input<string>;
}

export interface RegionalExternalHttpsLoadBalancerArgs {
  config: InfrastructureConfig;
  prerequisites: RegionalExternalHttpsLoadBalancerPrerequisitesInput;
  frontend?: LoadBalancerFrontendConfig;
  backendAttachments?: pulumi.Input<pulumi.Input<LoadBalancerBackendAttachmentInput>[]>;
  labels?: pulumi.Input<Record<string, pulumi.Input<string>>>;
}

export interface RegionalExternalHttpsLoadBalancerOutputs {
  hostname: pulumi.Output<string>;
  frontendIpAddress: pulumi.Output<string>;
  frontendIpName: pulumi.Output<string>;
  backendServices: pulumi.Output<Record<string, string>>;
  backendContracts: pulumi.Output<Record<string, LoadBalancerBackendContract>>;
  urlMapName: pulumi.Output<string>;
  targetHttpsProxyName: pulumi.Output<string>;
  forwardingRuleName: pulumi.Output<string>;
  routing: pulumi.Output<{
    defaultServiceKey: string;
    hostnames: string[];
    pathRules: Array<{
      paths: string[];
      serviceKey: string;
      serviceName: string;
    }>;
  }>;
  frontendContract: pulumi.Output<{
    certificateMode: LoadBalancerCertificateMode;
    hostname: string;
    networkSelfLink: string;
    proxyOnlySubnetCidr: string;
    proxyOnlySubnetSelfLink: string;
    region: string;
  }>;
}

type ResolvedRoute = RegionalExternalHttpsLoadBalancerRouteInput & {
  normalizedMatchPaths: string[];
};

type ResolvedAttachment = LoadBalancerBackendAttachmentInput & {
  mode: LoadBalancerBackendAttachmentMode;
  timeoutSec: number;
};

function defaultHostnameForConfig(config: InfrastructureConfig): string {
  return config.loadBalancer.hostname ?? config.baseDomain;
}

function resolveFrontendConfig(
  config: InfrastructureConfig,
  frontend?: LoadBalancerFrontendConfig,
): LoadBalancerFrontendConfig {
  const resolved: LoadBalancerFrontendConfig = {
    hostname: frontend?.hostname ?? defaultHostnameForConfig(config),
    certificateMode:
      frontend?.certificateMode ??
      config.loadBalancer.certificateMode ??
      "existing-region-ssl-certificate",
    existingRegionSslCertificateIds:
      frontend?.existingRegionSslCertificateIds ??
      config.loadBalancer.existingRegionSslCertificateIds,
    certificateManagerCertificateIds:
      frontend?.certificateManagerCertificateIds ??
      config.loadBalancer.certificateManagerCertificateIds,
  };

  if (
    resolved.certificateMode === "existing-region-ssl-certificate" &&
    (!resolved.existingRegionSslCertificateIds ||
      resolved.existingRegionSslCertificateIds.length === 0)
  ) {
    throw new Error(
      "Regional external HTTPS load balancer requires at least one regional SSL certificate ID when certificateMode is existing-region-ssl-certificate.",
    );
  }

  if (
    resolved.certificateMode === "certificate-manager" &&
    (!resolved.certificateManagerCertificateIds ||
      resolved.certificateManagerCertificateIds.length === 0)
  ) {
    throw new Error(
      "Regional external HTTPS load balancer requires at least one Certificate Manager certificate reference when certificateMode is certificate-manager.",
    );
  }

  return resolved;
}

function normalizeRouteMatchPaths(path: string): string[] {
  if (path === "/") {
    return ["/*"];
  }

  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
  return [normalizedPath, `${normalizedPath}/*`];
}

function resolveRoutes(
  routes: RegionalExternalHttpsLoadBalancerRouteInput[],
): {
  defaultRoute: ResolvedRoute;
  orderedRoutes: ResolvedRoute[];
} {
  if (routes.length === 0) {
    throw new Error("Regional external HTTPS load balancer requires at least one public route.");
  }

  const orderedRoutes = [...routes]
    .map((route) => ({
      ...route,
      normalizedMatchPaths: normalizeRouteMatchPaths(route.path),
    }))
    .sort((left, right) => {
      if (left.path === "/") {
        return -1;
      }

      if (right.path === "/") {
        return 1;
      }

      return right.path.length - left.path.length;
    });

  const defaultRoute = orderedRoutes.find((route) => route.path === "/");
  if (!defaultRoute) {
    throw new Error(
      "Regional external HTTPS load balancer requires one public route with path '/' to act as the default service.",
    );
  }

  return {
    defaultRoute,
    orderedRoutes,
  };
}

function resolveAttachments(
  attachments: LoadBalancerBackendAttachmentInput[] | undefined,
): Map<string, ResolvedAttachment> {
  const resolved = new Map<string, ResolvedAttachment>();

  for (const attachment of attachments ?? []) {
    const mode = "cloud-run-service-neg";
    const timeoutSec = attachment.timeoutSec ?? 30;
    resolved.set(attachment.serviceKey, {
      ...attachment,
      mode,
      timeoutSec,
    });
  }

  return resolved;
}

function resolveCloudRunBackend(
  route: ResolvedRoute,
  attachments: pulumi.Output<LoadBalancerBackendAttachmentInput[]>,
): pulumi.Output<LoadBalancerCloudRunBackendConfig> {
  return attachments.apply((values) => {
    const attachment = resolveAttachments(values).get(route.serviceKey);

    return {
      service: attachment?.cloudRun?.service ?? route.serviceName,
      tag: attachment?.cloudRun?.tag,
      urlMask: attachment?.cloudRun?.urlMask,
    };
  });
}

export class RegionalExternalHttpsLoadBalancer
  extends pulumi.ComponentResource
  implements RegionalExternalHttpsLoadBalancerOutputs
{
  readonly hostname: pulumi.Output<string>;
  readonly frontendIpAddress: pulumi.Output<string>;
  readonly frontendIpName: pulumi.Output<string>;
  readonly backendServices: pulumi.Output<Record<string, string>>;
  readonly backendContracts: pulumi.Output<Record<string, LoadBalancerBackendContract>>;
  readonly urlMapName: pulumi.Output<string>;
  readonly targetHttpsProxyName: pulumi.Output<string>;
  readonly forwardingRuleName: pulumi.Output<string>;
  readonly routing: pulumi.Output<{
    defaultServiceKey: string;
    hostnames: string[];
    pathRules: Array<{
      paths: string[];
      serviceKey: string;
      serviceName: string;
    }>;
  }>;
  readonly frontendContract: pulumi.Output<{
    certificateMode: LoadBalancerCertificateMode;
    hostname: string;
    networkSelfLink: string;
    proxyOnlySubnetCidr: string;
    proxyOnlySubnetSelfLink: string;
    region: string;
  }>;

  constructor(
    name: string,
    args: RegionalExternalHttpsLoadBalancerArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:loadbalancer:RegionalExternalHttpsLoadBalancer", name, {}, opts);

    const project = args.config.gcp.project;
    const frontend = resolveFrontendConfig(args.config, args.frontend);
    const hostname = frontend.hostname;
    const attachments = pulumi.output(args.backendAttachments ?? []);
    const routeModel = resolveRoutes(
      args.config.publicServices.map((service) => ({
        path: service.path,
        serviceKey: service.key,
        serviceName: service.name,
        serviceUrl: service.url,
      })),
    );
    const defaultRoute = routeModel.defaultRoute;
    const orderedRoutes = routeModel.orderedRoutes;

    const backendServiceEntries = orderedRoutes.map((route) => {
      const cloudRunBackend = resolveCloudRunBackend(route, attachments);
      const serverlessNeg = new gcp.compute.RegionNetworkEndpointGroup(
        `${name}-${route.serviceKey}-neg`,
        {
          name: createServiceName(args.config.environment, `${route.serviceKey}-neg`),
          description: pulumi.interpolate`Serverless NEG for ${route.serviceName} at ${route.path}.`,
          networkEndpointType: "SERVERLESS",
          project,
          region: args.prerequisites.serverlessNegRegion,
          cloudRun: cloudRunBackend,
        },
        { parent: this },
      );

      const backendService = new gcp.compute.RegionBackendService(
        `${name}-${route.serviceKey}-backend`,
        {
          name: createServiceName(args.config.environment, `${route.serviceKey}-lb-backend`),
          description: pulumi.interpolate`Regional external HTTPS backend for ${route.serviceName} at ${route.path}.`,
          loadBalancingScheme: REGIONAL_EXTERNAL_MANAGED_LB_SCHEME,
          protocol: "HTTP",
          timeoutSec: attachments.apply((values) => {
            const match = resolveAttachments(values).get(route.serviceKey);
            return match?.timeoutSec ?? 30;
          }),
          backends: [
            {
              capacityScaler: 1,
              group: serverlessNeg.selfLink,
            },
          ],
          project,
          region: args.prerequisites.region,
        },
        { parent: this, dependsOn: [serverlessNeg] },
      );

      return {
        route,
        serverlessNeg,
        cloudRunBackend,
        backendService,
      };
    });

    const backendServiceByKey = Object.fromEntries(
      backendServiceEntries.map(({ route, backendService }) => [route.serviceKey, backendService.id]),
    );

    const backendServiceNamesByKey = Object.fromEntries(
      backendServiceEntries.map(({ route, backendService }) => [route.serviceKey, backendService.name]),
    );

    this.backendServices = pulumi.all(backendServiceByKey);

    this.hostname = pulumi.output(hostname);
    this.frontendIpAddress = pulumi.output(args.prerequisites.address);
    this.frontendIpName = pulumi.output(args.prerequisites.addressName);

    const pathRules = orderedRoutes
      .filter((route) => route.path !== "/")
      .map((route) => ({
        paths: route.normalizedMatchPaths,
        service: backendServiceByKey[route.serviceKey],
      }));

    const urlMap = new gcp.compute.RegionUrlMap(
      `${name}-url-map`,
      {
        name: createServiceName(args.config.environment, "smartcomplai-url-map"),
        description: pulumi.interpolate`Regional external HTTPS URL map for ${hostname}.`,
        defaultService: backendServiceByKey[defaultRoute.serviceKey],
        hostRules: [
          {
            hosts: [hostname],
            pathMatcher: DEFAULT_PATH_MATCHER_NAME,
          },
        ],
        pathMatchers: [
          {
            name: DEFAULT_PATH_MATCHER_NAME,
            defaultService: backendServiceByKey[defaultRoute.serviceKey],
            pathRules,
          },
        ],
        project,
        region: args.prerequisites.region,
        tests: orderedRoutes.map((route) => ({
          host: hostname,
          path: route.path,
          service: backendServiceByKey[route.serviceKey],
        })),
      },
      { parent: this },
    );

    const targetHttpsProxyArgs: gcp.compute.RegionTargetHttpsProxyArgs = {
      name: createServiceName(args.config.environment, "smartcomplai-https-proxy"),
      description: pulumi.interpolate`Regional external HTTPS proxy for ${hostname}.`,
      project,
      region: args.prerequisites.region,
      urlMap: urlMap.id,
    };

    if (frontend.certificateMode === "existing-region-ssl-certificate") {
      targetHttpsProxyArgs.sslCertificates = frontend.existingRegionSslCertificateIds!;
    } else {
      targetHttpsProxyArgs.certificateManagerCertificates =
        frontend.certificateManagerCertificateIds!;
    }

    const targetHttpsProxy = new gcp.compute.RegionTargetHttpsProxy(
      `${name}-https-proxy`,
      targetHttpsProxyArgs,
      { parent: this },
    );

    const forwardingRule = new gcp.compute.ForwardingRule(
      `${name}-forwarding-rule`,
      {
        name: createServiceName(args.config.environment, "smartcomplai-https-fr"),
        description: pulumi.interpolate`Regional external HTTPS forwarding rule for ${hostname}.`,
        ipAddress: args.prerequisites.address,
        ipProtocol: "TCP",
        loadBalancingScheme: REGIONAL_EXTERNAL_MANAGED_LB_SCHEME,
        network: args.prerequisites.networkSelfLink,
        portRange: HTTPS_PORT,
        project,
        region: args.prerequisites.region,
        target: targetHttpsProxy.id,
      },
      { parent: this },
    );

    this.urlMapName = urlMap.name;
    this.targetHttpsProxyName = targetHttpsProxy.name;
    this.forwardingRuleName = forwardingRule.name;

    this.routing = pulumi.output({
      defaultServiceKey: defaultRoute.serviceKey,
      hostnames: [hostname],
      pathRules: orderedRoutes
        .filter((route) => route.path !== "/")
        .map((route) => ({
          paths: route.normalizedMatchPaths,
          serviceKey: route.serviceKey,
          serviceName: route.serviceName,
        })),
    });

    this.frontendContract = pulumi
      .all([
        args.prerequisites.networkSelfLink,
        args.prerequisites.proxyOnlySubnetCidr,
        args.prerequisites.proxyOnlySubnetSelfLink,
        args.prerequisites.region,
      ])
      .apply(([networkSelfLink, proxyOnlySubnetCidr, proxyOnlySubnetSelfLink, region]) => ({
        certificateMode: frontend.certificateMode,
        hostname,
        networkSelfLink,
        proxyOnlySubnetCidr,
        proxyOnlySubnetSelfLink,
        region,
      }));

    this.backendContracts = pulumi
      .all([
        pulumi.all(backendServiceByKey),
        pulumi.all(backendServiceNamesByKey),
        attachments,
        args.prerequisites.serverlessNegRegion,
      ])
      .apply(([backendServiceIds, backendServiceNames, attachmentInputs, serverlessNegRegion]) => {
        const resolvedAttachments = resolveAttachments(attachmentInputs);

        return Object.fromEntries(
          orderedRoutes.map((route) => {
            const attachment = resolvedAttachments.get(route.serviceKey);
            const contract: LoadBalancerBackendContract = {
              serviceKey: route.serviceKey,
              serviceName: route.serviceName,
              path: route.path,
              backendServiceId: backendServiceIds[route.serviceKey],
              backendServiceName: backendServiceNames[route.serviceKey],
              attachmentMode: attachment?.mode ?? "cloud-run-service-neg",
              cloudRun: {
                service: attachment?.cloudRun?.service ?? route.serviceName,
                tag: attachment?.cloudRun?.tag,
                urlMask: attachment?.cloudRun?.urlMask,
              },
              serverlessNegRegion,
            };

            return [route.serviceKey, contract];
          }),
        );
      });

    this.registerOutputs({
      hostname: this.hostname,
      frontendIpAddress: this.frontendIpAddress,
      frontendIpName: this.frontendIpName,
      backendServices: this.backendServices,
      backendContracts: this.backendContracts,
      urlMapName: this.urlMapName,
      targetHttpsProxyName: this.targetHttpsProxyName,
      forwardingRuleName: this.forwardingRuleName,
      routing: this.routing,
      frontendContract: this.frontendContract,
    });
  }
}
