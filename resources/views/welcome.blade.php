@extends('layouts.appOnline')

@section('content')
    <div>
        <p class="mb-5">
            Blogs, Twitter, webs
        </p>
        <a
            class="mt-5 link"
            href="{{ route('offline') }}"
        >
            Offline
        </a>
    </div>
@endsection