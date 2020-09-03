import { readFileSync } from "fs";
import { join } from "path";
import { DDNSSettingV1, DDNSSettingV2 } from "./interface";
import { validateV1, validateV2 } from "./services/settings-validate";
import { logger } from "./utils/logger";

interface SettingV1 {
    version: 1
    setting: DDNSSettingV1
}

interface SettingV2 {
    version: 2
    setting: DDNSSettingV2
}

export type Setting = SettingV1 | SettingV2;

export function setting(): Setting {

    const settingPath = join(__dirname, '../settings.json');
    logger.debug(`配置文件路径：${settingPath}`);

    let settingObj: unknown;

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

    if (settingObj && (settingObj as DDNSSettingV2).version && (settingObj as DDNSSettingV2).version === 2) {

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

        // await DDNSV2.run(settingObj as DDNSSettingV2);
        return {
            version: 2,
            setting: settingObj as DDNSSettingV2
        };

    } else {

        logger.info('使用v1版本配置');
        logger.log(settingObj);

        const v = validateV1();

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

        // await new DDNSV1(settingObj as DDNSSettingV1).run();
        return {
            version: 1,
            setting: settingObj as DDNSSettingV1
        };

    }

}

