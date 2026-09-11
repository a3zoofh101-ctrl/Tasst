-- ============================================================
-- SMM Panel Platform - Database Schema
-- Engine: MySQL 5.7+ / MariaDB 10.3+
-- Charset: utf8mb4 (Arabic support)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- site_settings : key/value store for runtime-editable options
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
    setting_key   VARCHAR(100) NOT NULL PRIMARY KEY,
    setting_value TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO site_settings (setting_key, setting_value) VALUES
('site_name', 'سوشيال برو'),
('site_tagline', 'خدمات التواصل الاجتماعي'),
('currency_code', 'SAR'),
('currency_symbol', 'ر.س'),
('whatsapp_number', '966500000000'),
('points_per_currency', '1'),
('affiliate_percent', '5'),
('moyasar_publishable_key', ''),
('moyasar_secret_key', ''),
('moyasar_mode', 'test'),
('min_topup_amount', '10'),
('max_topup_amount', '5000')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(190) NOT NULL UNIQUE,
    phone           VARCHAR(30)  NULL,
    password_hash   VARCHAR(255) NOT NULL,
    balance         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    points          INT NOT NULL DEFAULT 0,
    api_key         VARCHAR(64) NOT NULL UNIQUE,
    referral_code   VARCHAR(20) NOT NULL UNIQUE,
    referred_by     INT UNSIGNED NULL,
    role            ENUM('user','admin') NOT NULL DEFAULT 'user',
    status          ENUM('active','banned') NOT NULL DEFAULT 'active',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_referrer FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    icon        VARCHAR(50) NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    status      ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- services
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id     INT UNSIGNED NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT NULL,
    rate_per_1000   DECIMAL(10,4) NOT NULL DEFAULT 0,
    min_qty         INT NOT NULL DEFAULT 100,
    max_qty         INT NOT NULL DEFAULT 10000,
    service_type    ENUM('default','drip_feed','custom_comments') NOT NULL DEFAULT 'default',
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    service_id      INT UNSIGNED NOT NULL,
    link            VARCHAR(500) NOT NULL,
    quantity        INT NOT NULL,
    charge          DECIMAL(10,2) NOT NULL,
    start_count     INT NULL,
    remains         INT NULL,
    status          ENUM('pending','in_progress','completed','partial','canceled','refunded') NOT NULL DEFAULT 'pending',
    notes           VARCHAR(500) NULL,
    bulk_batch_id   VARCHAR(40) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_service FOREIGN KEY (service_id) REFERENCES services(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- wallet transactions (ledger)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    type            ENUM('topup','order','refund','referral_bonus','admin_adjust') NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    balance_after   DECIMAL(12,2) NOT NULL,
    reference       VARCHAR(100) NULL,
    description     VARCHAR(255) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- topups (Moyasar payment attempts)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topups (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             INT UNSIGNED NOT NULL,
    amount              DECIMAL(12,2) NOT NULL,
    method              ENUM('moyasar') NOT NULL DEFAULT 'moyasar',
    moyasar_invoice_id  VARCHAR(64) NULL,
    status              ENUM('pending','paid','failed','expired') NOT NULL DEFAULT 'pending',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at             DATETIME NULL,
    CONSTRAINT fk_topups_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- refunds
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refunds (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id    INT UNSIGNED NOT NULL,
    user_id     INT UNSIGNED NOT NULL,
    amount      DECIMAL(12,2) NOT NULL,
    reason      VARCHAR(500) NULL,
    status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_refunds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- support tickets
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    order_id    INT UNSIGNED NULL,
    subject     VARCHAR(200) NOT NULL,
    status      ENUM('open','answered','closed') NOT NULL DEFAULT 'open',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ticket_messages (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id   INT UNSIGNED NOT NULL,
    sender      ENUM('user','admin') NOT NULL,
    message     TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- subscriptions (recurring / drip orders)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             INT UNSIGNED NOT NULL,
    service_id          INT UNSIGNED NOT NULL,
    link                VARCHAR(500) NOT NULL,
    quantity_per_cycle  INT NOT NULL,
    interval_days       INT NOT NULL DEFAULT 1,
    next_run_at         DATE NULL,
    status              ENUM('active','paused','canceled') NOT NULL DEFAULT 'active',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_service FOREIGN KEY (service_id) REFERENCES services(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- affiliate earnings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS affiliate_earnings (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    referrer_id         INT UNSIGNED NOT NULL,
    referred_user_id    INT UNSIGNED NOT NULL,
    order_id            INT UNSIGNED NULL,
    commission_amount   DECIMAL(12,2) NOT NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_affiliate_referrer FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_affiliate_referred FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- points log
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS points_log (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    points      INT NOT NULL,
    type        ENUM('earn','redeem') NOT NULL,
    reference   VARCHAR(100) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_points_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- announcements / updates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- seed: categories & services (editable from admin panel)
-- ------------------------------------------------------------
INSERT INTO categories (id, name, icon, sort_order) VALUES
(1, 'انستقرام', 'instagram', 1),
(2, 'تيك توك', 'tiktok', 2),
(3, 'تويتر / X', 'twitter', 3),
(4, 'يوتيوب', 'youtube', 4),
(5, 'سناب شات', 'snapchat', 5)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO services (category_id, name, description, rate_per_1000, min_qty, max_qty, service_type, sort_order) VALUES
(1, 'متابعين انستقرام عرب', 'متابعين حقيقيين جودة عالية', 12.5000, 100, 50000, 'default', 1),
(1, 'لايكات انستقرام', 'تسليم سريع', 3.0000, 50, 20000, 'default', 2),
(1, 'مشاهدات ريلز', 'تسليم فوري', 1.5000, 100, 100000, 'default', 3),
(2, 'متابعين تيك توك', 'متابعين نشيطين', 10.0000, 100, 50000, 'default', 1),
(2, 'لايكات تيك توك', 'تسليم سريع', 2.5000, 50, 20000, 'default', 2),
(3, 'متابعين تويتر / X', 'متابعين عرب', 15.0000, 100, 20000, 'default', 1),
(4, 'مشتركين يوتيوب', 'اشتراكات حقيقية', 30.0000, 50, 10000, 'default', 1),
(4, 'مشاهدات يوتيوب', 'مشاهدات تدريجية', 4.0000, 500, 1000000, 'drip_feed', 2),
(5, 'متابعين سناب شات', 'تسليم تدريجي', 20.0000, 100, 10000, 'default', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

SET FOREIGN_KEY_CHECKS = 1;
