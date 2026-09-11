<?php
require_once __DIR__ . '/config/config.php';
do_logout();
redirect(BASE_URL . '/login.php');
