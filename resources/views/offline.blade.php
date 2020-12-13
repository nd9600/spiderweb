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

<script src="{{ Helper::getAssetPath('js/vendors.js') }}"></script>
<script src="{{ Helper::getAssetPath('js/offline/graph.js') }}"></script>
@endsection