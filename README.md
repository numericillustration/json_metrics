json_metrics
============

A pluggable [Node.js][node] statsd backend that periodically flushes aggregated data to downstream statsd daemons as json.

I needed a statsd backend that would send info to Splunk at the flush interval like wanelo/gossip_girl but send it in json format so that the information was structured and auto-parsable.

Since gossip_girl mentioned its similarity to the repeater backend, I went and essentially took the repeater code and blended in a few ideas from gossip_girl to get what I needed.

In addition to the data and the aggregation statistics that statsd sends, I've added a context hash since theres a bunch of NAT in the environment I use this in so I wanted a way to pass along hostnames and AWS node id, AWS region, and Chef Environment.


Installation and Configuration
------------------------------

 * Put json_metrics.js into your statsd backends directory
 * Add it to the backends array and its config parameter hash to your statsd config file.  Everything but the json_metrics section is detailed in the statsd config documentation.  json_metrics accepts an array of host/port combos to forward data to multiple other hosts like some other statsd backends.  The context hash is any key/value data you want sent along with the aggregated data.  I put it in for the sake of identifying hosts across NAT but it is an arbitrary key value hash that just gets sent along in the json data.    

```
{
    "port": 8125
    ,"automaticConfigReload": false
    ,"debug": false
    ,"log": {
        "backend": "stdout"
       ,"level": "info"
    }
    ,"flushInterval": "10000"
    ,"dump": "false"
    ,"deleteIdleStats": "true"
    ,"backends": [
        "./backends/json_metrics"
    ]
    ,"flushInterval": 10000
    ,"dumpMessages": false
    ,"json_metrics": {
        "hosts":[
            {"host":"10.7.0.1","port":"666"}
            ,{"host":"192.168.1.42","port":"42"}
        ]
        ,"context":{
            "name":"fancy_hostname"
            ,"nodeid":"i-<idnumgoeshere>"
            ,"region":"<an AWS region>"
            ,"chef_environment":"foo"
        }
    }
}
```

* Start the statsd daemon:

    node stats.js /path/to/config

[node]: http://nodejs.org



Thanks
------

Inspired by wanelo/gossip_girl and the repeater backend
Many thanks to the Etsy team for: https://github.com/etsy/statsd
Also thanks to Gautam for assistance with understanding the node code, and general programming mentorship https://github.com/gdey
