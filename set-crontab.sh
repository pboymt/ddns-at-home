#! /bin/bash

cronsh="#! /bin/bash\nsource /etc/profile\ncd $PWD\nnode lib/index.js"

shpath="$PWD/ddns.sh"

echo -e $cronsh >> $shpath

chmod +x $shpath

cronjob="*/15 * * * * $shpath >> $PWD/ddns.log"

(crontab -u $USER -l; echo "$cronjob" ) | crontab -u $USER -
