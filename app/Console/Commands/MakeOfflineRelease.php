<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MakeOfflineRelease extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'offline_release:make';

    protected $description = 'Makes a new offlnie release in `dist`';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info("Deleting existing manifest");
        shell_exec("rm rev-manifest.json");
    
        $this->info("Deleting existing assets");
        shell_exec("rm -rf dist/assets/ public/assets/");
        
        $this->info("Compiling CSS");
        shell_exec("gulp");
        
        $this->info("Transpiling JS");
        shell_exec("npm run prod");
        
        $this->info(file_get_contents("rev-manifest.json"));
        
        $this->info("Rendering Blade template");
        File::put("dist/index.html", view("offline")->render());
        
        $this->info("Copying over assets to dist/");
        shell_exec("cp -r public/assets dist/assets");
    }
}
