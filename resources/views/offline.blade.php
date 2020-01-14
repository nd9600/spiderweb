@extends('layouts.app')

@section("appContent")
<div class="min-h-full h-full">
    <div class="ml-5">
        <h1 class="h h--1">
            Spiderweb
        </h1>
    </div>
    <div
        id="offlineGraphApp"
        class="min-h-full h-full"
    ></div>
</div>

<script src="{{ Helper::getAssetPath('js/vendors.js') }}"></script>
<script src="{{ Helper::getAssetPath('js/offline/graph.js') }}"></script>
@endsection