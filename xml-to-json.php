<?php

/**
* MAX_AGE in seconds for caching. Redirects to JSON are needed
* to reduce total transfer time, as PHP gzip is much slower
* than loading JSON w/ mod_deflate/htaccess, so question
* is how long should we allow cached objects to be considered
* fresh. Default is 0. Set to 30 or other for feeds that aren't
* updated that often
*/
$MAX_AGE=0;

header("Access-Control-Allow-Origin: *");
header('Cache-Control: max-age=0');
header("Connection: close");

$url = $_GET['url'];

//Whitelist domains, don't let everything through
preg_match('/(https:\/\/feeds.groupninemedia.com|http:\/\/feeds.watchstadium.com)/', $url, $matches);

if(!sizeof($matches)){
	header('Status: 400');
	die('{"status":"Invalid host url, not in whitelist"}');
}

//Options request? Send 200
if($_SERVER['REQUEST_METHOD'] === 'OPTIONS'){
    header('Status: 200');
    exit;
}

$file = 'cache/' . md5($url) . '.json';

//Serve from cache if new enough
if(file_exists($file) && time()-filemtime($file) < $MAX_AGE){
    header('Location: ' . $file);
    exit;
}

//Get source xml directly, save to cache, and then serve redirect to newly cached file
require_once('xmlParser.php');
$xml = file_get_contents($url);

if($xml){
    if(file_put_contents($file, namespacedXMLToArray($xml))){
        header('Location: ' . $file);
        exit;
    }
}

//for files that weren't written or xml that we couldn't obtain, send error
header('Status: 500');
echo '{"status": "error"}';
?>
