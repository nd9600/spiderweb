<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >

    <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
    >
    <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
    >
    <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
    >
    <link
        rel="manifest"
        href="/site.webmanifest"
    >

    <!-- CSRF Token -->
    <meta
        name="csrf-token"
        content="{{ csrf_token() }}"
    >

    <title>
        @yield('title', "Spiderweb")
    </title>

    <!-- Scripts -->

    <!-- Styles via Vite -->
    @if(app()->environment('local'))
        <script type="module" src="http://localhost:5173/@vite/client"></script>
        <script type="module" src="http://localhost:5173/resources/assets/js/src/entries/styles-app.js"></script>
        <script type="module" src="http://localhost:5173/resources/assets/js/src/entries/styles-tailwind.js"></script>
    @else
        @php
            $viteManifestPath = public_path('manifest.json');
            $viteManifest = file_exists($viteManifestPath) ? json_decode(file_get_contents($viteManifestPath), true) : [];
            $viteCssLinks = function(string $entry) use ($viteManifest) {
                if (!isset($viteManifest[$entry])) { return ''; }
                $item = $viteManifest[$entry];
                $tags = [];
                if (!empty($item['css'])) {
                    foreach ($item['css'] as $css) {
                        $tags[] = '<link rel="stylesheet" href="/' . $css . '">';
                    }
                }
                return implode("\n", $tags);
            };
            echo $viteCssLinks('app');
            echo $viteCssLinks('tailwind.min');
        @endphp
    @endif
</head>
<body>
    @yield("appContent")
</body>
</html>
