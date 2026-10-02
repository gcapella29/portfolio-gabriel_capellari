export function createWindowRateLimiter(limit:number,windowMs=60_000,maxKeys=10_000){
 const buckets=new Map<string,{count:number;reset:number}>();
 let cleanupAt=0;
 return (key:string,now=Date.now())=>{
  const current=buckets.get(key);
  if(current&&current.reset>now){if(current.count>=limit)return true;current.count+=1;return false}
  buckets.delete(key);
  if(buckets.size>=maxKeys){
   // Once full, scan again only when an existing window can expire.
   if(now>=cleanupAt){
    cleanupAt=Infinity;
    for(const [storedKey,bucket] of buckets){
     if(bucket.reset<=now)buckets.delete(storedKey);
     else cleanupAt=Math.min(cleanupAt,bucket.reset);
    }
   }
   // Fail closed at capacity so new keys cannot evict existing limits.
   if(buckets.size>=maxKeys)return true;
  }
  buckets.set(key,{count:1,reset:now+windowMs});cleanupAt=Math.min(cleanupAt,now+windowMs);return false;
 };
}
