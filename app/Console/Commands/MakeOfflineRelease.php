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
        $this->info("Cleaning previous builds");
        shell_exec("rm -rf dist/ public/dist/");
        
        $this->info("Building with Vite");
        $buildResult = shell_exec("npm run build 2>&1");
        
        if (strpos($buildResult, 'error') !== false || strpos($buildResult, 'Error') !== false) {
            $this->error("Build failed:");
            $this->error($buildResult);
            return;
        }
        
        $this->info("Build completed successfully");
        
        $this->info("Creating dist directory");
        shell_exec("mkdir -p dist");
        
        $this->info("Copying Vite build output to dist/");
        shell_exec("cp -r public/dist/* dist/");
        
        $this->info("Copying index.html to dist/");
        shell_exec("cp index.html dist/");
        
        $this->info("Updating asset paths in dist/index.html");
        $this->updateAssetPaths();
        
        $this->info("Offline release created in dist/ directory");
        $this->info("You can now open dist/index.html in a browser");
    }
    
    private function updateAssetPaths(): void
    {
        $indexPath = base_path('dist/index.html');
        $content = file_get_contents($indexPath);
        
        // Find the built JS file (Vite generates hashed filenames)
        $assetsDir = base_path('dist/assets');
        $jsFiles = glob($assetsDir . '/main-*.js');
        $cssFiles = glob($assetsDir . '/main-*.css');
        
        if (!empty($jsFiles)) {
            $jsFile = basename($jsFiles[0]);
            // Update script src to point to the built assets
            $content = preg_replace(
                '/src="\/resources\/assets\/js\/src\/main\.ts"/',
                'src="./assets/' . $jsFile . '"',
                $content
            );
        } else {
            $this->warn("No built JS file found, checking for main.js");
            // Fallback to main.js if no hashed file found
            if (file_exists($assetsDir . '/main.js')) {
                $content = preg_replace(
                    '/src="\/resources\/assets\/js\/src\/main\.ts"/',
                    'src="./assets/main.js"',
                    $content
                );
            }
        }
        
        // Add any built CSS files
        if (!empty($cssFiles)) {
            $cssFile = basename($cssFiles[0]);
            $cssLink = '<link rel="stylesheet" href="./assets/' . $cssFile . '">';
            $content = str_replace('</head>', $cssLink . "\n</head>", $content);
        }
        
        file_put_contents($indexPath, $content);
        
        $this->info("Updated asset paths in index.html");
        if (!empty($jsFiles)) {
            $this->info("JS: ./assets/" . basename($jsFiles[0]));
        }
        if (!empty($cssFiles)) {
            $this->info("CSS: ./assets/" . basename($cssFiles[0]));
        }
    }
}
