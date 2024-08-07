import client from "../config/redis";

export function getRedis(key: string) {
    return Promise.race([
        client.get(key),
        new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error("Redis timeout")), 200);
        }),
    ]);
}

export function setRedis(key : string, data: Object) {
   client.set(key, JSON.stringify(data));
}

export function setRedis1H(key: string, data: Object, ttl = 3600) {
    client.set(key, JSON.stringify(data), "EX", ttl);
}

export function setRedis1D(key: string, data: Object, ttl = 86400) {
    client.set(key, JSON.stringify(data), "EX", ttl);
}

export function setRedis1W(key: string, data: Object, ttl = 604800) {
    client.set(key, JSON.stringify(data), "EX", ttl);
}

export function msetRedis1D(pairs: { key: string, data: Object }[], ttl = 86400) {
    const multi = client.multi();
    
    pairs.forEach(({ key, data }) => {
        multi.set(key, JSON.stringify(data), 'EX', ttl);
    });

    multi.exec();
}

export function delRedis(key: string) {
    client.del(key);
}


