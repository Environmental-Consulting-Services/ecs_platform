export const SERVICE_NAME_PREFIX = "ecsd";

export function createServiceName(environment: string, serviceName: string): string {
  return `${SERVICE_NAME_PREFIX}-${environment}-${serviceName}`;
}

export function createServiceUrl(baseDomain: string, servicePath: string): string {
  return servicePath === "/" ? `https://${baseDomain}` : `https://${baseDomain}${servicePath}`;
}
