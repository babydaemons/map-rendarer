<?php
require_once 'HTTP.php';

$userAgents = array(
  // Chrome
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.874.121 Safari/535.2",
  // Firefox
  "Mozilla/5.0 (Windows NT 5.1; rv:6.0.2) Gecko/20100101 Firefox/6.0.2",
  // Safari
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/534.52.7 (KHTML, like Gecko) Version/5.1.2 Safari/534.52.7",
  // IE
  "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET4.0C; .NET4.0E)",
  // Opera
  "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.9.168 Version/11.52"
);

$baseUrl = "http://maps.google.com/maps/api/staticmap?";
$url = $baseUrl . $_SERVER['QUERY_STRING'];

$userAgent = $userAgents[mt_rand(0, count($userAgents) - 1)];
$opts = array(
  'http' => array(
    'method' => "GET",
    'header' => "Accept-Language: " . $_SERVER['HTTP_ACCEPT_LANGUAGE'] . "\r\n" .
                "User-Agent: " . $userAgent . "\r\n"
  )
);
$context = stream_context_create($opts);

$waits = 1;
for ($i = 0; !($handle = fopen($url, "rb", false, $context) && $i < 7; $i++) {
  sleep($waits);
  $waits *= 2;
}

if (!$handle) {
  HTTP::redirect("error.png");
}

$contents = stream_get_contents($handle);

$wanted = "Content-Type: ";
foreach ($http_response_header as $http_header) {
  if (stripos($http_header, $wanted, 0) == 0) {
    header($http_header);
  }
}

fclose($handle);

echo $contents;
?>
