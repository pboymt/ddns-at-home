import { get } from "http";

interface TestIPv6Response {
    ip: string;
    type: 'ipv4' | 'ipv6';
}

const headers = {
    'Referer': 'http://test-ipv6.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
}

export function IP(v6 = false) {

    return new Promise<string>((resolve, reject) => {

        const req = get(`http://ipv${v6 ? 6 : 4}.lookup.test-ipv6.com/ip/`, {
            timeout: 6000,
            headers: headers
        }, (res) => {

            console.log(res.statusCode);

            if (res.statusCode === 200) {

                const bufs: Buffer[] = [];

                res.once('error', err => reject(err));

                res.on('data', (chunk: Buffer) => {
                    bufs.push(chunk);
                });

                res.once('end', () => {
                    const buf = Buffer.concat(bufs);
                    const str = buf.toString('utf8');
                    const json: TestIPv6Response = JSON.parse(str);
                    resolve(json.ip);
                });

            } else {

                reject(res.statusMessage);

            }

        });

        req.once('error', err => reject(err));

        req.end();

    });

}