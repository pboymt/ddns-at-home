export interface DDNSSetting {
    serviceName: 'aliyun';
    apiKey: string;
    apiSecret: string;
    domainName: string;
    resourceRecord: string;
    disableIPv6: boolean;
    disableIPv4: boolean;
    TTL: number;
}