<?php
/* ============================================================
   CHARGE ARENA — farm island: list all owned pens (plots)
   so the island can render who owns what.
   ============================================================ */
require __DIR__ . '/config.php';
$pdo = db();
$rows = $pdo->query(
  'SELECT username, avatar, farm_plot, farm_capacity, stored_bulls
     FROM players WHERE farm_plot IS NOT NULL'
)->fetchAll();
$out = [];
foreach ($rows as $r) {
  $stored = $r['stored_bulls'] ? json_decode($r['stored_bulls'], true) : [];
  $out[] = [
    'username' => $r['username'], 'avatar' => $r['avatar'],
    'plot' => (int)$r['farm_plot'], 'capacity' => (int)$r['farm_capacity'],
    'bulls' => (is_array($stored) ? count($stored) : 0) + 1, // +1 active bull
  ];
}
out(['ok' => true, 'farms' => $out]);
