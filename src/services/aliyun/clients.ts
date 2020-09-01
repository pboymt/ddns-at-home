import Core from '@alicloud/pop-core';

export function DomainClient(apiKey: string, apiSecret: string): Core {

    return new Core({
        accessKeyId: apiKey,
        accessKeySecret: apiSecret,
        endpoint: 'https://domain.aliyuncs.com',
        apiVersion: '2018-01-29'
    });

}


export function DNSClient(apiKey: string, apiSecret: string): Core {

    return new Core({
        accessKeyId: apiKey,
        accessKeySecret: apiSecret,
        endpoint: 'https://alidns.aliyuncs.com',
        apiVersion: '2015-01-09'
    });

}