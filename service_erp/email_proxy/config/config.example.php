<?php
// config.example.php
// IMPORTANT: Copy this to config.php and update the credentials.
// For enhanced security, ensure this folder is not web-accessible.

return [
    // API Authentication Key (Generate a secure random string)
    'api_key' => 'ep_live_sample_token',

    // SMTP Configuration (Hostinger / ResultsPro SMTP)
    'smtp_host'     => 'mail.example.com', 
    'smtp_auth'     => true,                 
    'smtp_username' => 'hello@example.com',
    'smtp_password' => 'your_smtp_password_here',
    // ENCRYPTION_STARTTLS (587) or ENCRYPTION_SMTPS (465)
    'smtp_secure'   => PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS, 
    'smtp_port'     => 465,

    // Sender Details are now strictly provided via the API JSON payload.

    // Log file path for failed auth (Make sure PHP has write permissions)
    'log_file'      => __DIR__ . '/../logs/auth_failures.log',
];
