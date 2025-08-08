@extends('layouts.app')

@section("appContent")
<div class="min-h-full h-full">
    <div class="ml-5">
        <h1 class="h h--1">
            Spiderweb
        </h1>
    </div>
    <noscript>
        <h2 class="h h--2">
            Spiderweb needs Javascript to be enabled for it to work, please turn it on
        </h2>
    </noscript>
    <div
        id="offlineGraphApp"
        class="min-h-full h-full"
    ></div>
</div>

@if(app()->environment('local'))
    <script type="module" src="http://localhost:5173/resources/assets/js/src/offline/graph.js"></script>
@else
    @php
        $viteManifestPath = base_path('dist/manifest.json');
        $viteManifest = file_exists($viteManifestPath) ? json_decode(file_get_contents($viteManifestPath), true) : [];
        $entry = $viteManifest['resources/assets/js/src/offline/graph.js'] ?? null;
        if ($entry) {
            if (!empty($entry['css'])) {
                foreach ($entry['css'] as $css) {
                    echo '<link rel="stylesheet" href="/dist/' . $css . '">';
                }
            }
            echo '<script type="module" src="/dist/' . $entry['file'] . '"></script>';
        }
    @endphp
@endif
@endsection