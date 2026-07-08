<?php
/* ============================================================
   CHARGE ARENA — multiplayer presence (per-map)
   POST {username, avatar, x, y, map} -> upsert, returns other
   players on the SAME map active in the last 8 seconds.
   Table auto-creates/upgrades on first call.
   ============================================================ */
require __DIR__ . '/config.php';
$a = body();
$pdo = db();

$pdo->exec(
  "CREATE TABLE IF NOT EXISTS presence (
     username   VARCHAR(20) PRIMARY KEY,
     avatar     VARCHAR(20) NOT NULL DEFAULT 'ansem',
     x          INT NOT NULL DEFAULT 1000,
     y          INT NOT NULL DEFAULT 1080,
     map        VARCHAR(12) NOT NULL DEFAULT 'main',
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_seen (updated_at)
   ) ENGINE=InnoDB"
);
// upgrade older presence tables that lack the map column
try { $pdo->exec("ALTER TABLE presence ADD COLUMN map VARCHAR(12) NOT NULL DEFAULT 'main'"); } catch (Throwable $e) {}

$username = substr(param($a, 'username', 'Ansem'), 0, 20);
$avatar   = substr(param($a, 'avatar', 'ansem'), 0, 20);
$x = (int)param($a, 'x', 1000);
$y = (int)param($a, 'y', 1080);
$map = substr(param($a, 'map', 'main'), 0, 12);

$pdo->prepare(
  "INSERT INTO presence (username, avatar, x, y, map) VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE avatar=VALUES(avatar), x=VALUES(x), y=VALUES(y), map=VALUES(map), updated_at=NOW()"
)->execute([$username, $avatar, $x, $y, $map]);

$st = $pdo->prepare(
  "SELECT username, avatar, x, y FROM presence
     WHERE username <> ? AND map = ? AND updated_at > (NOW() - INTERVAL 8 SECOND)
     ORDER BY updated_at DESC LIMIT 30"
);
$st->execute([$username, $map]);
$rows = $st->fetchAll();
foreach ($rows as &$r) { $r['x'] = (int)$r['x']; $r['y'] = (int)$r['y']; }

out(['ok' => true, 'players' => $rows, 'online' => count($rows) + 1, 'time' => time()]);
