import { get } from "http";
import Axios from 'axios';
import { logger } from "../utils/logger";

interface TestIPv6Response {
    ip: string
    type: 'ipv4' | 'ipv6'
}

const headers = {
    'Referer': 'http://test-ipv6.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
};

export function simpleIP(v6 = false): Promise<string> {

    return new Promise<string>((resolve, reject) => {

        const req = get(`http://v${v6 ? 6 : 4}.ip.zxinc.org/getip`, {
            timeout: 6000,
            headers: headers
        }, (res) => {

            logger.log(res.statusCode);

            if (res.statusCode === 200) {

                const bufs: Buffer[] = [];

                res.once('error', err => reject(err));

                res.on('data', (chunk: Buffer) => {
                    bufs.push(chunk);
                });

                res.once('end', () => {
                    const buf = Buffer.concat(bufs);
                    const str = buf.toString('utf8');
                    // const json: TestIPv6Response = JSON.parse(str);
                    resolve(str);
                });

            } else {

                reject(res.statusMessage);

            }

        });

        req.once('error', err => reject(err));

        req.end();

    });

}

export async function IP(v6 = false): Promise<string | null> {
    try {
        const url = `http://ipv${v6 ? 6 : 4}.lookup.test-ipv6.com/ip/`;
        const res = await Axios.get<TestIPv6Response>(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 Edg/84.0.522.63'
            }
        });
        if (res.status === 200) {
            if (res.data && res.data.ip) {
                return res.data.ip;
            }
        }
    } catch (error) {
        console.error(error);
    }
    return null;

}