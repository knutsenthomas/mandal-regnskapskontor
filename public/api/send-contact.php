<?php

require __DIR__ . '/_bootstrap.php';

app_require_method('POST');

$payload = app_json_input();
$navn = app_string(isset($payload['navn']) ? $payload['navn'] : '');
$epost = strtolower(app_string(isset($payload['epost']) ? $payload['epost'] : ''));
$telefon = app_string(isset($payload['telefon']) ? $payload['telefon'] : '');
$bedriftsnavn = app_string(isset($payload['bedriftsnavn']) ? $payload['bedriftsnavn'] : '');
$melding = app_string(isset($payload['melding']) ? $payload['melding'] : '');

if ($navn === '' || $epost === '' || $melding === '') {
    app_json_response(400, ['error' => 'Missing required fields']);
}

if (!filter_var($epost, FILTER_VALIDATE_EMAIL)) {
    app_json_response(400, ['error' => 'Invalid email address']);
}

$response = app_supabase_rest_request(
    'POST',
    'contact_messages',
    [],
    [[
        'navn' => $navn,
        'epost' => $epost,
        'telefon' => $telefon,
        'bedriftsnavn' => $bedriftsnavn,
        'melding' => $melding,
        'read' => false,
    ]],
    ['Prefer: return=minimal']
);

if (!app_is_success($response['status'])) {
    app_json_response(500, [
        'error' => app_error_message($response, 'Kunne ikke lagre meldingen i Supabase.'),
    ]);
}

app_json_response(200, ['success' => true]);
