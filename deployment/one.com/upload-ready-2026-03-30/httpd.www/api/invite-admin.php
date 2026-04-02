<?php

require __DIR__ . '/_bootstrap.php';

app_require_method('POST');

$payload = app_json_input();
$email = strtolower(app_string(isset($payload['email']) ? $payload['email'] : ''));
$fullName = app_string(isset($payload['full_name']) ? $payload['full_name'] : '');
$phone = app_string(isset($payload['phone']) ? $payload['phone'] : '');

if ($email === '') {
    app_json_response(400, ['error' => 'Email is required']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    app_json_response(400, ['error' => 'Invalid email address']);
}

$inviteResponse = app_supabase_auth_request(
    'POST',
    'invite',
    ['redirect_to' => app_site_url() . '/set-password'],
    [
        'email' => $email,
        'data' => [
            'full_name' => $fullName,
            'phone' => $phone,
        ],
    ]
);

$inviteSucceeded = app_is_success($inviteResponse['status']);
$userAlreadyExists = $inviteResponse['status'] === 422;

if (!$inviteSucceeded && !$userAlreadyExists) {
    app_json_response(500, [
        'error' => app_error_message($inviteResponse, 'Kunne ikke invitere brukeren via Supabase Auth.'),
    ]);
}

$upsertResponse = app_supabase_rest_request(
    'POST',
    'admin_users',
    ['on_conflict' => 'email'],
    [[
        'email' => $email,
        'full_name' => $fullName,
        'phone' => $phone,
    ]],
    ['Prefer: resolution=merge-duplicates, return=minimal']
);

if (!app_is_success($upsertResponse['status'])) {
    app_json_response(500, [
        'error' => app_error_message($upsertResponse, 'Kunne ikke oppdatere admin_users-tabellen.'),
    ]);
}

app_json_response(200, [
    'success' => true,
    'message' => $inviteSucceeded
        ? 'Invitasjon sendt på e-post!'
        : 'Brukeren var allerede registrert, men er nå lagt til i admin-listen.',
]);
