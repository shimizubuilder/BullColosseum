-- ============================================================
--  CHARGE ARENA — Black Bull Bloodline
--  MySQL / MariaDB schema  (import via phpMyAdmin or CLI)
--  CLI:  mysql -u root < db/schema.sql
-- ============================================================
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS charge_arena
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE charge_arena;

-- ---- reset (safe to re-import) ----
DROP TABLE IF EXISTS presence;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS bulls;
DROP TABLE IF EXISTS players;

-- ============================================================
--  PLAYERS  (Handler / Ansem)
-- ============================================================
CREATE TABLE players (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(20)  NOT NULL UNIQUE,
  token        CHAR(32)     NOT NULL,               -- lightweight stored credential
  avatar       VARCHAR(20)  NOT NULL DEFAULT 'ansem',
  gold         INT          NOT NULL DEFAULT 60,
  chargetoken  INT          NOT NULL DEFAULT 0,      -- $CHARGE
  wins         INT          NOT NULL DEFAULT 0,
  losses       INT          NOT NULL DEFAULT 0,
  rating       INT          NOT NULL DEFAULT 1000,   -- leaderboard ranking
  wallet           VARCHAR(64) NULL,                          -- solana address
  wallet_status    ENUM('none','unverified','linked') NOT NULL DEFAULT 'none',
  username_changed TINYINT NOT NULL DEFAULT 0,                -- username can be changed only once
  farm_plot        INT NULL,                                  -- index of the owned pen (null = none yet)
  farm_capacity    INT NOT NULL DEFAULT 2,                    -- bull capacity of the pen
  stored_bulls     TEXT NULL,                                 -- JSON of bulls stored in the pen
  farm_claim       BIGINT NULL,                               -- passive earning: last-claim unix ts
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rating (rating DESC),
  INDEX idx_token (token),
  UNIQUE KEY uq_farm_plot (farm_plot)
) ENGINE=InnoDB;

-- ============================================================
--  BULLS  (owned bulls; 1 active per player)
-- ============================================================
CREATE TABLE bulls (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  player_id  INT NOT NULL,
  name       VARCHAR(20) NOT NULL DEFAULT 'Toro',
  element    ENUM('fire','bolt','shadow') NOT NULL DEFAULT 'fire',
  level      INT NOT NULL DEFAULT 1,
  xp         INT NOT NULL DEFAULT 0,
  tier       INT NOT NULL DEFAULT 0,
  gear       TEXT NULL,                              -- JSON array of gear ids
  traits     TEXT NULL,                              -- JSON array of trait ids
  mythic     TINYINT NOT NULL DEFAULT 0,             -- rare mythic bull
  is_active  TINYINT NOT NULL DEFAULT 1,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  INDEX idx_player (player_id)
) ENGINE=InnoDB;

-- ============================================================
--  MATCHES  (arena duel history)
-- ============================================================
CREATE TABLE matches (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  player_id     INT NOT NULL,
  opponent_name VARCHAR(30) NOT NULL DEFAULT '?',
  result        ENUM('win','loss') NOT NULL,
  gold_delta    INT NOT NULL DEFAULT 0,
  xp_delta      INT NOT NULL DEFAULT 0,
  rating_delta  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  INDEX idx_player_time (player_id, created_at)
) ENGINE=InnoDB;

-- ============================================================
--  CHAT  (open world global chat)
-- ============================================================
CREATE TABLE chat_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(20)  NOT NULL,
  avatar     VARCHAR(20)  NOT NULL DEFAULT 'ansem',
  message    VARCHAR(200) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_id (id)
) ENGINE=InnoDB;

-- ============================================================
--  PRESENCE  (online player positions in the open world)
--  Also auto-created by api/presence.php if it does not exist yet.
-- ============================================================
CREATE TABLE presence (
  username   VARCHAR(20) PRIMARY KEY,
  avatar     VARCHAR(20) NOT NULL DEFAULT 'ansem',
  x          INT NOT NULL DEFAULT 1000,
  y          INT NOT NULL DEFAULT 1080,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_seen (updated_at)
) ENGINE=InnoDB;

-- ============================================================
--  LEADERBOARD  (view: global ranking)
-- ============================================================
CREATE OR REPLACE VIEW leaderboard AS
  SELECT p.id, p.username, p.avatar, p.rating, p.wins, p.losses,
    (SELECT b.tier FROM bulls b WHERE b.player_id = p.id AND b.is_active = 1 LIMIT 1) AS bull_tier
  FROM players p
  ORDER BY p.rating DESC, p.wins DESC;

-- ============================================================
--  SEED  — bot Handlers so the leaderboard and world feel alive
-- ============================================================
INSERT INTO players (username, token, avatar, gold, chargetoken, wins, losses, rating) VALUES
  ('Charger_Prime', REPEAT('0',32), 'ansem',  900, 42, 61,  8, 1740),
  ('SolBull',       REPEAT('0',32), 'red',    620, 20, 44, 14, 1610),
  ('BlackHoofKing', REPEAT('0',32), 'gold',   540, 31, 40, 19, 1555),
  ('Toroshi',       REPEAT('0',32), 'ansem',  410, 12, 33, 21, 1480),
  ('MoonGored',     REPEAT('0',32), 'bolt',   300,  8, 28, 25, 1420),
  ('NoRetreat99',   REPEAT('0',32), 'shadow', 280,  5, 25, 22, 1390),
  ('StampedeGyat',  REPEAT('0',32), 'red',    210,  3, 19, 24, 1330),
  ('HornDegen',     REPEAT('0',32), 'gold',   180,  2, 17, 30, 1280),
  ('CalfEnjoyer',   REPEAT('0',32), 'ansem',  120,  0, 11, 28, 1180),
  ('PaperHoof',     REPEAT('0',32), 'bolt',    90,  0,  6, 33, 1080),
  ('LiquidatedLad', REPEAT('0',32), 'shadow',  60,  0,  3, 40,  980),
  ('FreshCalf',     REPEAT('0',32), 'ansem',   60,  0,  1,  4, 1010);

INSERT INTO chat_messages (username, avatar, message) VALUES
  ('Charger_Prime', 'ansem',  'No Retreat. Only Charge. 🐂'),
  ('SolBull',       'red',    'who dares fight my Alpha in the colosseum?'),
  ('MoonGored',     'bolt',   'just hit Bull tier, this lightning aura goes hard'),
  ('HornDegen',     'gold',   'holding $CHARGE for the War Crown — worth it?'),
  ('Toroshi',       'ansem',  'gg that last-second clash 🔥');
