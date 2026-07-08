<?php
/* ============================================================
   CHARGE ARENA — global chat
   actions: post {username, avatar, message} | fetch {since}
   ============================================================ */
require __DIR__ . '/config.php';
$a = body();
$action = param($a, 'action', $_GET['action'] ?? 'fetch');
$pdo = db();

if ($action === 'post') {
  $username = substr(param($a, 'username', 'Ansem'), 0, 20);
  $avatar   = substr(param($a, 'avatar', 'ansem'), 0, 20);
  $msg      = substr(param($a, 'message', ''), 0, 200);
  $msg = trim($msg);
  if ($msg === '') fail('empty');
  $pdo->prepare('INSERT INTO chat_messages (username, avatar, message) VALUES (?,?,?)')
      ->execute([$username, $avatar, $msg]);
  out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
}

/* fetch: messages with id > since (0 = latest 30) */
$since = (int)param($a, 'since', $_GET['since'] ?? 0);
if ($since > 0) {
  $st = $pdo->prepare('SELECT id, username, avatar, message,
                         UNIX_TIMESTAMP(created_at) AS ts
                         FROM chat_messages WHERE id > ? ORDER BY id ASC LIMIT 50');
  $st->execute([$since]);
  $rows = $st->fetchAll();
} else {
  $rows = $pdo->query('SELECT id, username, avatar, message, UNIX_TIMESTAMP(created_at) AS ts
                         FROM chat_messages ORDER BY id DESC LIMIT 30')->fetchAll();
  $rows = array_reverse($rows);
}
foreach ($rows as &$r) { $r['id'] = (int)$r['id']; $r['ts'] = (int)$r['ts']; }
out(['ok' => true, 'messages' => $rows]);
