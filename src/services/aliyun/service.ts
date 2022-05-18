import { logger } from "../../utils/logger";
import { DDNSSettingService, DDNSSettingGlobal, DDNSSettingDomain, IPAddress } from "../../interface";
import { DNSClient, DomainClient } from "./clients";
import Core from '@alicloud/pop-core';
import { DescribeDomains, DomainType, DescribeDomainRecords, RecordType, AddDomainRecord, UpdateDomainRecord } from "./response";


export class AliyunService {

    dnsClient: Core = DNSClient(
        this.serviceSetting.apiKey,
        this.serviceSetting.apiSecret
    );

    domainClient: Core = DomainClient(
        this.serviceSetting.apiKey,
        this.serviceSetting.apiSecret
    );

    constructor(
        private serviceSetting: DDNSSettingService,
        private globalSetting: DDNSSettingGlobal,
        private ip: IPAddress
    ) {
        logger.debug('Build AliyunService');
    }

    static async run(
        serviceSetting: DDNSSettingService,
        globalSetting: DDNSSettingGlobal,
        ip: IPAddress
    ): Promise<void> {
        const service = new AliyunService(serviceSetting, globalSetting, ip);
        await service.iterateDomains();
    }

    async iterateDomains(): Promise<void> {

        const domain_list = await this.describeDomains();

        for (const domain of this.serviceSetting.domains) {

            logger.info(`处理域名[${domain.domainName}]解析记录`);

            logger.debug(`查询域名[${domain.domainName}]是否已存在于列表`);

            const existed_domain = domain_list.find(d => d.DomainName === domain.domainName);

            // 如果域名不存在，进入添加域名流程

            if (!existed_domain) {

                try {

                    logger.info(`域名[${domain.domainName}]不存在于DNS列表，尝试添加域名`);

                    await this.addDomain(domain.domainName);

                    logger.info(`域名[${domain.domainName}]添加成功`);

                } catch (error) {

                    logger.warn('添加域名失败');

                    logger.warn(error);

                    logger.warn('跳过这个域名的配置流程');

                    continue;

                }

            }

            // 继续添加/更新记录

            await this.iterateRecords(domain);

        }

    }

    async iterateRecords(domain: DDNSSettingDomain): Promise<void> {

        const record_list = await this.describeDomainRecords(domain.domainName);

        for (const record of domain.resourceRecords) {

            const record_setting = Object.assign({}, this.globalSetting, record);

            if (!record_setting.disableIPv4 && this.ip.v4 !== null) {

                logger.debug(`查询A记录[${record_setting.resourceRecord}]是否已存在于域名[${domain.domainName}]的记录列表`);

                const existed_record = record_list.find(r => r.RR === record.resourceRecord && r.Type === 'A');

                try {

                    if (existed_record) {

                        if (existed_record.Value === this.ip.v4) {

                            logger.info(`A记录[${record_setting.resourceRecord}]无需更新，IP地址未发生变化`);

                        } else {

                            logger.info(`A记录[${record_setting.resourceRecord}]已存在，更新解析记录`);

                            await this.updateDomainRecord(
                                existed_record.RecordId,
                                record_setting.resourceRecord,
                                'A',
                                this.ip.v4,
                                record_setting.TTL
                            );

                            logger.info(`A记录[${record_setting.resourceRecord}]更新成功`);

                        }

                    } else {

                        logger.info(`A记录[${record_setting.resourceRecord}]不存在，添加解析记录`);

                        await this.addDomainRecord(
                            domain.domainName,
                            record_setting.resourceRecord,
                            'A',
                            this.ip.v4,
                            record_setting.TTL
                        );

                        logger.info(`A记录[${record_setting.resourceRecord}]添加成功`);

                    }

                } catch (error) {

                    logger.info(`A记录[${record_setting.resourceRecord}]添加/更新失败`);

                    logger.warn(error);

                }

            }

            if (!record_setting.disableIPv6 && this.ip.v6 !== null) {

                logger.debug(`查询AAAA记录[${record_setting.resourceRecord}]是否已存在于域名[${domain.domainName}]的记录列表`);

                const existed_record = record_list.find(r => r.RR === record.resourceRecord && r.Type === 'AAAA');

                try {

                    if (existed_record) {

                        if (existed_record.Value === this.ip.v6) {

                            logger.info(`AAAA记录[${record_setting.resourceRecord}]无需更新，IP地址未发生变化`);

                        } else {

                            logger.info(`AAAA记录[${record_setting.resourceRecord}]已存在，更新解析记录`);

                            await this.updateDomainRecord(
                                existed_record.RecordId,
                                record_setting.resourceRecord,
                                'AAAA',
                                this.ip.v6,
                                record_setting.TTL
                            );

                            logger.info(`AAAA记录[${record_setting.resourceRecord}]更新成功`);

                        }

                    } else {

                        logger.info(`AAAA记录[${record_setting.resourceRecord}]不存在，添加解析记录`);

                        await this.addDomainRecord(
                            domain.domainName,
                            record_setting.resourceRecord,
                            'AAAA',
                            this.ip.v6,
                            record_setting.TTL
                        );

                        logger.info(`AAAA记录[${record_setting.resourceRecord}]添加成功`);

                    }

                } catch (error) {

                    logger.info(`AAAA记录[${record_setting.resourceRecord}]添加/更新失败`);

                    logger.warn(error);

                }

            }

        }

    }

    /**
     * 获取账户内已包含域名列表
     */
    async describeDomains(): Promise<DomainType[]> {

        logger.info('获取账户内已包含域名列表');

        const params = {};

        const requestOption = {
            method: 'POST'
        };

        const result = await this.dnsClient.request<DescribeDomains>('DescribeDomains', params, requestOption);

        if (result.Domains.Domain.length) {

            logger.debug(result);

        } else {

            logger.warn('域名列表为空');

        }

        return result.Domains.Domain;

    }

    /**
     * 根据传入参数添加域名
     */
    async addDomain(domainName: string): Promise<void> {

        logger.debug(`添加域名[${domainName}]`);

        const params = {
            'DomainName': domainName
        };

        const requestOption = {
            method: 'POST'
        };

        await this.dnsClient.request('AddDomain', params, requestOption);


    }

    /**
     * 获取指定domain name的record list
     */
    async describeDomainRecords(domainName: string): Promise<RecordType[]> {

        logger.info(`获取域名[${domainName}]记录列表`);

        const params = {
            "DomainName": domainName
        };

        const requestOption = {
            method: 'POST'
        };

        const result: DescribeDomainRecords = await this.dnsClient.request('DescribeDomainRecords', params, requestOption);

        if (result.DomainRecords.Record.length) {

            logger.debug(result);

        } else {

            logger.warn('记录列表为空');

        }

        return result.DomainRecords.Record;

    }

    async addDomainRecord(DomainName: string, RR: string, Type: 'A' | 'AAAA', Value: string, TTL: number): Promise<void> {

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

        await this.dnsClient.request<AddDomainRecord>('AddDomainRecord', params, requestOption);

    }

    async updateDomainRecord(RecordId: string, RR: string, Type: 'A' | 'AAAA', Value: string, TTL: number): Promise<void> {

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

        await this.dnsClient.request<UpdateDomainRecord>('UpdateDomainRecord', params, requestOption);

    }



}