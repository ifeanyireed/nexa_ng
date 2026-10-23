<?php
// config.php
// Live Configuration File
// For enhanced security, ensure this folder is not web-accessible.

return [
    // API Authentication Key (Ensure this matches the token in your Go backend)
    'api_key' => getenv('EMAIL_PROXY_API_KEY') ?: 'ep_live_sample_token',

    // SMTP Configuration (Hostinger / ResultsPro SMTP)
    'smtp_host'     => getenv('SMTP_HOST') ?: 'smtp.hostinger.com', 
    'smtp_auth'     => true,                 
    'smtp_username' => getenv('SMTP_USERNAME') ?: 'hello@resultspro.ng',
    'smtp_password' => getenv('SMTP_PASSWORD') ?: '',
    // ENCRYPTION_STARTTLS (587) or ENCRYPTION_SMTPS (465)
    'smtp_secure'   => PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS, 
    'smtp_port'     => (int)(getenv('SMTP_PORT') ?: 465),

    // Sender Details are now strictly provided via the API JSON payload.

    // Log file path for failed auth (Make sure PHP has write permissions)
    'log_file'      => __DIR__ . '/../logs/auth_failures.log',
];
