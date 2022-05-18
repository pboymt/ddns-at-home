export interface CFAPIResponse<T> {
    success: boolean
    errors: CFAPIError[]
    messages: string[]
    result_info: CFAPIResponseResultInfo
    result: T
}

export interface CFAPIError {
    code: number
    message: string
}

export interface CFAPIResponseResultInfo {
    page: number
    per_page: number
    count: number
    total_count: number
}

export type CFAPIListZones = CFAPIResponse<CFZone[]>;

export interface CFZone {
    id: string
    name: string
    status: string
    paused: boolean
    permissions: string[]
}

export type CFAPIListDNSRecords = CFAPIResponse<CFDNSRecordOfZone[]>;

export type CFAPIUpdateDNSRecord = CFAPIResponse<CFDNSRecordOfZone>;

export interface CFDNSRecordOfZone {
    id: string
    type: string
    name: string
    content: string
    proxiable: boolean
    proxied: boolean
    ttl: number
    locked: boolean
    zone_id: string
    zone_name: string
    created_on: string
    modified_on: string
    data: object
    meta: {
        auto_added: boolean
        source: string
    }
}
