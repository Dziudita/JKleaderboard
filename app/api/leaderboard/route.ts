// app/api/leaderboard/route.ts

export async function GET() {
  const response = await fetch('https://api.goated.com/user2/affiliate/referral-leaderboard/OQID5MA', {
    headers: {
      'Cache-Control': 'no-store',
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500 });
  }

  const json = await response.json();

  const formatted = json.data
    .map((user: any) => ({
      username: user.name,
      total: user.wagered.this_month,
    }))
    .sort((a: { total: number }, b: { total: number }) => b.total - a.total); // 🛠 FIXED

  return new Response(JSON.stringify(formatted), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
