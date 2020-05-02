# Spiderweb

See [the wiki](https://wiki.nd9600.download/spiderweb) for more info

## Introduction
Spiderweb lets you
* make _posts_
* add those posts to _graphs_
* _link_ the posts together
* view the graphs of posts you've made - you can look at more than one graph at a time

![Spiderweb's UI](https://user-images.githubusercontent.com/9141675/80801405-33e89780-8ba4-11ea-9bf6-19d115c6a402.png)

---

I'm primarily making Spiderweb for myself, but I'll happily take feature requests.

## Usage
### Offline version
Download a [release](https://github.com/nd9600/spiderweb/releases), then unzip it, and open `index.html` in a browser.

When you start Spiderweb for the first time, you'll only have 1 graph, the `default` one. You'll want to add posts to it by clicking the little red circle in the bottom-right, then press `Add post` - you can choose whether or not you want it to attached to one (or more) of your graphs.

If you don't attach it to a graph straightaway, later on you can click the red circle again and press `Attach posts to graphs` - the same post can be in multiple graphs.

When you have more than one post in a graph, you can link them together with "Add link between posts". You can also change or remove a link in the bottom-right menu too.

You can make a new graph and change or remove any existing one (any posts that were atached to it won't be removed) in the `Graphs` tab.

The `Load/save` tab lets you import and export your data and settings.

Inside the `Settings` tab you can choose 
* whether you want your data to be saved automatically
* if your data should be synced to a [Firebase Realtime Database](https://firebase.google.com/docs/database)

etc.



---

Posts, links and graphs are all kinda independent:
* You can make a post by itself, without linking it to another one, or adding it to a graph.
* You can add a post to a graph without linking it to another post
* After you've made a post, you can link to many others - you don't need to link the post while you create it
* Deleting a link doesn't delete either the source or the target post
* Deleting a graph doesn't delete the posts in it, only the links - you can add the posts to another graph

### Online version
I haven't made it yet

## Development
### Offline
To work on the offline version:


1. You need [Node](https://nodejs.org/en/) ([NVM](https://github.com/nvm-sh/nvm) is good for this) and [Gulp](https://gulpjs.com/docs/en/getting-started/quick-start), then
2. `git clone git@github.com:nd9600/spiderweb.git && cd spiderweb`
3. `npm install && gulp && npm run dev`
4. Copy the `assets` folder from `public/` into `dist`/
5. Then you can open `dist/index.html` and it should load - you might need to change the URLs to the JS files in the `<script>`s at the bottom to get it to work

### Online
To work on the online version:

1. Install [PHP](https://www.php.net/), [Node](https://nodejs.org/en/) ([NVM](https://github.com/nvm-sh/nvm) is good for this)  and [Gulp](https://gulpjs.com/docs/en/getting-started/quick-start), [Composer](https://getcomposer.org/doc/00-intro.md), for PHP package management, and MySQL for your system (be sure to include any PHP extensions Composer needs, like `php-mysql` or `php-mbstring`)
2. `git clone git@github.com:nd9600/spiderweb.git && cd spiderweb`
3. `composer install`
4. `npm install && gulp && npm run dev`
5. `php artisan serve`, then it'll be available on `localhost:8000`

## Known bugs/limitations
If you find any more bugs, I'd appreciate it if you made [an issue](https://github.com/nd9600/spiderweb/issues/new).

### Focusing on posts on phones in landscape
Focusing on a post (by pressing the little magnifying glass) works perfectly fine on a desktop, and on a phone in portrait, but on a phone in landscape (on my phone, at least), it zooms the graph over to a position where the post is _almost_ visible, but not quite.

I'm not sure how to fix this; the way I see the `<svg>` element that holds the graph works, on a desktop it's full-size, showing everything it's supposed to. On a phone, it "clips" the SVG like a little window over the whole thing, so you can only see a small bit of it at a time. 

I've made the focusing center the graph so that it looks good on a desktop and on a portrait phone, but I don't think I can get it to also show the post on a landscape phone at the same time.

(imagine a little portrait phone over the top-left corner of the graph, and a landscape one; it's hard to get them to overlap and show the same bit of the graph in a way that you can actually see a post's full title)

## QTWPBFAIIHU
Questions that would probably be frequently asked if I had users

### Why does Spiderweb [x]?
I've made Spiderweb for myself, so right now it only does what I want or need it to do. If you'd like it to do something, just shoot me an [issue](https://github.com/nd9600/spiderweb/issues/new).

### Why doesn't Spiderweb [x]?
Either
* I don't want it to do that
* I _do_ want it to, but I can't be bothered making it or it's too hard