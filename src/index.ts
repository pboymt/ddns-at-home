import Core from "@alicloud/pop-core";
import { join } from "path";
import { DDNSSetting, AliyunResponse } from "./interface";
import { readFileSync } from "fs";
import { v } from "./validate";
import { IP, simpleIP } from "./ip";

const settingPath = join(__dirname, '../settings.json');
const setting: DDNSSetting = JSON.parse(readFileSync(settingPath, 'utf-8'));

const valid = v(setting);

if (!valid) {

    if (v.errors) {

        v.errors.forEach(v => console.error(v));
        throw `${v.errors.length} errors`;

    }

    throw 'Unknown Error';

} else {

    console.log('读取的设置');
    console.log(setting);

}

const DomainClient = new Core({
    accessKeyId: setting.apiKey,
    accessKeySecret: setting.apiSecret,
    endpoint: 'https://domain.aliyuncs.com',
    apiVersion: '2018-01-29'
});

var DNSClient = new Core({
    accessKeyId: setting.apiKey,
    accessKeySecret: setting.apiSecret,
    endpoint: 'https://alidns.aliyuncs.com',
    apiVersion: '2015-01-09'
});

async function QueryDomainList(domainName: string) {

    const params = {
        "PageNum": 1,
        "PageSize": 100
    }

    const requestOption = {
        method: 'POST'
    };

    const result: AliyunResponse.Domain.QueryDomainList = await DomainClient.request('QueryDomainList', params, requestOption);

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

async function QueryDomainByInstanceId(InstanceId: string) {

    var params = {
        "InstanceId": InstanceId
    }

    var requestOption = {
        method: 'POST'
    };

    const result: AliyunResponse.Domain.QueryDomainByInstanceId = await DomainClient.request('QueryDomainByInstanceId', params, requestOption);

    console.log(result.DnsList.dns);

}

async function DescribeDomains(domainName: string) {

    const params = {}

    const requestOption = {
        method: 'POST'
    };

    const result: AliyunResponse.DNS.DescribeDomains = await DNSClient.request('DescribeDomains', params, requestOption);

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

interface DescribeDomainRecordsRsp {
    v4: false | { rid: string, value: string };
    v6: false | { rid: string, value: string };
}

async function DescribeDomainRecords(domainName: string, RR: string): Promise<DescribeDomainRecordsRsp> {

    const params = {
        "DomainName": domainName
    }

    const requestOption = {
        method: 'POST'
    };


    const result: AliyunResponse.DNS.DescribeDomainRecords = await DNSClient.request('DescribeDomainRecords', params, requestOption);

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
    }

}

async function AddDomainRecord(DomainName: string, RR: string, Type: 'A' | 'AAAA', Value: string, TTL: number) {

    const params = {
        DomainName,
        RR,
        Type,
        Value,
        TTL
    }

    const requestOption = {
        method: 'POST'
    };

    try {

        const result: AliyunResponse.DNS.AddDomainRecord = await DNSClient.request('AddDomainRecord', params, requestOption);

        return true;

    } catch (error) {

        console.log(error);

        return false;

    }

}

async function UpdateDomainRecord(RecordId: string, RR: string, Type: 'A' | 'AAAA', Value: string, TTL: number) {

    const params = {
        RecordId,
        RR,
        Type,
        Value,
        TTL
    }

    var requestOption = {
        method: 'POST'
    };

    try {

        const result: AliyunResponse.DNS.UpdateDomainRecord = await DNSClient.request('UpdateDomainRecord', params, requestOption);

        return true;

    } catch (error) {

        console.log(error);

        return false;

    }

}

(async () => {

    const DomainName = await DescribeDomains(setting.domainName);

    if (!DomainName) {

        console.log(`域名 '${setting.domainName}' 不存在`);
        return;

    }


    const RRID = await DescribeDomainRecords(DomainName, setting.resourceRecord);

    if (setting.disableIPv4) {

        console.log('禁用IPv4地址的解析记录，跳过对A记录的设置');

    } else {


        if (RRID.v4) {

            console.log(`解析 '${setting.resourceRecord}' A记录存在，将进行IPv4变化检测，酌情修改A记录`);

            try {

                const ip = await simpleIP();

                if (RRID.v4.value === ip) {

                    console.log(`您的IPv4地址为：${ip}，没有发生变化，不需要修改解析记录`);

                } else {

                    console.log(`您的IPv4地址为：${ip}，发生了变化，准备修改解析记录`);

                    const result = await UpdateDomainRecord(RRID.v4.rid, setting.resourceRecord, 'A', ip, setting.TTL);

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

            console.log(`解析 '${setting.resourceRecord}' A记录不存在，将进行IPv4地址嗅探，并添加A记录`);

            try {

                const ip = await simpleIP();

                console.log(`您的IPv4地址为：${ip}，将添加解析记录`);

                const result = await AddDomainRecord(setting.domainName, setting.resourceRecord, 'A', ip, setting.TTL);

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

    if (setting.disableIPv6) {

        console.log('禁用IPv6地址的解析记录，跳过对AAAA记录的设置');

    } else {


        if (RRID.v6) {

            console.log(`解析 '${setting.resourceRecord}' AAAA记录存在，将进行IPv6变化检测，酌情修改AAAA记录`);

            try {

                const ip = await simpleIP(true);

                if (RRID.v6.value === ip) {

                    console.log(`您的IPv6地址为：${ip}，没有发生变化，不需要修改解析记录`);

                } else {

                    console.log(`您的IPv6地址为：${ip}，发生了变化，准备修改解析记录`);

                    const result = await UpdateDomainRecord(RRID.v6.rid, setting.resourceRecord, 'AAAA', ip, setting.TTL);

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

            console.log(`解析 '${setting.resourceRecord}' AAAA记录不存在，将进行IPv6地址嗅探，并添加AAAA记录`);

            try {

                const ip = await simpleIP(true);

                console.log(`您的IPv6地址为：${ip}，将添加解析记录`);

                const result = await AddDomainRecord(setting.domainName, setting.resourceRecord, 'AAAA', ip, setting.TTL);

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

})();