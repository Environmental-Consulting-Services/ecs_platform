import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

export const SELF_MANAGED_MONGO_DEPLOYMENT_MODE = "self-managed-gce" as const;
export const DEFAULT_MONGO_PORT = 27017;
export const DEFAULT_MONGO_REPLICA_SET_NAME = "rs0";
export const DEFAULT_MONGO_DATABASE_NAME = "ecsd";
export const DEFAULT_MONGO_APP_NAME = "ecsd-app";

export interface SelfManagedMongoMemberArgs {
  name: string;
  zone: string;
  machineType: string;
  bootDiskSizeGb?: number;
  dataDiskSizeGb: number;
  labels?: pulumi.Input<Record<string, pulumi.Input<string>>>;
  tags?: pulumi.Input<string[]>;
}

export interface SelfManagedMongoReplicaSetArgs {
  environment: pulumi.Input<string>;
  networkSelfLink: pulumi.Input<string>;
  subnetworkSelfLink?: pulumi.Input<string>;
  members: SelfManagedMongoMemberArgs[];
  project?: pulumi.Input<string>;
  region?: pulumi.Input<string>;
  replicaSetName?: pulumi.Input<string>;
  port?: pulumi.Input<number>;
  databaseName?: pulumi.Input<string>;
  appName?: pulumi.Input<string>;
  bootDiskImage?: pulumi.Input<string>;
  bootDiskType?: pulumi.Input<string>;
  dataDiskType?: pulumi.Input<string>;
  serviceAccountEmail?: pulumi.Input<string>;
  serviceAccountScopes?: pulumi.Input<pulumi.Input<string>[]>;
  createFirewall?: boolean;
  allowClientCidrs?: pulumi.Input<pulumi.Input<string>[]>;
  sshSourceRanges?: pulumi.Input<pulumi.Input<string>[]>;
  labels?: pulumi.Input<Record<string, pulumi.Input<string>>>;
  tags?: pulumi.Input<string[]>;
  enablePublicIp?: boolean;
  startupScript?: pulumi.Input<string>;
  authUsername?: pulumi.Input<string>;
  authPassword?: pulumi.Input<string>;
  keyFileContent?: pulumi.Input<string>;
  usernameSecretName?: pulumi.Input<string>;
  passwordSecretName?: pulumi.Input<string>;
  connectionUriSecretName?: pulumi.Input<string>;
}

export interface SelfManagedMongoReplicaSetOutputs {
  deploymentMode: pulumi.Output<typeof SELF_MANAGED_MONGO_DEPLOYMENT_MODE>;
  replicaSetName: pulumi.Output<string>;
  databaseName: pulumi.Output<string>;
  appName: pulumi.Output<string>;
  port: pulumi.Output<number>;
  memberCount: pulumi.Output<number>;
  seedList: pulumi.Output<string>;
  members: pulumi.Output<
    {
      dataDiskName: string;
      directUri: string;
      instanceName: string;
      instanceSelfLink: string;
      internalAddress: string;
      port: number;
      zone: string;
    }[]
  >;
  firewallRules: pulumi.Output<{
    clientRuleName?: string;
    sshRuleName?: string;
  }>;
  connection: pulumi.Output<any>;
  appRuntimeInputs: pulumi.Output<any>;
}

type MongoMemberOutput = {
  dataDiskName: string;
  directUri: string;
  instanceName: string;
  instanceSelfLink: string;
  internalAddress: string;
  port: number;
  zone: string;
};

function ensureReplicaSetShape(members: SelfManagedMongoMemberArgs[]): SelfManagedMongoMemberArgs[] {
  if (members.length < 1) {
    throw new Error("Self-managed MongoDB requires at least 1 member.");
  }

  if (members.length > 1 && members.length % 2 === 0) {
    throw new Error("Self-managed MongoDB replica sets should use an odd number of members.");
  }

  const memberNames = new Set<string>();
  for (const member of members) {
    if (memberNames.has(member.name)) {
      throw new Error(`Duplicate MongoDB member name detected: ${member.name}`);
    }

    memberNames.add(member.name);
  }

  return members;
}

