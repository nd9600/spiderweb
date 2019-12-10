@extends('layouts.app')

@section('content')
    <div>
        <p class="mb-5">
            Blogs, Twitter, webs
        </p>
        <a
            class="mt-5 link"
            href="{{ url('/offline') }}"
        >
            Offline
        </a>
    </div>
@endsection