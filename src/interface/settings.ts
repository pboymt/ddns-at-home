export interface DDNSSetting {
    version: 2
    services: DDNSSettingService[]
    global: DDNSSettingGlobal
    schedule?: DDNSSettingSchedule
}

export interface DDNSSettingGlobal {
    disableIPv6: boolean
    disableIPv4: boolean
    TTL: number
}

export interface DDNSSettingSchedule {
    immediate: boolean
    hour: string
    minute: string
}

export interface DDNSSettingService {
    name: string
    apiKey: string
    apiSecret: string
    domains: DDNSSettingDomain[]
}

export interface DDNSSettingDomain {
    domainName: string
    resourceRecords: DDNSSettingRR[]
}

export interface DDNSSettingRR {
    resourceRecord: string
    disableIPv6?: boolean
    disableIPv4?: boolean
    TTL?: number
}