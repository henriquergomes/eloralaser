<?php
header("Content-Type: application/json; charset=UTF-8");

// CORS Headers for AJAX requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método não permitido."]);
    exit;
}

// Get POST data
$name = isset($_POST["name"]) ? strip_tags(trim($_POST["name"])) : "";
$email = isset($_POST["email"]) ? filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL) : "";
$phone = isset($_POST["phone"]) ? strip_tags(trim($_POST["phone"])) : "";
$material = isset($_POST["material"]) ? strip_tags(trim($_POST["material"])) : "";
$details = isset($_POST["details"]) ? strip_tags(trim($_POST["details"])) : "";

// Validate required fields
if (empty($name) || empty($email) || empty($phone) || empty($material) || empty($details)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Por favor, preencha todos os campos obrigatórios."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Por favor, insira um e-mail válido."]);
    exit;
}

// Email recipient
$to = "contato.eloralaser@gmail.com";

// Email subject (encoded as UTF-8 Base64 to support Portuguese characters in subject lines)
$subject = "=?UTF-8?B?" . base64_encode("Novo Orçamento Técnico - Elora Laser: $name") . "?=";

// Email body
$message = "Você recebeu uma nova solicitação de orçamento técnico pelo site da Elora Laser:\n\n";
$message .= "Nome/Empresa: $name\n";
$message .= "E-mail: $email\n";
$message .= "Telefone/WhatsApp: $phone\n";
$message .= "Material Principal: $material\n\n";
$message .= "Detalhes do Projeto:\n$details\n\n";
$message .= "----------------------------------------\n";
$message .= "Este e-mail foi enviado automaticamente a partir do formulário da landing page.";

// Email headers
// Note: Reply-To is set to the client's email so that clicking "Reply" goes straight to the client.
$headers = "From: contato.eloralaser@gmail.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email using native mail() function (supported out-of-the-box by Hostinger)
if (mail($to, $subject, $message, $headers)) {
    echo json_encode(["status" => "success", "message" => "Projeto enviado com sucesso!"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Ocorreu um erro interno no servidor ao tentar enviar o e-mail."]);
}
?>
