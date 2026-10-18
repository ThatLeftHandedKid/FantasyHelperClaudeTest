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

## Player list (autocomplete)
The Players tab suggests names from `players.json`, which a GitHub Action rebuilds daily from Sleeper's free player list.
1. In the repo, Add file > Create new file, name it `.github/workflows/update-players.yml` (typing the slashes makes the folders) and paste in the workflow file.
2. Go to the Actions tab, open "Update players", and press Run workflow. After about a minute, `players.json` appears in the repo root.
3. Refresh the site, then use Refresh player list on the Players tab.

## Projections
The same workflow also writes `projections.json` (this week's Sleeper projections). On the Players tab, press Update projections from Sleeper to add them to your players as the "Sleeper" source, in your league's scoring (standard, half, or full PPR). Run the workflow manually from the Actions tab for fresher numbers mid-week.

## Notes
- Projections are treated as points in your league's scoring. The scoring setting is stored now so the source adapters can convert raw stats later.
- Data lives in one browser. Clearing site data clears your leagues.
