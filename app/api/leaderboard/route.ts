export const revalidate = 0;

export async function GET() {
  const res = await fetch("https://apis.goated.com/user/affiliate/referral-leaderboard/OQID5MA", {
    headers: {
      'Cache-Control': 'no-store',
    },
    next: { revalidate: 0 },
    cache: "no-store",
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch data from Goated API" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json();

  const sorted = data.data
    .map((user: any) => ({
      username: user.name,
      total: user.wagered?.this_month || 0,  // <-- ŠITA EILUTĖ PAKEISTA
    }))
    .sort((a: any, b: any) => b.total - a.total);

  return new Response(JSON.stringify(sorted), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
