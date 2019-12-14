#!/usr/bin/env bash

mysql -u root --password=changeme --default-character-set=utf8 "DROP DATABASE IF EXISTS `spiderweb`;"
mysql -u root --password=changeme --default-character-set=utf8 "CREATE DATABASE `spiderweb`;"
php artisan migrate:refresh
