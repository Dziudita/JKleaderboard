export const revalidate = 0;

export async function GET() {
  const res = await fetch("https://api.goated.com/user2/affiliate/referral-leaderboard/OQID5MA", {
    headers: {
      'Cache-Control': 'no-store',
    },
    next: { revalidate: 0 },
  });

  const data = await res.json();

  // Filtruoti pagal "this_month"
  const sorted = data.data
    .map((u: any) => ({
      username: u.name,
      total: u.wagered?.this_month || 0,
    }))
    .sort((a: any, b: any) => b.total - a.total);

  return new Response(JSON.stringify(sorted), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
