## What I need to do on every instance

ssh -i "runtime.pem" IP

https://github.com/alanbuzdar/NodeJS-Runtime.git

node --nouse-idle-notification--max-new-space-size=2048--max-old-space-size=4096 ./server/websocketserver.js

/etc/security/limits.d/custom.conf

root soft nofile 1000000
root hard nofile 1000000
* soft nofile 1000000
* hard nofile 1000000

/etc/sysctl.conf

fs.file-max = 1000000
fs.nr_open = 1000000
net.ipv4.netfilter.ip_conntrack_max = 1048576
net.nf_conntrack_max = 1048576