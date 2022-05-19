import { DDNSSettingDomain, DDNSSettingGlobal, DDNSSettingService, IPAddress } from "../../interface";
import { logger } from "../../utils/logger";
import Cloudflare from "cloudflare";
import { CFAPIListDNSRecords, CFAPIListZones, CFAPIUpdateDNSRecord, CFDNSRecordOfZone, CFZone } from "./response";

export class CloudflareService {

    client: Cloudflare = new Cloudflare({
        token: this.serviceSetting.apiSecret
    });

    constructor(
        private serviceSetting: DDNSSettingService,
        private globalSetting: DDNSSettingGlobal,
        private ip: IPAddress
    ) {
        logger.debug('Build CloudflareService');
    }

    static async run(
        serviceSetting: DDNSSettingService,
        globalSetting: DDNSSettingGlobal,
        ip: IPAddress
    ): Promise<void> {
        const service = new CloudflareService(serviceSetting, globalSetting, ip);
        await service.iterateZones();
    }

    async iterateZones(): Promise<void> {

        const domain_list = await this.listZones();

        for (const domain of this.serviceSetting.domains) {

            logger.info(`处理域名[${domain.domainName}]解析记录`);

            logger.debug(`查询域名[${domain.domainName}]是否已存在于列表`);

            const existed_domain = domain_list.find(d => d.name === domain.domainName);

            // 如果域名不存在，进入添加域名流程

            if (!existed_domain) {

                // 暂不支持在 Cloudflare 中添加 Zone
                logger.info(`域名[${domain.domainName}]不存在于Zone列表，暂不支持自动在Cloudflare中设置Zone，请自行添加域名到Cloudflare`);

                logger.warn('跳过这个域名的配置流程');

                continue;

            }

            // 继续添加/更新记录

            await this.iterateRecords(domain, existed_domain);

        }

    }

    async iterateRecords(domain: DDNSSettingDomain, zone: CFZone): Promise<void> {

        const record_list = await this.listDNSRecords(zone.id, domain.domainName);

        for (const record of domain.resourceRecords) {

            const record_setting = Object.assign({}, this.globalSetting, record);

            if (!record_setting.disableIPv4 && this.ip.v4 !== null) {

                logger.debug(`查询A记录[${record_setting.resourceRecord}]是否已存在于域名[${domain.domainName}]的记录列表`);

                const existed_record = record_list.find(r =>
                    r.name.replace(RegExp(`\\.${r.zone_name}$`), '') === record.resourceRecord
                    && r.type === 'A'
                );

                try {

                    if (existed_record) {

                        if (existed_record.content === this.ip.v4) {

                            logger.info(`A记录[${record_setting.resourceRecord}]无需更新，IP地址未发生变化`);

                        } else {

                            logger.info(`A记录[${record_setting.resourceRecord}]已存在，更新解析记录`);

                            await this.updateDNSRecord(
                                zone.id,
                                existed_record.id,
                                existed_record.name,
                                'A',
                                this.ip.v4,
                                record_setting.TTL
                            );

                            logger.info(`A记录[${record_setting.resourceRecord}]更新成功`);

                        }

                    } else {

                        logger.info(`A记录[${record_setting.resourceRecord}]不存在，添加解析记录`);

                        const name = ['', '@'].includes(record_setting.resourceRecord) ?
                            domain.domainName : `${record_setting.resourceRecord}.${domain.domainName}`;

                        await this.addDomainRecord(
                            zone.id,
                            name,
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

                const existed_record = record_list.find(r =>
                    r.name.replace(RegExp(`\\.${r.zone_name}$`), '') === record.resourceRecord
                    && r.type === 'AAAA'
                );

                try {

                    if (existed_record) {

                        if (existed_record.content === this.ip.v6) {

                            logger.info(`AAAA记录[${record_setting.resourceRecord}]无需更新，IP地址未发生变化`);

                        } else {

                            logger.info(`AAAA记录[${record_setting.resourceRecord}]已存在，更新解析记录`);

                            await this.updateDNSRecord(
                                zone.id,
                                existed_record.id,
                                existed_record.name,
                                'AAAA',
                                this.ip.v6,
                                record_setting.TTL
                            );

                            logger.info(`AAAA记录[${record_setting.resourceRecord}]更新成功`);

                        }

                    } else {

                        logger.info(`AAAA记录[${record_setting.resourceRecord}]不存在，添加解析记录`);

                        const name = ['', '@'].includes(record_setting.resourceRecord) ?
                            domain.domainName : `${record_setting.resourceRecord}.${domain.domainName}`;

                        await this.addDomainRecord(
                            zone.id,
                            name,
                            'AAAA',
                            this.ip.v6,
                            record_setting.TTL
                        );

                        logger.info(`AAAA记录[${record_setting.resourceRecord}]添加成功`);

                    }

                } catch (error) {

                    logger.info(`AAAA记录[${record_setting.resourceRecord}]添加/更新失败`);

                    logger.warn(String(error));

                }

            }

        }

    }

    /**
     * 获取账户内已包含域名列表
     */
    async listZones(): Promise<CFZone[]> {

        logger.info('获取账户内已包含域名列表');

        const res = await this.client.zones.browse() as CFAPIListZones;

        if (res.result.length > 0) {

            logger.debug(res.result);

        } else {

            logger.warn('域名列表为空');

        }

        return res.result;

    }

    /**
     * 获取指定domain name的record list
     */
    async listDNSRecords(zone_id: string, domain_name: string): Promise<CFDNSRecordOfZone[]> {

        logger.info(`获取域名[${domain_name}]记录列表`);

        const res = await this.client.dnsRecords.browse(zone_id) as CFAPIListDNSRecords;

        if (res.result.length > 0) {

            logger.debug(res.result);

        } else {

            logger.warn('记录列表为空');

        }

        return res.result;

    }

    async addDomainRecord(zone_id: string, name: string, type: 'A' | 'AAAA', content: string, ttl = 60): Promise<void> {

        const res = await this.client.dnsRecords.add(zone_id, { type, name, content, proxied: false, ttl }) as CFAPIUpdateDNSRecord;

        if (!res.success) {

            logger.warn(res.messages);

        }

    }

    async updateDNSRecord(zone_id: string, id: string, name: string, type: 'A' | 'AAAA', content: string, ttl = 60): Promise<void> {

        const res = await this.client.dnsRecords.edit(zone_id, id, { type, name, content, proxied: false, ttl }) as CFAPIUpdateDNSRecord;

        if (!res.success) {

            logger.warn(res.messages);

        }

    }


}