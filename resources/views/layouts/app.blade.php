<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport"
        content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token"
        content="{{ csrf_token() }}">

    <title>
        @yield('title', "Spiderweb")
    </title>

    <!-- Scripts -->

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}"
        rel="stylesheet">
    <link href="{{ asset('css/tailwind.min.css') }}"
        rel="stylesheet">
</head>
<body>
<div id="app">
    <nav class="flex flex-row border-b pb-2 border-gray-300">
        <a
            class="link mr-10"
            href="{{ url('/home') }}"
        >
            @yield('navbarTitle', "Spiderweb")
        </a>

        <span>
            <span>
                    @guest
                    <a class="link mr-3"
                        href="{{ route('login') }}">{{ __('Login') }}</a>
                    <a class="link"
                        href="{{ route('register') }}">{{ __('Register') }}</a>
                @else
                    <form id="logout-form"
                        action="{{ route('logout') }}"
                        method="POST">
                        @csrf
                        <button type="submit">
                            {{ __('Logout') }}
                        </button>
                    </form>
                @endguest
            </span>

            <span>
            </span>
        </span>
    </nav>

    <main>
        @yield('content')
    </main>
</div>
</body>
</html>
