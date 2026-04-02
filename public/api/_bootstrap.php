<?php

function app_json_response($status, $payload)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function app_require_method($method)
{
    $requestMethod = isset($_SERVER['REQUEST_METHOD']) ? strtoupper((string) $_SERVER['REQUEST_METHOD']) : 'GET';
    if ($requestMethod === strtoupper($method)) {
        return;
    }

    header('Allow: ' . strtoupper($method));
    app_json_response(405, ['error' => 'Method not allowed']);
}

function app_private_config()
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $config = [];
    $candidates = [
        getenv('ONECOM_PRIVATE_CONFIG') ?: '',
        dirname(__DIR__, 2) . '/httpd.private/mandal-regnskapskontor-config.php',
        dirname(__DIR__, 2) . '/httpd.private/one-config.php',
        dirname(__DIR__) . '/mandal-regnskapskontor-config.php',
        dirname(__DIR__) . '/one-config.php',
        __DIR__ . '/mandal-regnskapskontor-config.php',
        __DIR__ . '/one-config.php',
    ];

    foreach ($candidates as $path) {
        if (!$path || !is_readable($path)) {
            continue;
        }

        $loaded = require $path;
        if (is_array($loaded)) {
            $config = $loaded;
            break;
        }
    }

    return $config;
}

function app_config($key, $default = '')
{
    $envValue = getenv($key);
    if ($envValue !== false && $envValue !== '') {
        return $envValue;
    }

    $config = app_private_config();
    if (array_key_exists($key, $config) && $config[$key] !== '') {
        return $config[$key];
    }

    return $default;
}

function app_json_input()
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        app_json_response(400, ['error' => 'Invalid JSON payload']);
    }

    return $decoded;
}

function app_string($value)
{
    return trim((string) ($value ?? ''));
}

function app_is_success($status)
{
    return $status >= 200 && $status < 300;
}

function app_error_message($response, $fallback)
{
    if (!empty($response['json']) && is_array($response['json'])) {
        foreach (['msg', 'message', 'error_description', 'error'] as $key) {
            if (!empty($response['json'][$key])) {
                return (string) $response['json'][$key];
            }
        }
    }

    if (!empty($response['body'])) {
        return (string) $response['body'];
    }

    return $fallback;
}

function app_http_request($method, $url, $headers = [], $body = null)
{
    $normalizedHeaders = ['Accept: application/json'];
    foreach ($headers as $header) {
        $normalizedHeaders[] = $header;
    }

    $encodedBody = null;
    if ($body !== null) {
        $encodedBody = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $hasContentType = false;
        foreach ($normalizedHeaders as $header) {
            if (stripos($header, 'Content-Type:') === 0) {
                $hasContentType = true;
                break;
            }
        }
        if (!$hasContentType) {
            $normalizedHeaders[] = 'Content-Type: application/json; charset=utf-8';
        }
    }

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $normalizedHeaders);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        if ($encodedBody !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $encodedBody);
        }

        $responseBody = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($responseBody === false) {
            return [
                'status' => $status,
                'body' => '',
                'json' => null,
                'error' => $curlError ?: 'Unknown cURL error',
            ];
        }

        $decoded = json_decode($responseBody, true);
        return [
            'status' => $status,
            'body' => $responseBody,
            'json' => is_array($decoded) ? $decoded : null,
            'error' => null,
        ];
    }

    $context = stream_context_create([
        'http' => [
            'method' => strtoupper($method),
            'header' => implode("\r\n", $normalizedHeaders),
            'content' => $encodedBody === null ? '' : $encodedBody,
            'ignore_errors' => true,
            'timeout' => 30,
        ],
    ]);

    $responseBody = @file_get_contents($url, false, $context);
    $status = 0;
    if (!empty($http_response_header)) {
        foreach ($http_response_header as $headerLine) {
            if (preg_match('/^HTTP\/\S+\s+(\d{3})/', $headerLine, $matches)) {
                $status = (int) $matches[1];
                break;
            }
        }
    }

    $decoded = json_decode((string) $responseBody, true);
    return [
        'status' => $status,
        'body' => $responseBody === false ? '' : $responseBody,
        'json' => is_array($decoded) ? $decoded : null,
        'error' => $responseBody === false ? 'HTTP request failed' : null,
    ];
}

function app_supabase_url()
{
    return rtrim((string) app_config('SUPABASE_URL', 'https://ovbqtaxwwxflvxdjkeih.supabase.co'), '/');
}

function app_supabase_service_key()
{
    return (string) app_config('SUPABASE_SERVICE_ROLE_KEY', '');
}

function app_supabase_headers($extraHeaders = [])
{
    $serviceKey = app_supabase_service_key();
    if ($serviceKey === '') {
        app_json_response(500, [
            'error' => 'SUPABASE_SERVICE_ROLE_KEY mangler. Legg den i httpd.private-konfigurasjonen, eller i httpd.www/mandal-regnskapskontor-config.php hvis du bare har tilgang til webroten i one.com.',
        ]);
    }

    $headers = [
        'apikey: ' . $serviceKey,
        'Authorization: Bearer ' . $serviceKey,
    ];

    foreach ($extraHeaders as $header) {
        $headers[] = $header;
    }

    return $headers;
}

function app_supabase_rest_request($method, $path, $query = [], $body = null, $extraHeaders = [])
{
    $url = app_supabase_url() . '/rest/v1/' . ltrim($path, '/');
    if (!empty($query)) {
        $url .= '?' . http_build_query($query);
    }

    return app_http_request($method, $url, app_supabase_headers($extraHeaders), $body);
}

function app_supabase_auth_request($method, $path, $query = [], $body = null, $extraHeaders = [])
{
    $url = app_supabase_url() . '/auth/v1/' . ltrim($path, '/');
    if (!empty($query)) {
        $url .= '?' . http_build_query($query);
    }

    return app_http_request($method, $url, app_supabase_headers($extraHeaders), $body);
}

function app_site_url()
{
    $configured = rtrim((string) app_config('SITE_URL', 'https://mandalregnskapskontor.no'), '/');
    if ($configured !== '') {
        return $configured;
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = isset($_SERVER['HTTP_HOST']) ? trim((string) $_SERVER['HTTP_HOST']) : '';

    if ($host === '') {
        return '';
    }

    return $scheme . '://' . $host;
}
