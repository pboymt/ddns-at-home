#! /bin/bash

cronsh="#! /bin/bash\ncd $PWD\nnode lib/index.js"

shpath="$PWD/ddns.sh"

echo cronsh >> shpath

cronjob="*/15 * * * * $shpath"

(crontab -u $USER -l; echo "$cronjob" ) | crontab -u $USER -
