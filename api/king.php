<?php
/* ============================================================
   CHARGE ARENA — King of the Arena
   GET / no action     -> current king state
   POST action=challenge {token, won, bull, tier}
       -> if won: dethrone (pay previous king a hold-time bounty) and crown challenger
   Table auto-creates on first call.
   ============================================================ */
require __DIR__ . '/config.php';
$pdo = db();
$pdo->exec(
  "CREATE TABLE IF NOT EXISTS arena_king (
     id        TINYINT PRIMARY KEY,
     player_id INT NULL,
     username  VARCHAR(20),
     avatar    VARCHAR(20),
     tier      INT NOT NULL DEFAULT 0,
     bull      TEXT,
     since_ts  BIGINT NOT NULL DEFAULT 0
   ) ENGINE=InnoDB"
);
$a = body();
$action = param($a, 'action', $_GET['action'] ?? '');

if ($action === 'challenge') {
  $p = playerByToken($pdo, param($a, 'token'));
  if (!$p) fail('bad_token', 401);
  $won = !empty($a['won']);
  if (!$won) out(['ok' => true, 'became_king' => false, 'king' => pubKing(kingRow($pdo))]);

  $cur = kingRow($pdo);
  $nowts = time();
  $reward = 0;
  if ($cur && $cur['player_id'] && (int)$cur['player_id'] !== (int)$p['id']) {
    $hold = max(0, $nowts - (int)$cur['since_ts']);
    $reward = min(1000, intdiv($hold, 60) * 5);              // 5 gold / minute held, cap 1000
    if ($reward > 0) $pdo->prepare('UPDATE players SET gold = gold + ? WHERE id = ?')
                         ->execute([$reward, (int)$cur['player_id']]);
  }
  $bull = json_encode(is_array($a['bull'] ?? null) ? $a['bull'] : []);
  $tier = (int)param($a, 'tier', 0);
  $pdo->prepare(
    'INSERT INTO arena_king (id, player_id, username, avatar, tier, bull, since_ts) VALUES (1,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE player_id=VALUES(player_id), username=VALUES(username),
         avatar=VALUES(avatar), tier=VALUES(tier), bull=VALUES(bull), since_ts=VALUES(since_ts)'
  )->execute([(int)$p['id'], $p['username'], $p['avatar'], $tier, $bull, $nowts]);
  out(['ok' => true, 'became_king' => true, 'reward_to_prev' => $reward, 'king' => pubKing(kingRow($pdo)), 'now' => $nowts]);
}

out(['ok' => true, 'king' => pubKing(kingRow($pdo)), 'now' => time()]);

function kingRow($pdo) { $r = $pdo->query('SELECT * FROM arena_king WHERE id = 1')->fetch(); return $r ?: null; }
function pubKing($r) {
  if (!$r) return null;
  $b = $r['bull'] ? json_decode($r['bull'], true) : [];
  return ['username' => $r['username'], 'avatar' => $r['avatar'], 'tier' => (int)$r['tier'],
          'since' => (int)$r['since_ts'], 'bull' => is_array($b) ? $b : []];
}
