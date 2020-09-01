import { logger } from "./logger";

export function help(): void {
    const str = `使用提示：
如果您使用了一层及以上的家庭路由（包括光猫），请依次设置每台路由器的DMZ主机直到能通过外网访问使用本DDNS脚本的机器。
本提示一般只适用于具有公网IPv4地址并且需要设置IPv4记录的用户，IPv6地址在一层路由环境下无需DMZ主机配置。`;
    // .reduce<string[]>((pre_str, old_str) => {

    //     if (old_str.length <= 22) {

    //         pre_str.push(old_str);

    //     } else {

    //         for (let i = 0; i < old_str.length; i += 22) {
    //             pre_str.push(old_str.substr(i, 22));
    //         }

    //     }
    //     return pre_str;
    // }, [])

    str.split('\n').forEach(val => logger.info(val));

}