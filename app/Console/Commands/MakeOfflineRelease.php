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
        $this->info("Deleting existing assets");
        File::deleteDirectory(base_path("dist/assets"));

        $this->info("Building assets with Vite");
        shell_exec("npm run build");

        $manifestPath = public_path("assets/manifest.json");
        if (file_exists($manifestPath)) {
            $this->info(file_get_contents($manifestPath));
        }
        
        $this->info("Rendering Blade template");
        File::put("dist/index.html", view("offline")->render());
        
        $this->info("Copying over assets to dist/");
        File::copyDirectory(public_path("assets"), base_path("dist/assets"));
    }
}
