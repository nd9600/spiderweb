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
</div>
@endsection
