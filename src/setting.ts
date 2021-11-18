import { readFileSync } from "fs";
import { join } from "path";
import { DDNSSetting } from "./interface";
import { validateV1, validateV2 } from "./services/settings-validate";
import { logger } from "./utils/logger";


interface Setting {
    version: 2
    setting: DDNSSetting
}

export function setting(): Setting {

    const settingPath = join(__dirname, '../settings.json');
    logger.debug(`配置文件路径：${settingPath}`);

    let settingObj: DDNSSetting;

    try {

        settingObj = JSON.parse(readFileSync(settingPath, 'utf-8'));

    } catch (error) {

        logger.error(`配置文件解析错误`);
        process.exit(1);

    }

    if (typeof settingObj !== 'object') {

        logger.error(`配置文件不合规范`);
        process.exit(1);

    }

    if (settingObj && settingObj.version && settingObj.version === 2) {

        logger.info('使用V2版本配置');
        logger.debug(settingObj);

        const v = validateV2();

        const valid = v(settingObj);

        if (!valid) {

            if (v.errors) {

                logger.error(`配置文件有${v.errors.length}个错误`);

                v.errors.forEach(v => logger.error(v));

            } else {

                logger.error('未知错误');

            }

            process.exit(1);

        }

        return {
            version: 2,
            setting: settingObj
        };
    } else {
        logger.error('不再支持v1版本配置和运行方式，请迁移到v2版本的配置和运行方式！')
        throw Error('不再支持v1版本配置和运行方式，请迁移到v2版本的配置和运行方式！')
    }

}

