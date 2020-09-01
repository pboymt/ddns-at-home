import Core from '@alicloud/pop-core';
import { DDNSSettingV1 } from "./interface";
import { QueryDomainList, QueryDomainByInstanceId, DescribeDomains, DescribeDomainRecords, AddDomainRecord, UpdateDomainRecord } from "./services/aliyun/response";
import { IP } from "./services/ip.old";

interface DescribeDomainRecordsRsp {
    v4: false | { rid: string; value: string; }
    v6: false | { rid: string; value: string; }
}

export class DDNSV1 {

    DomainClient = new Core({
        accessKeyId: this.setting.apiKey,
        accessKeySecret: this.setting.apiSecret,
        endpoint: 'https://domain.aliyuncs.com',
        apiVersion: '2018-01-29'
    });

    DNSClient = new Core({
        accessKeyId: this.setting.apiKey,
        accessKeySecret: this.setting.apiSecret,
        endpoint: 'https://alidns.aliyuncs.com',
        apiVersion: '2015-01-09'
    });

    constructor(private setting: DDNSSettingV1) { }


    async QueryDomainList(domainName: string): Promise<string | null> {

        const params = {
            "PageNum": 1,
            "PageSize": 100
        };

        const requestOption = {
            method: 'POST'
        };

        const result: QueryDomainList = await this.DomainClient.request('QueryDomainList', params, requestOption);

        const domainExists = result.Data.Domain.findIndex(v => {
            if (v.DomainName === domainName) return true;
            return false;
        });

        if (domainExists < 0) {
            return null;
        } else {
            return result.Data.Domain[domainExists].InstanceId;
        }

    }

    async QueryDomainByInstanceId(InstanceId: string): Promise<void> {

        const params = {
            "InstanceId": InstanceId
        };

        const requestOption = {
            method: 'POST'
        };

        const result: QueryDomainByInstanceId = await this.DomainClient.request('QueryDomainByInstanceId', params, requestOption);

        console.log(result.DnsList.dns);

    }

    async DescribeDomains(domainName: string): Promise<string | null> {

        const params = {};

        const requestOption = {
            method: 'POST'
        };

        const result: DescribeDomains = await this.DNSClient.request('DescribeDomains', params, requestOption);

        const domainExists = result.Domains.Domain.findIndex(v => {
            if (v.DomainName === domainName) return true;
            return false;
        });

        if (domainExists < 0) {
            return null;
        } else {
            return result.Domains.Domain[domainExists].DomainName;
        }

    }



    async DescribeDomainRecords(domainName: string, RR: string): Promise<DescribeDomainRecordsRsp> {

        const params = {
            "DomainName": domainName
        };

        const requestOption = {
            method: 'POST'
        };


        const result: DescribeDomainRecords = await this.DNSClient.request('DescribeDomainRecords', params, requestOption);

        const RRExists4 = result.DomainRecords.Record.findIndex(v => {
            if (v.RR === RR && v.Type === 'A') return true;
            return false;
        });

        const RRExists6 = result.DomainRecords.Record.findIndex(v => {
            if (v.RR === RR && v.Type === 'AAAA') return true;
            return false;
        });

        return {
            v4: RRExists4 < 0 ? false : { rid: result.DomainRecords.Record[RRExists4].RecordId, value: result.DomainRecords.Record[RRExists4].Value },
            v6: RRExists6 < 0 ? false : { rid: result.DomainRecords.Record[RRExists6].RecordId, value: result.DomainRecords.Record[RRExists6].Value }
        };

    }

    async AddDomainRecord(DomainName: string, RR: string, Type: 'A' | 'AAAA', Value: string, TTL: number): Promise<boolean> {

        const params = {
            DomainName,
            RR,
            Type,
            Value,
            TTL
        };

        const requestOption = {
            method: 'POST'
        };

        try {

            const result: AddDomainRecord = await this.DNSClient.request('AddDomainRecord', params, requestOption);

            if (result.RecordId && result.RequestId) {

                return true;

            } else {

                return false;

            }


        } catch (error) {

            console.log(error);

            return false;

        }

    }

