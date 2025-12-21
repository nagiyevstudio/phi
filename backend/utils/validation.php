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

function validateRequired($value) {
    return !empty($value) || (is_numeric($value) && $value == 0);
}

function validateMonth($month) {
    return preg_match('/^\d{4}-\d{2}$/', $month) === 1;
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

function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

function validateUUID($uuid) {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid) === 1;
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

