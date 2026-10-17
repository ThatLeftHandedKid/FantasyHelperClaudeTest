# ESPN proxy (Cloudflare Worker)

## Deploy
1. `npm i -g wrangler` then `wrangler login` (free Cloudflare account)
2. In `wrangler.toml`, set `ALLOWED_ORIGIN` to your GitHub Pages origin, e.g. `https://nathan.github.io`
3. Private league only: get your cookies. Log in to ESPN Fantasy in Chrome, open DevTools > Application > Cookies > espn.com, copy `espn_s2` and `SWID` (SWID keeps its curly braces).
4. `wrangler secret put ESPN_S2` and `wrangler secret put ESPN_SWID`, pasting each value when asked
5. `wrangler deploy`, then copy the `https://...workers.dev` URL it prints

Cookies expire now and then. If sync starts failing on the private league, repeat steps 3-4.
The secrets also get sent for public leagues, which ESPN accepts.

## In the site
Settings > ESPN sync: paste the Worker URL and league ID, press Sync from ESPN, pick your team.

## Caveats
ESPN's API is unofficial and can change. Projections come from the roster view; if they come back empty, tell me and I will switch to ESPN's player-info view.
FantasyCalc's values endpoint is also unofficial.
