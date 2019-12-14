@extends('layouts.app')

@section('content')
<div class="container">
    <h1 class="h h--1">
        Web
    </h1>

    <div class="">
        @if (session('status'))
            <div class="alert alert-success" role="alert">
                {{ session('status') }}
            </div>
        @endif

        Logged in
    </div>

    <div id="app"></div>
</div>

<script src="{{ Helper::getAssetPath('js/vendors.js') }}"></script>
<script src="{{ Helper::getAssetPath('js/test.js') }}"></script>
@endsection
