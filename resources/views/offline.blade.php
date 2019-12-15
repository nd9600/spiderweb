@extends('layouts.app')

@section("appContent")
<div class="container">
    <h1 class="h h--1">
        Spiderweb
    </h1>
    <h2 class="h h--2">
        Offline
    </h2>
    <div id="offlineTreeApp"></div>
</div>

<script src="{{ Helper::getAssetPath('js/vendors.js') }}"></script>
<script src="{{ Helper::getAssetPath('js/offline/tree.js') }}"></script>
@endsection