<?php

require __DIR__ . '/_bootstrap.php';

app_require_method('POST');

$payload = app_json_input();
$email = strtolower(app_string(isset($payload['email']) ? $payload['email'] : ''));

if ($email === '') {
    app_json_response(400, ['error' => 'Email is required']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    app_json_response(400, ['error' => 'Invalid email address']);
}

$listResponse = app_supabase_auth_request(
    'GET',
    'admin/users',
    ['page' => '1', 'per_page' => '1000']
);

if (app_is_success($listResponse['status']) && !empty($listResponse['json']['users']) && is_array($listResponse['json']['users'])) {
    $matchedUserId = '';

    foreach ($listResponse['json']['users'] as $user) {
        $userEmail = '';
        if (is_array($user) && !empty($user['email'])) {
            $userEmail = strtolower((string) $user['email']);
        }

        if ($userEmail === $email) {
            $matchedUserId = !empty($user['id']) ? (string) $user['id'] : '';
            break;
        }
    }

    if ($matchedUserId !== '') {
        app_supabase_auth_request(
            'DELETE',
            'admin/users/' . rawurlencode($matchedUserId),
            [],
            ['should_soft_delete' => false]
        );
    }
}

$deleteResponse = app_supabase_rest_request(
    'DELETE',
    'admin_users',
    ['email' => 'eq.' . $email],
    null,
    ['Prefer: return=minimal']
);

if (!app_is_success($deleteResponse['status'])) {
    app_json_response(500, [
        'error' => app_error_message($deleteResponse, 'Kunne ikke fjerne brukeren fra admin_users-tabellen.'),
    ]);
}

app_json_response(200, [
    'success' => true,
    'message' => 'Brukeren er fjernet fra systemet.',
]);
