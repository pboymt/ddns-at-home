export type DDNSSetting = DDNSSettingV1 | DDNSSettingV2;

export interface DDNSSettingV1 {
    serviceName: 'aliyun'
    apiKey: string
    apiSecret: string
    domainName: string
    resourceRecord: string
    disableIPv6: boolean
    disableIPv4: boolean
    TTL: number
}

export interface DDNSSettingV2 {
    version: 2
    services: DDNSSettingV2Service[]
    global: DDNSSettingV2Global
    schedule?: DDNSSettingV2Schedule
}

export interface DDNSSettingV2Global {
    disableIPv6: boolean
    disableIPv4: boolean
    TTL: number
}

export interface DDNSSettingV2Schedule {
    immediate: boolean
    hour: string
    minute: string
}

export interface DDNSSettingV2Service {
    name: string
    apiKey: string
    apiSecret: string
    domains: DDNSSettingV2Domain[]
}

export interface DDNSSettingV2Domain {
    domainName: string
    resourceRecords: DDNSSettingV2RR[]
}

export interface DDNSSettingV2RR {
    resourceRecord: string
    disableIPv6?: boolean
    disableIPv4?: boolean
    TTL?: number
}