# Spiderweb

See [the wiki](https://wiki.nd9600.download/spiderweb) for more info

## Intro
Spiderweb lets you
* make _posts_
* add those posts to _graphs_
* _link_ the posts together
* view the graphs of posts you've made - you can look at more than one graph at a time

![Spiderweb's UI](https://user-images.githubusercontent.com/9141675/73142284-e0d2e600-4084-11ea-92e1-30103daa7b95.png)

## Usage
### Offline version
Download a [release](https://github.com/nd9600/spiderweb/releases), then unzip it, and open `offline.html` in a browser.

I'd recommend going to the "load/save" tab first,  uploading the `spiderwebExport-xx.json` file that's in the release, and pressing "import", to see what the app looks like with data in it.

### Online version
I haven't made it yet

## Development
### Offline
To work on the offline version:


1. You need [Node](https://nodejs.org/en/) ([NVM](https://github.com/nvm-sh/nvm) is good for this) and [Gulp](https://gulpjs.com/docs/en/getting-started/quick-start), then
2. `git clone git@github.com:nd9600/spiderweb.git && cd spiderweb`
3. `npm install && gulp && npm run dev`
4. Copy the `assets` folder from `public/` into `dist`/
5. Then you can open `dist/offline.html` and it should load - you might need to change the URLs to the JS files in the `<script>`s at the bottom to get it to work

### Online
To work on the online version:

1. Install [PHP](https://www.php.net/), [Node](https://nodejs.org/en/) ([NVM](https://github.com/nvm-sh/nvm) is good for this)  and [Gulp](https://gulpjs.com/docs/en/getting-started/quick-start), [Composer](https://getcomposer.org/doc/00-intro.md), for PHP package management, and MySQL for your system (be sure to include any PHP extensions Composer needs, like `php-mysql` or `php-mbstring`)
2. `git clone git@github.com:nd9600/spiderweb.git && cd spiderweb`
3. `composer install`
4. `npm install && gulp && npm run dev`
5. `php artisan serve`, then it'll be available on `localhost:8000`
