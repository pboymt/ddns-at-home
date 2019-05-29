#! /bin/bash

nodepath=`which node`

cronsh="#! /bin/bash\\ncd $PWD\\n$nodepath lib/index.js"

shpath="$PWD/ddns.sh"

echo $cronsh > $shpath

chmod +x $shpath

cronjob="*/15 * * * * sh $shpath >> $PWD/ddns.log"

(crontab -u $USER -l; echo "$cronjob" ) | crontab -u $USER -
