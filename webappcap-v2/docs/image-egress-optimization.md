# Image bandwidth maintenance

## Changes

- Native template images use Next image optimization through `getImageProps`, retaining the original img markup, CSS, crop, zoom, animations, dimensions and event handlers.
- Only public JPG/PNG/WebP URLs from the configured Supabase origin are eligible. Signed URLs, tokens, foreign hosts, local placeholders, SVG and GIF stay unchanged.
- Responsive cards request smaller variants; hero and lightbox retain larger variants. No paid Supabase Image Transformations are used.
- Next image cache has a 24-hour minimum TTL; newly uploaded files have unique UUID paths and one-year source cache headers. Original source URLs remain in drafts and published snapshots, so switching models remains safe.
- Modern no longer manually preloads original hero/highlight files before their optimized variants. The hero stays eager/high priority, other images default to lazy loading.
- Bakery detail images mount only when their product is expanded.
- Both browser and server uploads attempt WebP at quality 88, up to 2400 px, without enlargement. Smaller originals remain unchanged. Alpha and proportions are preserved; GIF, APNG and animated WebP are not flattened.
- Sharp is an explicit server dependency. No files, projects or historical orders are deleted or rewritten.

## Usage diagnosis still needs Supabase access

No authorized Supabase log connection is available in this workspace. Use Supabase Logs Explorer, query source Logs, selected billing time range, and this query from the Storage bandwidth documentation (not the database SQL Editor):

```sql
select
  log_attributes['request.path'] as filepath,
  (log_attributes['response.headers.cf_cache_status'] = 'HIT') as cached,
  count() as num_requests
from logs
where source = 'edge_logs'
  and log_attributes['request.method'] = 'GET'
  and (
    log_attributes['request.path'] like '%storage/v1/object/%'
    or log_attributes['request.path'] like '%storage/v1/render/%'
  )
group by filepath, cached
order by num_requests desc
limit 100;
```

Source: https://supabase.com/docs/guides/storage/serving/bandwidth

Multiply each object's byte size by its download count to estimate bytes by object. Request count alone is not a byte ranking. Confirm retention covers the selected period and compare equal-length periods after deployment. Cached and uncached origin usage should both be monitored, as well as Vercel Image Optimization, transfer and cache usage; this moves work to Vercel rather than eliminating hosting consumption. Separate tenant hostnames can warm separate caches. No numerical reduction on live traffic is promised without these measurements.

## Manual checks

1. Public Vet-se: hero, every category, highlights, zoom and cart; check image framing and legibility on desktop and mobile.
2. Trainer: portrait and before/after images; Institutional: hero, members, projects and album; Bakery: expand/close products, zoom and carousel; root featured cards and Portfolio hero.
3. Network: an eligible image requests same-origin `/_next/image`, `srcset` selects an appropriate size; opening zoom may request a larger variant. Static local/foreign placeholders still work.
4. Upload JPG and transparent PNG below 3 MB, high-resolution image, animated GIF/APNG/WebP; save draft, preview, publish, reopen editor and switch templates. Check transparency, orientation and animation. Files keep immutable original URLs in saved data.
5. Existing photos do not need reuploading to benefit from optimized delivery; upload compression applies to new uploads only.

## Validation

Local lint, typecheck, unit tests and production build; upload tests exercise dimensions, alpha, animation preservation, origin isolation and compression. Local HTTP test exercises real Next image resizing and cache with generated fixture data, without querying Supabase or mutating customer data. Synthetic image measurements are not a production bandwidth prediction.

Verified: lint and typecheck passed, 78 tests passed, production build passed. Synthetic HTTP fixture: 4,328,628-byte PNG became a 640 × 360 WebP of 111,844 bytes; second request was a cache HIT with max-age=86400. DOM checks preserved native styles and events.

Dependency audit: production has zero reported vulnerabilities. The full audit reports five affected development packages in the existing ESLint/braces chain (GHSA-vfj7-8cjw-p6xm); no patched braces version was available in the consulted registry. No unrelated ESLint downgrade was applied.
