<?php
/* ============================================================
   CHARGE ARENA — player API
   actions: register | load | save | match
   ============================================================ */
require __DIR__ . '/config.php';

$a = body();
$action = param($a, 'action', $_GET['action'] ?? '');
$pdo = db();

/* -------- REGISTER / LOGIN by username (no password: prototype) -------- */
if ($action === 'register') {
  $username = substr(param($a, 'username', 'Ansem'), 0, 20);
  if ($username === '') $username = 'Ansem';
  $avatar   = substr(param($a, 'avatar', 'ansem'), 0, 20);
  $bullName = substr(param($a, 'bullName', 'Toro'), 0, 20);
  $element  = param($a, 'element', 'fire');
  if (!in_array($element, ['fire', 'bolt', 'shadow'], true)) $element = 'fire';

  $st = $pdo->prepare('SELECT * FROM players WHERE username = ? LIMIT 1');
  $st->execute([$username]);
  $p = $st->fetch();

  if ($p) {
    // returning handler -> resume
    $bst = $pdo->prepare('SELECT * FROM bulls WHERE player_id = ? AND is_active = 1 LIMIT 1');
    $bst->execute([$p['id']]);
    out(['ok' => true, 'returning' => true,
         'player' => pubPlayer($p, true), 'bull' => pubBull($bst->fetch())]);
  }

  $tok = newToken();
  $pdo->prepare('INSERT INTO players (username, token, avatar) VALUES (?,?,?)')
      ->execute([$username, $tok, $avatar]);
  $pid = (int)$pdo->lastInsertId();
  $pdo->prepare('INSERT INTO bulls (player_id, name, element) VALUES (?,?,?)')
      ->execute([$pid, $bullName, $element]);

  $p = $pdo->query('SELECT * FROM players WHERE id = ' . $pid)->fetch();
  $b = $pdo->query('SELECT * FROM bulls WHERE player_id = ' . $pid . ' LIMIT 1')->fetch();
  out(['ok' => true, 'returning' => false,
       'player' => pubPlayer($p, true), 'bull' => pubBull($b)]);
}

/* -------- LOAD by token -------- */
if ($action === 'load') {
  $p = playerByToken($pdo, param($a, 'token'));
  if (!$p) fail('bad_token', 401);
  $bst = $pdo->prepare('SELECT * FROM bulls WHERE player_id = ? AND is_active = 1 LIMIT 1');
  $bst->execute([$p['id']]);
  out(['ok' => true, 'player' => pubPlayer($p, true), 'bull' => pubBull($bst->fetch())]);
}

/* -------- SAVE snapshot (gold/token/bull) -------- */
if ($action === 'save') {
  $p = playerByToken($pdo, param($a, 'token'));
  if (!$p) fail('bad_token', 401);
  $gold = (int)param($a, 'gold', $p['gold']);
  $ctok = (int)param($a, 'chargetoken', $p['chargetoken']);
  $farmPlot = array_key_exists('farm_plot', $a)
      ? ($a['farm_plot'] === null ? null : (int)$a['farm_plot']) : $p['farm_plot'];
  $farmCap  = isset($a['farm_capacity']) ? max(2, (int)$a['farm_capacity']) : $p['farm_capacity'];
  $stored   = array_key_exists('stored_bulls', $a)
      ? json_encode(array_values((array)$a['stored_bulls'])) : $p['stored_bulls'];
  $farmClaim = isset($a['farm_claim']) ? (int)$a['farm_claim'] : $p['farm_claim'];
  try {
    $pdo->prepare('UPDATE players SET gold=?, chargetoken=?, farm_plot=?, farm_capacity=?, stored_bulls=?, farm_claim=? WHERE id=?')
        ->execute([max(0,$gold), max(0,$ctok), $farmPlot, $farmCap, $stored, $farmClaim, $p['id']]);
  } catch (Throwable $e) {
    // plot might already be taken (unique) -> persist everything else, keep old plot
    $pdo->prepare('UPDATE players SET gold=?, chargetoken=?, farm_capacity=?, stored_bulls=?, farm_claim=? WHERE id=?')
        ->execute([max(0,$gold), max(0,$ctok), $farmCap, $stored, $farmClaim, $p['id']]);
    if (isset($a['bull']) && is_array($a['bull'])) saveBull($pdo, $p['id'], $a['bull']);
    out(['ok' => true, 'warning' => 'plot_taken']);
  }
  if (isset($a['bull']) && is_array($a['bull'])) saveBull($pdo, $p['id'], $a['bull']);
  out(['ok' => true]);
}

/* -------- MATCH result: record + adjust rating + persist -------- */
if ($action === 'match') {
  $p = playerByToken($pdo, param($a, 'token'));
  if (!$p) fail('bad_token', 401);
  $result = param($a, 'result') === 'win' ? 'win' : 'loss';
  $goldD  = (int)param($a, 'gold_delta', 0);
  $xpD    = (int)param($a, 'xp_delta', 0);
  $tokD   = (int)param($a, 'tok_delta', 0);
  $opp    = substr(param($a, 'opponent', '?'), 0, 30);
  $ratingD = $result === 'win' ? (14 + random_int(0, 10)) : -(9 + random_int(0, 8));

  $win  = $result === 'win' ? 1 : 0;
  $loss = 1 - $win;
  $pdo->prepare('UPDATE players SET gold = GREATEST(0, gold + ?), chargetoken = GREATEST(0, chargetoken + ?),
                   wins = wins + ?, losses = losses + ?, rating = GREATEST(0, rating + ?) WHERE id = ?')
      ->execute([$goldD, $tokD, $win, $loss, $ratingD, $p['id']]);
  $pdo->prepare('INSERT INTO matches (player_id, opponent_name, result, gold_delta, xp_delta, rating_delta)
                   VALUES (?,?,?,?,?,?)')
      ->execute([$p['id'], $opp, $result, $goldD, $xpD, $ratingD]);
  if (isset($a['bull']) && is_array($a['bull'])) saveBull($pdo, $p['id'], $a['bull']);

  $p = $pdo->query('SELECT * FROM players WHERE id = ' . (int)$p['id'])->fetch();
  out(['ok' => true, 'player' => pubPlayer($p, true), 'rating_delta' => $ratingD]);
}

fail('unknown_action');

/* ---- helper ---- */
function saveBull($pdo, $pid, $bl) {
  $el = in_array($bl['element'] ?? 'fire', ['fire','bolt','shadow'], true) ? $bl['element'] : 'fire';
  $pdo->prepare('UPDATE bulls SET name=?, element=?, level=?, xp=?, tier=?, gear=?, traits=?, mythic=?
                   WHERE player_id=? AND is_active=1')
      ->execute([
        substr($bl['name'] ?? 'Toro', 0, 20), $el,
        max(1, (int)($bl['level'] ?? 1)), max(0, (int)($bl['xp'] ?? 0)),
        max(0, (int)($bl['tier'] ?? 0)),
        json_encode(array_values((array)($bl['gear'] ?? []))),
        json_encode(array_values((array)($bl['traits'] ?? []))),
        !empty($bl['mythic']) ? 1 : 0, $pid,
      ]);
}
