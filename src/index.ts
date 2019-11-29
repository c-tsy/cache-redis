import * as Redis from 'ioredis'
var links: { [index: string]: any } = {};
export default class CacheRedis {
    ins: any;
    key: string = ""
    async start(opt: any) {
        let key = {
            port: opt.port || 6379, // Redis port
            host: opt.host || "127.0.0.1", // Redis host
            family: opt.family || 4, // 4 (IPv4) or 6 (IPv6)
            password: opt.password || "auth",
            db: opt.db || 0
        }
        this.key = [key.password, key.port, key.password, key.db, key.host].join('');
        if (links[this.key]) { return links[this.key] }
        return links[this.key] = this.ins = new Redis(key)
    }
    async get(key: string, dv: any) {
        let rs = await this.ins.get(key);
        if ('string' == typeof rs) {
            switch (rs.substr(0, 2)) {
                case '0|':
                    return Number(rs.substr(2))
                case '1|':
                    return rs.substr(2, 1) == '1'
                    break;
                case '2|':
                    try {
                        return JSON.parse(rs.substr(2))
                    } catch (error) {

                    }
                    break;
            }
        }
        return rs || dv
    }
    async set(key: string, val: any, exp: number = 0) {
        let ov = val;
        if ('string' != typeof val) {
            if ('number' == typeof val) {
                ov = "0|" + val;
            } else if ('boolean' == typeof val) {
                ov = "1|" + val ? '1' : '0'
            } else {
                ov = "2|" + JSON.stringify(val);
            }
        }
        if (exp) {
            return await this.ins.set(key, ov, 'EX', exp);
        }
        return await this.ins.set(key, ov);
    }
    async del(key: string) {
        return await this.ins.del(key);
    }

}