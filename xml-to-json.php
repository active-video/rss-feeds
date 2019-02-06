<?php
ob_start('ob_gzhandler');

header('Content-Type: application/json');
header('Cache-Control: max-age=2');


$url = $_GET['url'];

//Whitelist domains, don't let everything through
preg_match('/(https:\/\/feeds.groupninemedia.com|http:\/\/feeds.watchstadium.com)/', $url, $matches);

if(!sizeof($matches)){
	header('Status: 400');
	die('{"status":"Invalid host url, not in whitelist"}');
}

require_once('xmlParser.php');

$xml = file_get_contents($url);

echo namespacedXMLToArray($xml);

header('Content-Length: '.ob_get_length());
ob_end_flush(); // Flush the outer ob_start()
?>
