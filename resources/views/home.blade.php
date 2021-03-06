@extends('layouts.appOnline')

@section('content')
<div class="container">
    <h1 class="h h--1">
        Spiderweb
    </h1>

    <div>
        @if (session('status'))
            <div class="alert alert-success" role="alert">
                {{ session('status') }}
            </div>
        @endif

        Logged in
    </div>

    <div id="app"></div>
</div>
@endsection
