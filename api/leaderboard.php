<?php
/* CHARGE ARENA — leaderboard (top 100 by rating) */
require __DIR__ . '/config.php';
$pdo = db();
$rows = $pdo->query(
  'SELECT p.username, p.avatar, p.rating, p.wins, p.losses,
          (SELECT b.tier FROM bulls b WHERE b.player_id = p.id AND b.is_active = 1 LIMIT 1) AS tier
     FROM players p
    ORDER BY p.rating DESC, p.wins DESC
    LIMIT 100'
)->fetchAll();
$out = [];
$rank = 0;
foreach ($rows as $r) {
  $rank++;
  $out[] = [
    'rank' => $rank, 'username' => $r['username'], 'avatar' => $r['avatar'],
    'rating' => (int)$r['rating'], 'wins' => (int)$r['wins'], 'losses' => (int)$r['losses'],
    'tier' => (int)($r['tier'] ?? 0),
  ];
}
out(['ok' => true, 'leaderboard' => $out]);
