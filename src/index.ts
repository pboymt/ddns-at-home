import { setting as s } from "./setting";
import { help } from "./utils/help";
// import { DDNSV1 } from "./v1";
import { DDNSV2 } from "./v2";
import timexe from 'timexe';
import { logger } from "./utils/logger";

help();

const setting = s();

// if (setting.version === 1) {

//     void new DDNSV1(setting.setting).run();

// } else {

void (async () => {

    if (setting.setting.schedule) {

        logger.info('使用计划任务功能');

        if (setting.setting.schedule.immediate) {

            logger.info('立即执行一次');

            await DDNSV2.run(setting.setting);

        }

        const result = timexe(
            `* * * ${setting.setting.schedule.hour ?? '*'} ${setting.setting.schedule.minute ?? '/5'}`,
            async () => {

                logger.info('执行计划任务');

                await DDNSV2.run(setting.setting);

                logger.info('计划任务执行完毕');

            }
        );

        if (result.result === 'ok') {

            logger.info('计划任务配置成功');

        } else {

            logger.error('计划任务配置失败');
            logger.error(result.error);

            timexe.remove(result.id);

            process.exit();

        }

    } else {

        await DDNSV2.run(setting.setting);

    }

})();

// }