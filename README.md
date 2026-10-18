# Fantasy Hub

Personal fantasy football helper. Stage 1 runs entirely in the browser with no build step.

## Deploy on GitHub Pages
1. Create a repo and add `index.html` at the root.
2. Settings > Pages > Deploy from branch > `main` / root.
3. Open `https://<your-username>.github.io/<repo>/`.

## What works now
- Multiple leagues (switcher in the header), each with its own roster slots and scoring
- Manual player entry with projections from several sources, e.g. `ESPN:14.2, Sleeper:12.8`
- Consensus engine: weighted blend across sources, drops outliers (3+ sources), flags players when sources disagree
- Start/sit lineup optimizer with FLEX handling and a bench list
- Trade calculator (uses your trade value, or blended projection x 10 if none is entered)
- Everything saves in your browser's local storage

## Also built
- ESPN sync through a Cloudflare Worker (see `worker/README.md`), plus FantasyCalc trade values
- Waiver pickups: free agents ranked by how much they raise your projected lineup
- Trade finder: 1-for-1 and 2-for-1 deals within 15% in value that improve your lineup
- Accuracy tracking: save weekly results, see each source's average error, apply suggested weights

## Notes
- Projections are treated as points in your league's scoring. The scoring setting is stored now so the source adapters can convert raw stats later.
- Data lives in one browser. Clearing site data clears your leagues.
