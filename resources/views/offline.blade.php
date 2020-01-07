@extends('layouts.app')

@section("appContent")
<div class="min-h-full h-full ml-5">
    <h1 class="h h--1">
        Spiderweb
    </h1>
    <h2 class="h h--2">
        Offline
    </h2>
    <div
        id="offlineGraphApp"
        class="h-full"
    ></div>
</div>

<script src="{{ Helper::getAssetPath('js/vendors.js') }}"></script>
<script src="{{ Helper::getAssetPath('js/offline/graph.js') }}"></script>
@endsection