function createBootstrapScript(args: {
  memberName: pulumi.Input<string>;
  primaryMemberName: pulumi.Input<string>;
  replicaSetName: pulumi.Input<string>;
  port: pulumi.Input<number>;
  memberHostnames: pulumi.Input<string[]>;
  authUsername?: pulumi.Input<string>;
  authPassword?: pulumi.Input<string>;
  keyFileContent?: pulumi.Input<string>;
  startupScript?: pulumi.Input<string>;
}): pulumi.Output<string> {
  return pulumi
    .all([
      args.memberName,
      args.primaryMemberName,
      args.replicaSetName,
      args.port,
      args.memberHostnames,
      args.authUsername,
      args.authPassword,
      args.keyFileContent,
      args.startupScript,
    ] as const)
    .apply(([
      memberName,
      primaryMemberName,
      replicaSetName,
      port,
      memberHostnames,
      authUsername,
      authPassword,
      keyFileContent,
      startupScript,
    ]) => {
      const resolvedMemberHostnames = memberHostnames as string[];
      const seedList = resolvedMemberHostnames.map((host: string) => `${host}:${port}`).join(",");
      const members = resolvedMemberHostnames.map((host: string, index: number) => ({
        _id: index,
        host: `${host}:${port}`,
      }));
      const memberConfigJson = JSON.stringify(members, null, 2);
      const enableAuth = Boolean(authUsername && authPassword && keyFileContent);

      return `#!/bin/bash
set -euo pipefail

DATA_DEVICE="$(readlink -f /dev/disk/by-id/google-*-mongodb-data | head -n 1 || true)"
DATA_DIR="/var/lib/mongo"
LOG_DIR="/var/log/mongodb"
MEMBER_NAME="${memberName}"
PRIMARY_MEMBER_NAME="${primaryMemberName}"
AUTH_ENABLED="${enableAuth ? "true" : "false"}"

export DEBIAN_FRONTEND=noninteractive

if ! command -v mongod >/dev/null 2>&1; then
  apt-get update
  apt-get install -y gnupg curl ca-certificates
  curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" >/etc/apt/sources.list.d/mongodb-org-8.0.list
  apt-get update
  apt-get install -y mongodb-org
fi

mkdir -p /etc/mongodb "$DATA_DIR" "$LOG_DIR"
chown -R root:root /etc/mongodb

if [ -n "$DATA_DEVICE" ]; then
  if ! blkid "$DATA_DEVICE" >/dev/null 2>&1; then
    mkfs.ext4 -F "$DATA_DEVICE"
  fi

  mkdir -p "$DATA_DIR"
  if ! grep -q "$DATA_DIR" /etc/fstab; then
    echo "$DATA_DEVICE $DATA_DIR ext4 discard,defaults,nofail 0 2" >>/etc/fstab
  fi
  mount "$DATA_DIR" || true
fi

chown -R mongodb:mongodb "$DATA_DIR" "$LOG_DIR"

cat >/etc/mongodb/replica-set.env <<'EOF'
MONGO_REPLICA_SET=${replicaSetName}
MONGO_PORT=${port}
MONGO_SEED_LIST=${seedList}
EOF

if [ "$AUTH_ENABLED" = "true" ]; then
  cat >/etc/mongodb-keyfile <<'EOF'
${keyFileContent ?? ""}
EOF
  chown mongodb:mongodb /etc/mongodb-keyfile
  chmod 400 /etc/mongodb-keyfile
fi

cat >/etc/mongod.conf <<'EOF'
storage:
  dbPath: /var/lib/mongo
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
net:
  port: ${port}
  bindIp: 0.0.0.0
replication:
  replSetName: ${replicaSetName}
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
${enableAuth ? `security:
  authorization: enabled
  keyFile: /etc/mongodb-keyfile` : ""}
EOF

systemctl daemon-reload
systemctl enable mongod
systemctl restart mongod

cat >/usr/local/bin/ecsd-mongo-rs-init.sh <<'EOF'
#!/bin/bash
set -euo pipefail

if [ "${memberName}" != "${primaryMemberName}" ]; then
  echo "Replica set initiation is owned by ${primaryMemberName}; this member is ${memberName}."
  exit 0
fi

for attempt in $(seq 1 60); do
  if mongosh --quiet --eval 'db.adminCommand({ ping: 1 }).ok' >/dev/null 2>&1; then
    break
  fi
  sleep 5
done

RS_MEMBERS_JSON='${memberConfigJson}'
if [ "${resolvedMemberHostnames.length}" = "1" ]; then
  LOCAL_PRIVATE_IP="$(curl -fsS -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/ip")"
  RS_MEMBERS_JSON="[{\\"_id\\":0,\\"host\\":\\"$LOCAL_PRIVATE_IP:${port}\\"}]"
fi

mongosh --quiet <<MONGOEOF
const desiredConfig = {
  _id: "${replicaSetName}",
  members: $RS_MEMBERS_JSON
};

try {
  rs.status();
  print("Replica set already initialized.");
} catch (error) {
  print("Initializing replica set.");
  rs.initiate(desiredConfig);
}
MONGOEOF

if [ "${enableAuth ? "true" : "false"}" = "true" ]; then
  for attempt in $(seq 1 60); do
    if mongosh --quiet --eval 'db.hello().isWritablePrimary' | grep -q true; then
      break
    fi
    sleep 5
  done

  mongosh --quiet <<'MONGOEOF'
const admin = db.getSiblingDB("admin");
if (!admin.getUser("${authUsername ?? ""}")) {
  admin.createUser({
    user: "${authUsername ?? ""}",
    pwd: "${authPassword ?? ""}",
    roles: [
      { role: "readWrite", db: "ecsd" },
      { role: "readWrite", db: "ecsd_files" },
      { role: "readWrite", db: "ecsd_chat" },
      { role: "readWrite", db: "agenda" }
    ]
  });
}
MONGOEOF
fi
EOF
chmod +x /usr/local/bin/ecsd-mongo-rs-init.sh
/usr/local/bin/ecsd-mongo-rs-init.sh >/var/log/ecsd-mongo-rs-init.log 2>&1 || true
${startupScript ? `${startupScript}\n` : ""}`;
    });
}

