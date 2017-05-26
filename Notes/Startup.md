## What I need to do on every instance

ssh -i "runtime.pem" IP

git clone https://github.com/alanbuzdar/NodeJS-Runtime.git

sudo apt-get install nodejs

sudo apt-get update

sudo apt-get install npm

sudo apt-get install nodejs-legacy

cd NodeJS-Runtime/websockets

npm install

npm install --save-optional bufferutil

npm install --save-optional utf-8-validate


nodejs --nouse-idle-notification --max-old-space-size=4096 index.js

nodejs --nouse-idle-notification --max-old-space-size=4096 client.js

--nouse-idle-notification = Don't use incremental GC

--Old space size = size of "old space" in heap for GC

sudo vim /etc/security/limits.d/custom.conf

root soft nofile 1000000
root hard nofile 1000000
* soft nofile 1000000
* hard nofile 1000000

sudo vim /etc/sysctl.conf

fs.file-max = 1000000
fs.nr_open = 1000000
net.ipv4.netfilter.ip_conntrack_max = 1048576
net.nf_conntrack_max = 1048576

### 
sudo su

echo "1024 65535" >/proc/sys/net/ipv4/ip_local_port_range

exit

 nodejs --print_cumulative_gc_stat  --max-old-space-size=2000 --max-semi-space-size=2000 --nouse-idle-notification --noconcurrent_sweeping --trace_gc_ignore_scavenger index.js