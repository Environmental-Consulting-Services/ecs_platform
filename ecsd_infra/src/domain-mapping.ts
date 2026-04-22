import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

export interface CloudRunDomainMappingArgs {
  domain: pulumi.Input<string>;
  location: pulumi.Input<string>;
  project: pulumi.Input<string>;
  serviceName: pulumi.Input<string>;
  forceOverride?: pulumi.Input<boolean>;
}

export class CloudRunDomainMapping extends pulumi.ComponentResource {
  readonly mapping: gcp.cloudrun.DomainMapping;
  readonly domain: pulumi.Output<string>;
  readonly dnsRecords: pulumi.Output<gcp.types.output.cloudrun.DomainMappingStatusResourceRecord[]>;

  constructor(
    name: string,
    args: CloudRunDomainMappingArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:cloudrun:DomainMapping", name, {}, opts);

    this.mapping = new gcp.cloudrun.DomainMapping(
      `${name}-mapping`,
      {
        name: args.domain,
        location: args.location,
        project: args.project,
        metadata: {
          namespace: args.project,
        },
        spec: {
          routeName: args.serviceName,
          certificateMode: "AUTOMATIC",
          forceOverride: args.forceOverride ?? false,
        },
      },
      { parent: this },
    );

    this.domain = pulumi.output(args.domain);
    this.dnsRecords = this.mapping.statuses.apply(
      (statuses) => statuses?.[0]?.resourceRecords ?? [],
    );

    this.registerOutputs({
      domain: this.domain,
      dnsRecords: this.dnsRecords,
      mapping: this.mapping,
    });
  }
}
