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
        $this->info(shell_exec("rm -rf rev-manifest.json"));
        $this->info(shell_exec("rm -rf dist/assets/ public/assets/"));
        $this->info(shell_exec("gulp"));
        $this->info(shell_exec("npm run prod"));
        File::put("dist/index.html", view("offline")->render());
        $this->info(shell_exec("cp -r public/assets dist/assets"));
    }
}
