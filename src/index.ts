import { readFileSync } from "fs";
import { join } from "path";
import { validateV1, validateV2 } from "./services/settings-validate";
import { help } from "./utils/help";
import { logger } from "./utils/logger";
import { DDNSV1 } from "./v1";
import { DDNSV2 } from "./v2";
import { DDNSSettingV2, DDNSSettingV1 } from "./interface";

help();

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

    void DDNSV2.run(settingObj as DDNSSettingV2);

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

    void new DDNSV1(settingObj as DDNSSettingV1).run();
}
