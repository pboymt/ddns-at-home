#! /bin/bash

cronsh="#! /bin/bash\\ncd $PWD\\nnode lib/index.js"

shpath="$PWD/ddns.sh"

echo $cronsh > $shpath

chmod +x $shpath

cronjob="*/15 * * * * . \$HOME/.profile; sh $shpath >> $PWD/ddns.log"

(crontab -u $USER -l; echo "$cronjob" ) | crontab -u $USER -
