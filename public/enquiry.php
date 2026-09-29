<?php
/**
 * Banksia Tours enquiry form handler (cPanel / PHP).
 *
 * Set the two addresses below before going live. The FROM address should be a
 * mailbox on the site's own domain (create it in cPanel → Email Accounts) so
 * the mail passes SPF and isn't marked as spam.
 */
const ENQUIRY_TO = 'CHANGE-ME@banksiatours.com.au';
const ENQUIRY_FROM = 'website@banksiatours.com.au';

const INTEREST_OPTIONS = [
    'A day tour',
    'A short break (2–6 days)',
    'An extended holiday',
    'A camping safari',
    'A charter',
    'Joining the Travel Club',
];

function redirect_to(string $path): void
{
    header('Location: ' . $path, true, 303);
    exit;
}

/** Trim, drop control characters (stops header injection) and cap the length. */
function clean(string $key, int $max, bool $multiline = false): string
{
    $value = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : '';
    $pattern = $multiline ? '/[^\P{C}\n\t]/u' : '/\p{C}/u';
    $value = preg_replace($pattern, '', $value) ?? '';
    return mb_substr($value, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    redirect_to('/#contact');
}

// Spam trap: real people never fill in the hidden "website" field.
if (!empty($_POST['website'])) {
    redirect_to('/thank-you/');
}

if (str_starts_with(ENQUIRY_TO, 'CHANGE-ME')) {
    error_log('Banksia enquiry form: ENQUIRY_TO is not configured in enquiry.php');
    redirect_to('/enquiry-error/');
}

$name = clean('name', 100);
$phone = clean('phone', 40);
$email = clean('email', 200);
$interest = clean('interest', 60);
$travellers = clean('travellers', 5);
$message = clean('message', 3000, true);

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $email = '';
}
if (!in_array($interest, INTEREST_OPTIONS, true)) {
    $interest = 'Not specified';
}
if ($travellers !== '' && !ctype_digit($travellers)) {
    $travellers = '';
}

if ($name === '' || ($phone === '' && $email === '')) {
    redirect_to('/enquiry-error/');
}

$body = implode("\n", [
    'New enquiry from the Banksia Tours website',
    '',
    'Name:        ' . $name,
    'Phone:       ' . ($phone ?: '—'),
    'Email:       ' . ($email ?: '—'),
    'Interested:  ' . $interest,
    'Travellers:  ' . ($travellers ?: '—'),
    '',
    'Where and when?',
    $message ?: '—',
]);

$headers = [
    'From: Banksia Tours website <' . ENQUIRY_FROM . '>',
    'Content-Type: text/plain; charset=UTF-8',
];
if ($email !== '') {
    $headers[] = 'Reply-To: ' . $email;
}

$subject = '=?UTF-8?B?' . base64_encode('Website enquiry: ' . $interest . ' — ' . $name) . '?=';
$sent = mail(ENQUIRY_TO, $subject, $body, implode("\r\n", $headers), '-f' . ENQUIRY_FROM);

redirect_to($sent ? '/thank-you/' : '/enquiry-error/');
