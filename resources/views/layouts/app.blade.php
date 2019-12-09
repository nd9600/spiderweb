<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>
        @yield('title', "Spiderweb")
    </title>

    <!-- Scripts -->

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <link href="{{ asset('css/tailwind.css') }}" rel="stylesheet">
</head>
<body>
    <div id="app">
        <nav>
            <a href="{{ url('/home') }}">
                @yield('navbarTitle', "Spiderweb")
            </a>

            <div>
                <!-- Left Side Of Navbar -->
                <ul class=""></ul>

                <!-- Right Side Of Navbar -->
                <ul class="">
                    <!-- Authentication Links -->
                    @guest
                        <a class="nav-link" href="{{ route('login') }}">{{ __('Login') }}</a>
                        <a class="nav-link" href="{{ route('register') }}">{{ __('Register') }}</a>
                    @else
                        <form id="logout-form" action="{{ route('logout') }}" method="POST">
                            @csrf
                            <button type="submit">
                                {{ __('Logout') }}
                            </button>
                        </form>
                    @endguest
                </ul>
            </div>
        </nav>

        <main class="py-4">
            @yield('content')
        </main>
    </div>
</body>
</html>