export class SelfManagedMongoReplicaSet
  extends pulumi.ComponentResource
  implements SelfManagedMongoReplicaSetOutputs
{
  readonly deploymentMode: pulumi.Output<typeof SELF_MANAGED_MONGO_DEPLOYMENT_MODE>;
  readonly replicaSetName: pulumi.Output<string>;
  readonly databaseName: pulumi.Output<string>;
  readonly appName: pulumi.Output<string>;
  readonly port: pulumi.Output<number>;
  readonly memberCount: pulumi.Output<number>;
  readonly seedList: pulumi.Output<string>;
  readonly members: pulumi.Output<
    MongoMemberOutput[]
  >;
  readonly firewallRules: pulumi.Output<{
    clientRuleName?: string;
    sshRuleName?: string;
  }>;
  readonly connection: pulumi.Output<any>;
  readonly appRuntimeInputs: pulumi.Output<any>;

  constructor(
    name: string,
    args: SelfManagedMongoReplicaSetArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ecsd:mongo:SelfManagedMongoReplicaSet", name, {}, opts);

    const members = ensureReplicaSetShape(args.members);
    this.deploymentMode = pulumi.output(SELF_MANAGED_MONGO_DEPLOYMENT_MODE);
    this.replicaSetName = pulumi.output(args.replicaSetName ?? DEFAULT_MONGO_REPLICA_SET_NAME);
    this.databaseName = pulumi.output(args.databaseName ?? DEFAULT_MONGO_DATABASE_NAME);
    this.appName = pulumi.output(args.appName ?? DEFAULT_MONGO_APP_NAME);
    this.port = pulumi.output(args.port ?? DEFAULT_MONGO_PORT);
    this.memberCount = pulumi.output(members.length);

    const commonTags = pulumi.output(args.tags ?? ["mongodb"]);
    const labels = args.labels;
    const bootDiskImage = args.bootDiskImage ?? "debian-cloud/debian-12";
    const bootDiskType = args.bootDiskType ?? "pd-balanced";
    const dataDiskType = args.dataDiskType ?? "pd-balanced";
    const allowClientCidrs = args.allowClientCidrs ?? ["10.0.0.0/8"];
    const sshSourceRanges = args.sshSourceRanges ?? ["10.0.0.0/8"];
    const usernameSecretName = pulumi.output(
      args.usernameSecretName ?? pulumi.interpolate`ecsd-${args.environment}-mongo-username`,
    );
    const passwordSecretName = pulumi.output(
      args.passwordSecretName ?? pulumi.interpolate`ecsd-${args.environment}-mongo-password`,
    );
    const connectionUriSecretName = pulumi.output(
      args.connectionUriSecretName ?? pulumi.interpolate`ecsd-${args.environment}-mongo-uri`,
    );

    const memberHostnames = members.map((member) => `${name}-${member.name}.internal`);
    const primaryMemberName = members[0].name;

    let clientFirewall: gcp.compute.Firewall | undefined;
    let sshFirewall: gcp.compute.Firewall | undefined;
    if (args.createFirewall ?? true) {
      clientFirewall = new gcp.compute.Firewall(
        `${name}-mongo-clients`,
        {
          name: `${name}-mongo-clients`,
          network: args.networkSelfLink,
          project: args.project,
          allows: [
            {
              protocol: "tcp",
              ports: [this.port.apply((port) => port.toString())],
            },
          ],
          sourceRanges: allowClientCidrs,
          targetTags: commonTags,
          direction: "INGRESS",
        },
        { parent: this },
      );

      sshFirewall = new gcp.compute.Firewall(
        `${name}-mongo-ssh`,
        {
          name: `${name}-mongo-ssh`,
          network: args.networkSelfLink,
          project: args.project,
          allows: [
            {
              protocol: "tcp",
              ports: ["22"],
            },
          ],
          sourceRanges: sshSourceRanges,
          targetTags: commonTags,
          direction: "INGRESS",
        },
        { parent: this },
      );
    }

    const memberResources = members.map((member) => {
      const bootstrapScript = createBootstrapScript({
        memberName: member.name,
        primaryMemberName,
        replicaSetName: this.replicaSetName,
        port: this.port,
        memberHostnames,
        authUsername: args.authUsername,
        authPassword: args.authPassword,
        keyFileContent: args.keyFileContent,
        startupScript: args.startupScript,
      });

      const memberTags = pulumi
        .all([commonTags, pulumi.output(member.tags ?? [])] as const)
        .apply(([sharedTags, memberSpecificTags]) => [...sharedTags, ...memberSpecificTags]);

      const memberLabels = pulumi
        .all([pulumi.output(labels ?? {}), pulumi.output(member.labels ?? {})] as const)
        .apply(([sharedLabels, memberSpecificLabels]) => ({
          ...sharedLabels,
          ...memberSpecificLabels,
          "mongo-member": member.name,
          "mongo-role": "replica-set",
        }));

      const dataDisk = new gcp.compute.Disk(
        `${name}-${member.name}-data`,
        {
          name: `${name}-${member.name}-data`,
          zone: member.zone,
          project: args.project,
          labels: memberLabels,
          size: member.dataDiskSizeGb,
          type: pulumi.interpolate`zones/${member.zone}/diskTypes/${dataDiskType}`,
        },
        { parent: this },
      );

      const instance = new gcp.compute.Instance(
        `${name}-${member.name}`,
        {
          name: `${name}-${member.name}`,
          zone: member.zone,
          project: args.project,
          machineType: member.machineType,
          allowStoppingForUpdate: true,
          tags: memberTags,
          labels: memberLabels,
          bootDisk: {
            initializeParams: {
              image: bootDiskImage,
              size: member.bootDiskSizeGb ?? 50,
              type: bootDiskType,
            },
          },
          attachedDisks: [
            {
              source: dataDisk.id,
              deviceName: `${member.name}-mongodb-data`,
            },
          ],
          metadataStartupScript: bootstrapScript,
          networkInterfaces: [
            {
              network: args.networkSelfLink,
              subnetwork: args.subnetworkSelfLink,
              accessConfigs: args.enablePublicIp ? [{}] : undefined,
            },
          ],
          serviceAccount: args.serviceAccountEmail
            ? {
                email: args.serviceAccountEmail,
                scopes: args.serviceAccountScopes ?? ["https://www.googleapis.com/auth/cloud-platform"],
              }
            : undefined,
        },
        {
          parent: this,
          dependsOn: [dataDisk],
          ignoreChanges: ["metadataStartupScript", "networkInterfaces"],
        },
      );

      return {
        dataDisk,
        instance,
        member,
      };
    });

    this.members = pulumi
      .all(
        memberResources.map(({ dataDisk, instance, member }) =>
          pulumi
            .all([
              dataDisk.name,
              instance.name,
              instance.selfLink,
              instance.networkInterfaces,
              this.port,
              this.databaseName,
            ] as const)
            .apply(([dataDiskName, instanceName, instanceSelfLink, networkInterfaces, port, databaseName]) => {
              const internalAddress = networkInterfaces[0]?.networkIp ?? "";
              return {
                dataDiskName,
                directUri: `mongodb://${internalAddress}:${port}/${databaseName}`,
                instanceName,
                instanceSelfLink,
                internalAddress,
                port,
                zone: member.zone,
              } satisfies MongoMemberOutput;
            }),
        ),
      )
      .apply((resolvedMembers) => resolvedMembers);

    this.seedList = this.members.apply((resolvedMembers) =>
      resolvedMembers.map((member) => `${member.internalAddress}:${member.port}`).join(","),
    );

    this.firewallRules = pulumi
      .all([clientFirewall?.name, sshFirewall?.name] as const)
      .apply(([clientRuleName, sshRuleName]) => ({
        clientRuleName,
        sshRuleName,
      }));

    this.connection = (pulumi.output({
      appName: this.appName,
      connectionUriSecretName,
      databaseName: this.databaseName,
      members: this.members,
      port: this.port,
      replicaSetName: this.replicaSetName,
      seedList: this.seedList,
      usernameSecretName,
      passwordSecretName,
    }) as pulumi.Output<any>).apply(
      ({
        appName,
        connectionUriSecretName,
        databaseName,
        members,
        port,
        replicaSetName,
        seedList,
        usernameSecretName,
        passwordSecretName,
      }: any) => ({
        appName,
        connectionUriSecretName,
        databaseName,
        directConnectionUris: members.map(
          (member: MongoMemberOutput) =>
            `mongodb://${member.internalAddress}:${port}/${databaseName}?directConnection=true`,
        ),
        port,
        replicaSetName,
        replicaSetUriTemplate: `mongodb://<username>:<password>@${seedList}/${databaseName}?replicaSet=${encodeURIComponent(replicaSetName)}&authSource=admin&readPreference=primaryPreferred&retryWrites=false&appName=${encodeURIComponent(appName)}`,
        seedList,
        usernameSecretName,
        passwordSecretName,
      }),
    ) as any;

    this.appRuntimeInputs = (pulumi.output({
      appName: this.appName,
      connectionUriSecretName,
      databaseName: this.databaseName,
      passwordSecretName,
      port: this.port,
      seedList: this.seedList,
      replicaSetName: this.replicaSetName,
      usernameSecretName,
    }) as pulumi.Output<any>).apply(
      ({
        appName,
        connectionUriSecretName,
        databaseName,
        passwordSecretName,
        port,
        seedList,
        replicaSetName,
        usernameSecretName,
      }: any) => ({
        env: {
          mongoAppName: appName,
          mongoDatabase: databaseName,
          mongoHosts: seedList,
          mongoPort: port.toString(),
          mongoReplicaSet: replicaSetName,
        },
        connectionUriSecretName,
        usernameSecretName,
        passwordSecretName,
      }),
    ) as any;

    this.registerOutputs({
      deploymentMode: this.deploymentMode,
      replicaSetName: this.replicaSetName,
      databaseName: this.databaseName,
      appName: this.appName,
      port: this.port,
      memberCount: this.memberCount,
      seedList: this.seedList,
      members: this.members,
      firewallRules: this.firewallRules,
      connection: this.connection,
      appRuntimeInputs: this.appRuntimeInputs,
    });
  }
}
