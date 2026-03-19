<?php
/**
 * API Key Model
 * Server-to-server access keys for the existing API.
 */

require_once __DIR__ . '/../utils/database.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/validation.php';

class ApiKey {
    private $pdo;
    private static $schemaEnsured = false;

    private const ALLOWED_SCOPES = [
        '*',
        'analytics:read',
        'budgets:read',
        'budgets:write',
        'categories:read',
        'categories:write',
        'export:read',
        'operations:read',
        'operations:write',
        'profile:read'
    ];

    public function __construct() {
        $this->pdo = Database::getPDO();
        $this->ensureSchema();
    }

    public static function getAllowedScopes() {
        return self::ALLOWED_SCOPES;
    }

    public function parseScopes($value) {
        if (is_array($value)) {
            return $this->normalizeScopes($value);
        }

        if (!is_string($value) || trim($value) === '') {
            return [];
        }

        $decoded = json_decode($value, true);
        if (!is_array($decoded)) {
            return [];
        }

        return $this->normalizeScopes($decoded);
    }

    public function create($userId, $name, $scopes, $expiresAt = null) {
        if (!validateNonEmptyString($name, 100)) {
            throw new InvalidArgumentException('Name is required and must be at most 100 characters');
        }

        $normalizedScopes = $this->normalizeScopes($scopes);
        if (empty($normalizedScopes)) {
            throw new InvalidArgumentException('At least one scope is required');
        }

        $normalizedExpiresAt = $this->normalizeExpiry($expiresAt);
        $id = generateUUID();
        $prefix = generateApiKeyPrefix();
        $secretPart = generateApiKeySecretPart();
        $token = buildApiKeyToken($prefix, $secretPart);
        $tokenHash = hashApiKeyToken($prefix, $secretPart);

        $stmt = $this->pdo->prepare("
            INSERT INTO api_keys (
                id,
                user_id,
                name,
                key_prefix,
                key_hash,
                scopes,
                expires_at,
                is_active,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ");

        $stmt->execute([
            $id,
            $userId,
            trim($name),
            $prefix,
            $tokenHash,
            json_encode($normalizedScopes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $normalizedExpiresAt
        ]);

        $created = $this->findById($id, $userId);
        return [
            'apiKey' => $token,
            'record' => $this->formatPublicRecord($created)
        ];
    }

    public function findAllByUserId($userId) {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, name, key_prefix, scopes, is_active, last_used_at, last_used_ip, expires_at, created_at, updated_at
            FROM api_keys
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        return array_map([$this, 'formatPublicRecord'], $rows);
    }

    public function findById($id, $userId = null) {
        $sql = "
            SELECT id, user_id, name, key_prefix, scopes, is_active, last_used_at, last_used_ip, expires_at, created_at, updated_at
            FROM api_keys
            WHERE id = ?
        ";
        $params = [$id];

        if ($userId !== null) {
            $sql .= " AND user_id = ?";
            $params[] = $userId;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    public function revoke($id, $userId) {
        $stmt = $this->pdo->prepare("
            UPDATE api_keys
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$id, $userId]);

        return $this->formatPublicRecord($this->findById($id, $userId));
    }

    public function findActiveByPrefix($prefix) {
        $stmt = $this->pdo->prepare("
            SELECT
                ak.*,
                u.email AS user_email,
                u.role AS user_role
            FROM api_keys ak
            JOIN users u ON u.id = ak.user_id
            WHERE ak.key_prefix = ?
              AND ak.is_active = TRUE
              AND (ak.expires_at IS NULL OR ak.expires_at > CURRENT_TIMESTAMP)
            LIMIT 1
        ");
        $stmt->execute([$prefix]);
        return $stmt->fetch();
    }

    public function touchUsage($id, $ipAddress = null) {
        $stmt = $this->pdo->prepare("
            UPDATE api_keys
            SET last_used_at = CURRENT_TIMESTAMP, last_used_ip = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmt->execute([$ipAddress, $id]);
    }

    private function normalizeScopes($scopes) {
        if (!is_array($scopes)) {
            throw new InvalidArgumentException('Scopes must be an array');
        }

        $normalized = array_values(array_unique(array_filter(array_map(function($scope) {
            return is_string($scope) ? trim($scope) : '';
        }, $scopes))));

        if (in_array('*', $normalized, true)) {
            return ['*'];
        }

        foreach ($normalized as $scope) {
            if (!in_array($scope, self::ALLOWED_SCOPES, true)) {
                throw new InvalidArgumentException('Unsupported scope: ' . $scope);
            }
        }

        sort($normalized);
        return $normalized;
    }

    private function normalizeExpiry($expiresAt) {
        if ($expiresAt === null || $expiresAt === '') {
            return null;
        }

        if (!validateDate($expiresAt)) {
            throw new InvalidArgumentException('Invalid expiresAt format');
        }

        $normalized = normalizeOperationDate($expiresAt);
        if ($normalized === null) {
            throw new InvalidArgumentException('Invalid expiresAt format');
        }

        if ($normalized <= date('Y-m-d H:i:s')) {
            throw new InvalidArgumentException('expiresAt must be in the future');
        }

        return $normalized;
    }

    private function formatPublicRecord($row) {
        if (!$row) {
            return null;
        }

        return [
            'id' => $row['id'],
            'name' => $row['name'],
            'maskedKey' => 'phi_' . $row['key_prefix'] . '_****************',
            'keyPrefix' => $row['key_prefix'],
            'scopes' => $this->parseScopes($row['scopes']),
            'isActive' => (bool)$row['is_active'],
            'lastUsedAt' => $row['last_used_at'],
            'lastUsedIp' => $row['last_used_ip'],
            'expiresAt' => $row['expires_at'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at']
        ];
    }

    private function ensureSchema() {
        if (self::$schemaEnsured) {
            return;
        }

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS api_keys (
                id CHAR(36) PRIMARY KEY,
                user_id CHAR(36) NOT NULL,
                name VARCHAR(100) NOT NULL,
                key_prefix VARCHAR(12) NOT NULL,
                key_hash CHAR(64) NOT NULL,
                scopes TEXT NOT NULL,
                last_used_at DATETIME NULL,
                last_used_ip VARCHAR(45) NULL,
                expires_at DATETIME NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uq_api_keys_key_prefix (key_prefix),
                KEY idx_api_keys_user_id (user_id),
                KEY idx_api_keys_is_active (is_active),
                CONSTRAINT fk_api_keys_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) COMMENT='API keys for external server access'
        ");

        self::$schemaEnsured = true;
    }
}
