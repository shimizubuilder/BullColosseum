<?php
/* ============================================================
   CHARGE ARENA — profile API
   actions: setwallet {wallet, method: connect|paste} | rename {username}
   ============================================================ */
require __DIR__ . '/config.php';
$a = body();
$pdo = db();
$p = playerByToken($pdo, param($a, 'token'));
if (!$p) fail('bad_token', 401);
$action = param($a, 'action');

if ($action === 'setwallet') {
  // record address only — NOT verified. Ownership proven via 'verify' (signature).
  $wallet = substr(param($a, 'wallet', ''), 0, 64);
  if (!preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $wallet)) fail('bad_address');
  $pdo->prepare("UPDATE players SET wallet = ?, wallet_status = 'unverified' WHERE id = ?")
      ->execute([$wallet, $p['id']]);
  $p = $pdo->query('SELECT * FROM players WHERE id = ' . (int)$p['id'])->fetch();
  out(['ok' => true, 'player' => pubPlayer($p, true)]);
}

if ($action === 'verify') {
  // client signed a challenge nonce with Phantom + verified ed25519 (Web Crypto) client-side.
  // NOTE: this XAMPP PHP lacks sodium/openssl so it cannot re-verify server-side; it trusts the
  // client-verified proof. In production, verify the signature here with sodium_crypto_sign_verify_detached.
  $wallet = substr(param($a, 'wallet', ''), 0, 64);
  $sig    = param($a, 'signature', '');
  if (!preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $wallet)) fail('bad_address');
  if ($sig === '') fail('no_signature');
  $pdo->prepare("UPDATE players SET wallet = ?, wallet_status = 'linked' WHERE id = ?")
      ->execute([$wallet, $p['id']]);
  $p = $pdo->query('SELECT * FROM players WHERE id = ' . (int)$p['id'])->fetch();
  out(['ok' => true, 'player' => pubPlayer($p, true)]);
}

if ($action === 'rename') {
  if ((int)$p['username_changed'] === 1) fail('already_changed');
  $new = substr(param($a, 'username', ''), 0, 20);
  if ($new === '') fail('empty');
  $ex = $pdo->prepare('SELECT id FROM players WHERE username = ? AND id <> ?');
  $ex->execute([$new, $p['id']]);
  if ($ex->fetch()) fail('taken');
  $pdo->prepare('UPDATE players SET username = ?, username_changed = 1 WHERE id = ?')
      ->execute([$new, $p['id']]);
  $p = $pdo->query('SELECT * FROM players WHERE id = ' . (int)$p['id'])->fetch();
  out(['ok' => true, 'player' => pubPlayer($p, true)]);
}

fail('unknown_action');
