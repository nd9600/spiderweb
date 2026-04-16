<?php
declare(strict_types=1);

namespace App\Helpers;

use Illuminate\Support\HtmlString;

class Helper
{
    private static function getViteManifest(): array
    {
        static $manifest;

        if (is_array($manifest)) {
            return $manifest;
        }

        $manifestPath = public_path("assets/manifest.json");
        if (!file_exists($manifestPath)) {
            $manifest = [];
            return $manifest;
        }

        $decodedManifest = json_decode(file_get_contents($manifestPath), true);
        $manifest = is_array($decodedManifest)
            ? $decodedManifest
            : [];

        return $manifest;
    }

    private static function getSourcePath(string $filename): string
    {
        if (strpos($filename, "resources/") === 0) {
            return $filename;
        }

        return "resources/assets/{$filename}";
    }

    public static function getAssetPath(string $filename): string
    {
        $manifest = self::getViteManifest();
        $sourcePath = self::getSourcePath($filename);

        if (isset($manifest[$sourcePath]["file"])) {
            return "assets/" . $manifest[$sourcePath]["file"];
        }

        return "assets/{$filename}";
    }

    private static function collectEntryAssets(
        string $filename,
        array &$stylesheets,
        array &$modulePreloads,
        array &$visitedEntries
    ): ?array {
        $manifest = self::getViteManifest();
        $sourcePath = self::getSourcePath($filename);

        if (!isset($manifest[$sourcePath])) {
            return null;
        }

        self::collectManifestAssets($manifest, $sourcePath, $stylesheets, $modulePreloads, $visitedEntries);

        return $manifest[$sourcePath];
    }

    private static function collectManifestAssets(
        array $manifest,
        string $entryKey,
        array &$stylesheets,
        array &$modulePreloads,
        array &$visitedEntries
    ): void {
        if (isset($visitedEntries[$entryKey]) || !isset($manifest[$entryKey])) {
            return;
        }

        $visitedEntries[$entryKey] = true;
        $entry = $manifest[$entryKey];

        if (isset($entry["css"])) {
            foreach ($entry["css"] as $stylesheet) {
                if (!in_array($stylesheet, $stylesheets, true)) {
                    $stylesheets[] = $stylesheet;
                }
            }
        }

        if (isset($entry["imports"])) {
            foreach ($entry["imports"] as $importKey) {
                if (isset($manifest[$importKey]["file"]) && !in_array($manifest[$importKey]["file"], $modulePreloads, true)) {
                    $modulePreloads[] = $manifest[$importKey]["file"];
                }

                self::collectManifestAssets($manifest, $importKey, $stylesheets, $modulePreloads, $visitedEntries);
            }
        }
    }

    public static function renderStyleEntryTags(string $filename): HtmlString
    {
        $stylesheets = [];
        $modulePreloads = [];
        $visitedEntries = [];
        $entry = self::collectEntryAssets($filename, $stylesheets, $modulePreloads, $visitedEntries);

        if ($entry === null) {
            return new HtmlString("");
        }

        $tags = array_map(
            static function (string $stylesheet): string {
                return '<link href="assets/' . $stylesheet . '" rel="stylesheet">';
            },
            $stylesheets
        );

        return new HtmlString(implode(PHP_EOL, $tags));
    }

    public static function renderScriptEntryTags(string $filename): HtmlString
    {
        $stylesheets = [];
        $modulePreloads = [];
        $visitedEntries = [];
        $entry = self::collectEntryAssets($filename, $stylesheets, $modulePreloads, $visitedEntries);

        if ($entry === null || !isset($entry["file"])) {
            return new HtmlString("");
        }

        $tags = [];

        foreach ($stylesheets as $stylesheet) {
            $tags[] = '<link href="assets/' . $stylesheet . '" rel="stylesheet">';
        }

        foreach ($modulePreloads as $modulePreload) {
            $tags[] = '<link href="assets/' . $modulePreload . '" rel="modulepreload">';
        }

        $tags[] = '<script type="module" src="assets/' . $entry["file"] . '"></script>';

        return new HtmlString(implode(PHP_EOL, $tags));
    }
}
