import { DDNSSetting, DDNSSettingGlobal, DDNSSettingService } from "./interface";
import { logger } from "./utils/logger";
import { ip } from "./services/ip";
import { AliyunService } from "./services/aliyun/service";

interface IPAddress {
    v4: string | null
    v6: string | null
}

export class DDNSV2 {

    readonly globalRRSetting: DDNSSettingGlobal;
    readonly services: DDNSSettingService[] = [];

    private ip: IPAddress = {
        v4: null,
        v6: null
    };

    constructor(
        private settings: DDNSSetting
    ) {
        logger.debug('生成DDNSV2对象');
        this.globalRRSetting = settings.global;
        logger.debug('识别到全局设置为：');
        logger.debug(this.globalRRSetting);
        this.services.push(...settings.services);
        this.iterateSettings();
    }

    static async run(settings: DDNSSetting): Promise<void> {
        const ddns = new DDNSV2(settings);
        await ddns.getIP();
        await ddns.registerServices();
    }

    /**
     * 
     */
    async registerServices(): Promise<void> {
        for (const service of this.services) {
            logger.info(`处理${service.name}服务`);
            switch (service.name) {
                case 'aliyun': {
                    await AliyunService.run(service, this.globalRRSetting, this.ip);
                    break;
                }
                default:
                    logger.warn(`不存在这个名称的服务：${service.name}`);
                    break;
            }
        }
        return Promise.resolve();
    }

    iterateSettings(): void {

        logger.debug('遍历设置');

        const [serviceCount, domainCount, RRCount] =
            this.services.reduce(([serviceCount, domainCount, RRCount], service, index) => {

                logger.debug(`第${index + 1}个服务 类型：${service.name}`);

                const [addDomainCount, addRRCount] =
                    service.domains.reduce(([domainCount, RRCount], domain, index) => {

                        logger.debug(`\t第${index + 1}个域名：${domain.domainName}`);

                        const addRRCount = domain.resourceRecords.reduce((RRCount, RR, index) => {

                            logger.debug(`\t\t第${index + 1}个记录：${RR.resourceRecord}`);

                            return RRCount + 1;

                        }, 0);

                        return [domainCount + 1, RRCount + addRRCount];

                    }, [0, 0]);

                return [serviceCount + 1, domainCount + addDomainCount, RRCount + addRRCount];

            }, [0, 0, 0]);

        logger.info(`共有${serviceCount}个服务、${domainCount}个域名、${RRCount}个记录可能被改变。`);
    }

    async getIP(): Promise<void> {
        logger.info('开始获取公网IP地址');
        const result4 = await ip(4);
        if (result4) {
            this.ip.v4 = result4;
            logger.info(`本机公网IPv4地址为：${result4}`);
        } else {
            logger.warn('没有获取到公网IPv4地址');
        }
        const result6 = await ip(6);
        if (result6) {
            this.ip.v6 = result6;
            logger.info(`本机公网IPv6地址为：[${result6}]`);
        } else {
            logger.warn('没有获取到公网IPv6地址');
        }
        if (result4 === null && result6 === null) {
            logger.warn('没有获取到任何IPv4和IPv6地址，程序退出');
            process.exit();
        }
    }

}