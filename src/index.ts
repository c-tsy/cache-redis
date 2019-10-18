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
        return links[this.key] = this.ins = new Redis(key);
    }
    async get(key: string, dv: any) {
        return await this.ins.get(key) || dv;
    }
    async set(key: string, val: any, exp: number = 0) {
        if (exp) {
            return await this.ins.set(key, val, 'EX', exp);
        }
        return await this.ins.set(key, val);
    }
    async del(key: string) {
        return await this.ins.del(key);
    }

}