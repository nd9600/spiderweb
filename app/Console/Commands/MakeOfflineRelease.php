<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
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
        $this->info("Building standalone offline app with Vite");
        shell_exec("npm run build");

        if (file_exists(base_path("dist/index.html"))) {
            $this->info("Wrote dist/index.html");
        }
    }
}
