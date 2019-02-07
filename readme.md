# RSS feed viewer

To add/modify feeds:

1. Edit feeds.html and change the values in the `<option>`
2. Edit xml-to-json and adjust the whitelist regex to allow additional domains, this protects against malicious or unauthorized usage.


## Server Requirements

1. PHP
2. Apache

Recommended: Generally these modules are installed by default on most shared hosting servers:

1. mod_deflate.c (apache module)
2. mod_headers.c (apache module)
