import Axios from "axios";
import { logger } from "../utils/logger";

interface TestIPResponse {
    ip: string
    type: 'ipv4' | 'ipv6'
    subtype: string
    via: string
    padding: string
    asn: string
    asnlist: string
    asn_name: string
    country: string
    protocol: string
}

export async function ip(family: 4 | 6 = 4): Promise<string | null> {
    logger.info(`正在获取IPv${family}地址...`);
    try {
        const url = `http://ipv${family}.lookup.test-ipv6.com/ip/`;
        logger.debug(`使用URL：${url}`);
        const res = await Axios.get<TestIPResponse>(url);
        if (res.status === 200 && res.data) {
            if (res.data.ip && res.data.ip.length > 0) {
                return res.data.ip;
            }
        }
        return null;
    } catch (error) {
        logger.error(error);
        return null;
    }
}
