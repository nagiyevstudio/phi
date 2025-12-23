<?php
/**
 * Validation Utility
 * Input data validation functions
 */

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePassword($password, $minLength = 8) {
    return strlen($password) >= $minLength;
}

function validateName($name, $maxLength = 100) {
    if ($name === null) {
        return true;
    }
    if (!is_string($name)) {
        return false;
    }
    $trimmed = trim($name);
    return $trimmed === '' || strlen($trimmed) <= $maxLength;
}

function validateRequired($value) {
    return !empty($value) || (is_numeric($value) && $value == 0);
}

function validateMonth($month) {
    return preg_match('/^\d{4}-\d{2}$/', $month) === 1;
}

function validateYear($year) {
    return preg_match('/^\d{4}$/', $year) === 1;
}

function validateAmount($amount) {
    return is_numeric($amount) && $amount > 0;
}

function validateOperationType($type) {
    return in_array($type, ['expense', 'income']);
}

function validateCategoryType($type) {
    return in_array($type, ['expense', 'income']);
}

function validateColor($color) {
    if (empty($color)) return true; // Optional
    return preg_match('/^#[0-9A-Fa-f]{6}$/', $color) === 1;
}

function normalizeOperationDate($date) {
    if (!is_string($date)) {
        return null;
    }

    $date = trim($date);
    $formats = [
        'Y-m-d',
        'Y-m-d H:i',
        'Y-m-d H:i:s',
        'Y-m-d\TH:i',
        'Y-m-d\TH:i:s'
    ];

    foreach ($formats as $format) {
        $d = DateTime::createFromFormat($format, $date);
        if ($d && $d->format($format) === $date) {
            return $d->format('Y-m-d H:i:s');
        }
    }

    return null;
}

function validateDate($date) {
    return normalizeOperationDate($date) !== null;
}

function validateUUID($uuid) {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid) === 1;
}

function generateUUID() {
    // Generate UUID v4
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
    
    return sprintf(
        '%08s-%04s-%04s-%04s-%12s',
        bin2hex(substr($data, 0, 4)),
        bin2hex(substr($data, 4, 2)),
        bin2hex(substr($data, 6, 2)),
        bin2hex(substr($data, 8, 2)),
        bin2hex(substr($data, 10, 6))
    );
}

function getJSONInput() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    
    return $data;
}

function sanitizeString($string) {
    return htmlspecialchars(strip_tags(trim($string)), ENT_QUOTES, 'UTF-8');
}

