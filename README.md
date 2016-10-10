# block i/o simulation

There are 4 routes defined in the project:
- route / : route that responds with a string without blocking something
- route /block-me-now : there is an infinite loop defined in the business logic and this will block everything
- route /no-fs : this route is returning back an html document that we' ve scaned using fs on the boot of the project
- route /touch-fs : this route is returning back an html document but we scan the file system on every request to get the contents of the html doc

The most dangerous route is the /block-me-now. When we fire a request to this route, this will never return a respnse to the client. This is the minor side effect of this route, the major side effect is that it will block all the other incoming requests and it will make the server completely unavailable. We can see this in action if we do the following steps:
1. Access the / route from the browser
2. Access the /block-me-now route from the browser (the response will never come back)
3. Access again the /route from the browser (or any other route). You will never get a response back.

The other comparison that we can do and will help us understand that we should avoid having fs scanning on per request basis. The /no-fs and the /touch-fs routes are returning back exactly the same response. There is a major difference, though. The no-fs route is using a cached variable that we 've defined on the boot of the application and the /touch-fs is touching the file system on per request basis. It is opening the file, read the content, assign to the a variable and send the back to the client. Here are some simple benchmarks to see the difference. I've used apache ab to load test this small project and I have an ssd on my laptop. To summarize:

10000 requests with 1000 concurrency the server needed 3.291ms to respond for every request when we 've used the fs route
10000 requests with 1000 concurrency the server needed 1.756ms to respond for every request when we 've used the no fs route

## touch-fs
```
$ ab -n 10000 -c 1000 http://localhost:3000/touch-fs
This is ApacheBench, Version 2.3 <$Revision: 1528965 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        
Server Hostname:        localhost
Server Port:            3000

Document Path:          /touch-fs
Document Length:        232308 bytes

Concurrency Level:      1000
Time taken for tests:   32.907 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      2325100000 bytes
HTML transferred:       2323080000 bytes
Requests per second:    303.89 [#/sec] (mean)
Time per request:       3290.665 [ms] (mean)
Time per request:       3.291 [ms] (mean, across all concurrent requests)
Transfer rate:          69001.42 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0 1278 2002.6      0   15036
Processing:    47 1032 2121.7    781   25867
Waiting:       44 1017 2086.4    779   25860
Total:         77 2309 3399.1    930   32880

Percentage of the requests served within a certain time (ms)
  50%    930
  66%   1845
  75%   3683
  80%   3745
  90%   3862
  95%   7829
  98%   9110
  99%  21166
 100%  32880 (longest request)
```

## no-fs
```
$ ab -n 10000 -c 1000 http://localhost:3000/no-fs
This is ApacheBench, Version 2.3 <$Revision: 1528965 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        
Server Hostname:        localhost
Server Port:            3000

Document Path:          /no-fs
Document Length:        232308 bytes

Concurrency Level:      1000
Time taken for tests:   17.563 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      2325100000 bytes
HTML transferred:       2323080000 bytes
Requests per second:    569.37 [#/sec] (mean)
Time per request:       1756.317 [ms] (mean)
Time per request:       1.756 [ms] (mean, across all concurrent requests)
Transfer rate:          129282.18 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0  976 2547.2      0   15034
Processing:    10  504 203.7    502    2494
Waiting:       10  500 184.5    502    2171
Total:         53 1480 2673.8    547   17522

Percentage of the requests served within a certain time (ms)
  50%    547
  66%   1389
  75%   1484
  80%   1503
  90%   3366
  95%   3665
  98%  15971
  99%  16089
 100%  17522 (longest request)
```