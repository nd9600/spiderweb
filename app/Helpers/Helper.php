<?php
declare(strict_types=1);

namespace App\Helpers;

class Helper
{
    public static function getAssetPath(string $filename): string
    {
        $assetPath = "assets/{$filename}";
        $manifest = json_decode(file_get_contents(base_path() . "/rev-manifest.json"), true);
        if (isset($manifest[$assetPath])) {
            return $manifest[$assetPath];
        } else {
            return $assetPath;
        }
    }
}