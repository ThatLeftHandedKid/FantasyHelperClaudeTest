// Proxy between the Fantasy Hub site and ESPN / FantasyCalc.
// ESPN cookies live in Worker secrets (ESPN_S2, ESPN_SWID) and never reach the browser.
const POS = { 1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE', 5: 'K', 16: 'DEF' };
const SLOT = { 0: 'QB', 2: 'RB', 4: 'WR', 6: 'TE', 23: 'FLEX' };
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, Vary: 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: { ...cors, 'Access-Control-Allow-Methods': 'GET' } });
    // Only your site may call this, so nobody else can use your ESPN cookies through it.
    if (req.headers.get('Origin') !== env.ALLOWED_ORIGIN) return new Response('Origin not allowed', { status: 403 });
    const u = new URL(req.url), q = u.searchParams;
    try {
      if (u.pathname === '/league') return json(await league(q, env), cors);
      if (u.pathname === '/values') return json(await values(q), cors);
      return new Response('Not found', { status: 404, headers: cors });
    } catch (e) {
      return new Response(String(e.message || e), { status: 502, headers: cors });
    }
  },
};

const json = (o, cors) => new Response(JSON.stringify(o), { headers: { ...cors, 'Content-Type': 'application/json' } });

async function league(q, env) {
  const id = q.get('id'), yr = +(q.get('year') || new Date().getFullYear());
  if (!/^\d+$/.test(id || '')) throw new Error('League ID must be a number.');
  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${yr}/segments/0/leagues/${id}?view=mSettings&view=mRoster&view=mTeam`;
  const headers = {};
  if (env.ESPN_S2 && env.ESPN_SWID) headers.Cookie = `espn_s2=${env.ESPN_S2}; SWID=${env.ESPN_SWID}`;
  const r = await fetch(url, { headers });
  if (r.status === 401 || r.status === 403) throw new Error('ESPN refused access. For a private league, check the cookie secrets.');
  if (!r.ok) throw new Error('ESPN error ' + r.status);
  const d = await r.json();
  const counts = d.settings.rosterSettings.lineupSlotCounts || {};
  const slots = {};
  for (const [k, n] of Object.entries(SLOT)) slots[n] = counts[k] || 0;
  const rec = (d.settings.scoringSettings.scoringItems || []).find(i => i.statId === 53); // points per reception
  return {
    name: d.settings.name,
    ppr: rec ? rec.points : 0,
    slots,
    teams: d.teams.map(t => ({
      id: t.id,
      name: t.name || `${t.location} ${t.nickname}`,
      players: ((t.roster && t.roster.entries) || []).map(e => {
        const p = e.playerPoolEntry.player;
        // Weekly projection for the current scoring period (statSourceId 1 = projected, statSplitTypeId 1 = single week)
        const pr = (p.stats || []).find(s => s.statSourceId === 1 && s.statSplitTypeId === 1 && s.scoringPeriodId === d.scoringPeriodId);
        return { name: p.fullName, pos: POS[p.defaultPositionId] || 'FLEX', pts: pr && pr.appliedTotal != null ? Math.round(pr.appliedTotal * 10) / 10 : null };
      }),
    })),
  };
}

async function values(q) {
  const p = new URLSearchParams({ isDynasty: 'false', numQbs: q.get('qbs') || '1', numTeams: q.get('teams') || '12', ppr: q.get('ppr') || '1' });
  const r = await fetch('https://api.fantasycalc.com/values/current?' + p);
  if (!r.ok) throw new Error('FantasyCalc error ' + r.status);
  const out = {};
  for (const x of await r.json()) out[norm(x.player.name)] = x.value;
  return out;
}