    async UpdateDomainRecord(RecordId: string, RR: string, Type: 'A' | 'AAAA', Value: string, TTL: number): Promise<boolean> {

        const params = {
            RecordId,
            RR,
            Type,
            Value,
            TTL
        };

        const requestOption = {
            method: 'POST'
        };

        try {

            const result: UpdateDomainRecord = await this.DNSClient.request('UpdateDomainRecord', params, requestOption);

            if (result.RecordId && result.RequestId) {

                return true;

            } else {

                return false;

            }


        } catch (error) {

            console.log(error);

            return false;

        }

    }

    async run(): Promise<void> {

        const DomainName = await this.DescribeDomains(this.setting.domainName);

        if (!DomainName) {

            console.log(`域名 '${this.setting.domainName}' 不存在`);
            return;

        }


        const RRID = await this.DescribeDomainRecords(DomainName, this.setting.resourceRecord);

        if (this.setting.disableIPv4) {

            console.log('禁用IPv4地址的解析记录，跳过对A记录的设置');

        } else {


            if (RRID.v4) {

                console.log(`解析 '${this.setting.resourceRecord}' A记录存在，将进行IPv4变化检测，酌情修改A记录`);

                try {

                    const ip = await IP();

                    if (!ip) throw '';

                    if (RRID.v4.value === ip) {

                        console.log(`您的IPv4地址为：${ip}，没有发生变化，不需要修改解析记录`);

                    } else {

                        console.log(`您的IPv4地址为：${ip}，发生了变化，准备修改解析记录`);

                        const result = await this.UpdateDomainRecord(RRID.v4.rid, this.setting.resourceRecord, 'A', ip, this.setting.TTL);

                        if (result) {

                            console.log('解析记录修改成功');

                        } else {

                            console.log('解析记录修改失败');

                        }

                    }

                } catch (error) {

                    console.log('您的设备没有公网IPv4地址，取消修改解析记录');

                }

            } else {

                console.log(`解析 '${this.setting.resourceRecord}' A记录不存在，将进行IPv4地址嗅探，并添加A记录`);

                try {

                    const ip = await IP();

                    if (!ip) throw '';

                    console.log(`您的IPv4地址为：${ip}，将添加解析记录`);

                    const result = await this.AddDomainRecord(this.setting.domainName, this.setting.resourceRecord, 'A', ip, this.setting.TTL);

                    if (result) {

                        console.log('解析记录修改成功');

                    } else {

                        console.log('解析记录修改失败');

                    }

                } catch (error) {

                    console.log(error);

                    console.log('您的设备没有公网IPv4地址，取消添加解析记录');

                }

            }

        }

        if (this.setting.disableIPv6) {

            console.log('禁用IPv6地址的解析记录，跳过对AAAA记录的设置');

        } else {


            if (RRID.v6) {

                console.log(`解析 '${this.setting.resourceRecord}' AAAA记录存在，将进行IPv6变化检测，酌情修改AAAA记录`);

                try {

                    const ip = await IP(true);

                    if (!ip) throw '';

                    if (RRID.v6.value === ip) {

                        console.log(`您的IPv6地址为：${ip}，没有发生变化，不需要修改解析记录`);

                    } else {

                        console.log(`您的IPv6地址为：${ip}，发生了变化，准备修改解析记录`);

                        const result = await this.UpdateDomainRecord(RRID.v6.rid, this.setting.resourceRecord, 'AAAA', ip, this.setting.TTL);

                        if (result) {

                            console.log('解析记录修改成功');

                        } else {

                            console.log('解析记录修改失败');

                        }

                    }

                } catch (error) {

                    console.log('您的设备没有公网IPv6地址，取消修改解析记录');

                }

            } else {

                console.log(`解析 '${this.setting.resourceRecord}' AAAA记录不存在，将进行IPv6地址嗅探，并添加AAAA记录`);

                try {

                    const ip = await IP(true);

                    if (!ip) throw '';

                    console.log(`您的IPv6地址为：${ip}，将添加解析记录`);

                    const result = await this.AddDomainRecord(this.setting.domainName, this.setting.resourceRecord, 'AAAA', ip, this.setting.TTL);

                    if (result) {

                        console.log('解析记录修改成功');

                    } else {

                        console.log('解析记录修改失败');

                    }

                } catch (error) {

                    console.log('您的设备没有公网IPv6地址，取消添加解析记录');

                }

            }

        }

    }
}