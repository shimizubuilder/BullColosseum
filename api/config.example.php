<?php
/* ============================================================
   CHARGE ARENA — API config + helpers (PDO MySQL)
   Copy this file to `config.php` and fill in your own credentials.
   `config.php` is gitignored so real credentials never reach the repo.
   ============================================================ */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

$DB_HOST = '127.0.0.1';
$DB_PORT = '3306';
$DB_NAME = 'your_database_name';
$DB_USER = 'your_database_user';
$DB_PASS = 'your_database_password';

function db() {
  global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASS;
  static $pdo = null;
  if ($pdo) return $pdo;
  try {
    $pdo = new PDO(
      "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4",
      $DB_USER, $DB_PASS,
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
       PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    return $pdo;
  } catch (Throwable $e) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'db_unavailable', 'detail' => $e->getMessage()]);
    exit;
  }
}

function body() {
  $raw = file_get_contents('php://input');
  $j = json_decode($raw, true);
  if (is_array($j)) return $j;
  return array_merge($_GET, $_POST);
}
function param($a, $k, $def = '') { return isset($a[$k]) ? trim((string)$a[$k]) : $def; }
function out($d) { echo json_encode($d); exit; }
function fail($msg, $code = 400) { http_response_code($code); echo json_encode(['ok' => false, 'error' => $msg]); exit; }
function newToken() { return bin2hex(random_bytes(16)); }

function pubPlayer($p, $withToken = false) {
  $stored = isset($p['stored_bulls']) && $p['stored_bulls'] ? json_decode($p['stored_bulls'], true) : [];
  $o = [
    'id' => (int)$p['id'], 'username' => $p['username'], 'avatar' => $p['avatar'],
    'gold' => (int)$p['gold'], 'chargetoken' => (int)$p['chargetoken'],
    'wins' => (int)$p['wins'], 'losses' => (int)$p['losses'], 'rating' => (int)$p['rating'],
    'wallet' => $p['wallet'] ?? null,
    'wallet_status' => $p['wallet_status'] ?? 'none',
    'username_changed' => (int)($p['username_changed'] ?? 0),
    'farm_plot' => (isset($p['farm_plot']) && $p['farm_plot'] !== null) ? (int)$p['farm_plot'] : null,
    'farm_capacity' => (int)($p['farm_capacity'] ?? 2),
    'stored_bulls' => is_array($stored) ? $stored : [],
    'farm_claim' => (int)($p['farm_claim'] ?? 0),
  ];
  if ($withToken) $o['token'] = $p['token'];
  return $o;
}
function pubBull($b) {
  if (!$b) return null;
  $gear = json_decode($b['gear'] ?? '[]', true);
  $traits = json_decode($b['traits'] ?? '[]', true);
  return [
    'id' => (int)$b['id'], 'name' => $b['name'], 'element' => $b['element'],
    'level' => (int)$b['level'], 'xp' => (int)$b['xp'], 'tier' => (int)$b['tier'],
    'gear' => is_array($gear) ? $gear : [],
    'traits' => is_array($traits) ? $traits : [],
    'mythic' => (int)($b['mythic'] ?? 0),
  ];
}
function playerByToken($pdo, $tok) {
  if ($tok === '') return null;
  $st = $pdo->prepare('SELECT * FROM players WHERE token = ? LIMIT 1');
  $st->execute([$tok]);
  return $st->fetch() ?: null;
}
